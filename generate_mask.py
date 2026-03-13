"""
Generate a 3D-printable mask (STEP file) for the UFC touchscreen overlay.
Target display: Generic 7" HDMI 1024x600, active area ~154mm x 86mm.

The mask is a thin plate with cutouts for all interactive elements,
plus a lip on top, left, and right edges to hang on the screen bezel.
"""

import cadquery as cq

# ─── Display / Viewport Constants ─────────────────────────────────────
VIEWPORT_W = 1024  # px
VIEWPORT_H = 600   # px
DISPLAY_W = 154.0   # mm  (active area width)
DISPLAY_H = 86.0    # mm  (active area height)

# Conversion factors
PX_TO_MM_X = DISPLAY_W / VIEWPORT_W  # ~0.1504 mm/px
PX_TO_MM_Y = DISPLAY_H / VIEWPORT_H  # ~0.1433 mm/px

# Mask parameters
MASK_THICKNESS = 2.0  # mm
CORNER_RADIUS = 1.5   # mm  (outer corners of mask)
CUTOUT_PADDING = 0.8  # mm  extra padding around each cutout for tolerance
ROUND_CUTOUT_PAD = 0.5 # mm extra radius for round cutouts

# Bezel: extra material around the active display area for mounting
# Expanded: +3mm on top, left, and right
BEZEL_TOP = 7.0      # was 4, +3mm
BEZEL_BOTTOM = 4.0   # unchanged (no lip on bottom)
BEZEL_LEFT = 7.0     # was 4, +3mm
BEZEL_RIGHT = 7.0    # was 4, +3mm

TOTAL_W = BEZEL_LEFT + DISPLAY_W + BEZEL_RIGHT
TOTAL_H = BEZEL_TOP + DISPLAY_H + BEZEL_BOTTOM

# Lip parameters (wraps around the screen edge)
LIP_THICKNESS = 1.5   # mm  (how thick the lip wall is)
LIP_DEPTH = 4.0       # mm  (how far it extends behind the screen)


def px_to_mm(x_px, y_px, w_px, h_px):
    """Convert pixel rect to mm rect relative to mask origin (bottom-left of active area)."""
    x_mm = BEZEL_LEFT + x_px * PX_TO_MM_X
    y_mm = BEZEL_BOTTOM + DISPLAY_H - (y_px + h_px) * PX_TO_MM_Y
    w_mm = w_px * PX_TO_MM_X
    h_mm = h_px * PX_TO_MM_Y
    return x_mm, y_mm, w_mm, h_mm


def add_rect_cutout(mask, x_px, y_px, w_px, h_px, pad=None, radius=1.0):
    """Cut a rounded rectangle from the mask."""
    if pad is None:
        pad = CUTOUT_PADDING
    x, y, w, h = px_to_mm(x_px, y_px, w_px, h_px)
    x -= pad
    y -= pad
    w += 2 * pad
    h += 2 * pad
    r = min(radius, w / 2 - 0.1, h / 2 - 0.1)
    if r < 0.1:
        r = 0.1
    mask = (
        mask
        .cut(
            cq.Workplane("XY")
            .moveTo(x + w / 2, y + h / 2)
            .rect(w, h)
            .extrude(MASK_THICKNESS * 2)
            .edges("|Z").fillet(r)
            .translate((0, 0, -MASK_THICKNESS / 2))
        )
    )
    return mask


def add_round_cutout(mask, cx_px, cy_px, diameter_px_avg, pad=None):
    """Cut a circular hole from the mask."""
    if pad is None:
        pad = ROUND_CUTOUT_PAD
    cx_mm = BEZEL_LEFT + (cx_px + diameter_px_avg / 2) * PX_TO_MM_X
    cy_mm = BEZEL_BOTTOM + DISPLAY_H - (cy_px + diameter_px_avg / 2) * PX_TO_MM_Y
    r_mm = (diameter_px_avg * (PX_TO_MM_X + PX_TO_MM_Y) / 2) / 2 + pad
    mask = (
        mask
        .cut(
            cq.Workplane("XY")
            .moveTo(cx_mm, cy_mm)
            .circle(r_mm)
            .extrude(MASK_THICKNESS * 2)
            .translate((0, 0, -MASK_THICKNESS / 2))
        )
    )
    return mask


# ─── Build the mask plate ─────────────────────────────────────────────
mask = (
    cq.Workplane("XY")
    .moveTo(TOTAL_W / 2, TOTAL_H / 2)
    .rect(TOTAL_W, TOTAL_H)
    .extrude(MASK_THICKNESS)
    .edges("|Z").fillet(CORNER_RADIUS)
)

# ─── Add lip on top, left, and right edges ────────────────────────────
# The lip extends downward (negative Z) from the back of the mask face,
# forming a U-shape that hooks over the screen bezel.

# Top lip — runs the full width along the top edge
top_lip = (
    cq.Workplane("XY")
    .moveTo(TOTAL_W / 2, TOTAL_H - LIP_THICKNESS / 2)
    .rect(TOTAL_W, LIP_THICKNESS)
    .extrude(-LIP_DEPTH)
)

# Left lip — runs the full height along the left edge
left_lip = (
    cq.Workplane("XY")
    .moveTo(LIP_THICKNESS / 2, TOTAL_H / 2)
    .rect(LIP_THICKNESS, TOTAL_H)
    .extrude(-LIP_DEPTH)
)

# Right lip — runs the full height along the right edge
right_lip = (
    cq.Workplane("XY")
    .moveTo(TOTAL_W - LIP_THICKNESS / 2, TOTAL_H / 2)
    .rect(LIP_THICKNESS, TOTAL_H)
    .extrude(-LIP_DEPTH)
)

mask = mask.union(top_lip).union(left_lip).union(right_lip)


# ═══════════════════════════════════════════════════════════════════════
# CUTOUTS — All positions from viewport capture at 1024×600
# ═══════════════════════════════════════════════════════════════════════

# ── Scratchpad display ────────────────────────────────────────────────
mask = add_rect_cutout(mask, 85, 29, 483, 101, radius=2.0)

# ── Numpad (individual cutouts for a nicer mask) ─────────────────────
numpad_buttons = [
    (90, 159, 155, 88),   # 1
    (249, 159, 155, 88),  # 2
    (408, 159, 155, 88),  # 3
    (90, 251, 155, 88),   # 4
    (249, 251, 155, 88),  # 5
    (408, 251, 155, 88),  # 6
    (90, 343, 155, 88),   # 7
    (249, 343, 155, 88),  # 8
    (408, 343, 155, 88),  # 9
    (90, 435, 155, 88),   # CLR
    (249, 435, 155, 88),  # 0
    (408, 435, 155, 88),  # ENT
]
for btn in numpad_buttons:
    mask = add_rect_cutout(mask, *btn, radius=1.5)

# ── OSB round buttons (60×60px) ──────────────────────────────────────
osb_positions = [
    (591, 39, 60, 60),
    (591, 144, 60, 60),
    (591, 249, 60, 60),
    (591, 353, 60, 60),
    (591, 458, 60, 60),
]
for x, y, w, h in osb_positions:
    mask = add_round_cutout(mask, x, y, (w + h) / 2)

# ── Option display lines ─────────────────────────────────────────────
option_lines = [
    (674, 29, 265, 81),
    (674, 134, 265, 81),
    (674, 238, 265, 81),
    (674, 343, 265, 81),
    (674, 447, 265, 81),
]
for opt in option_lines:
    mask = add_rect_cutout(mask, *opt, radius=1.5)

# ── Function buttons (bottom row) ────────────────────────────────────
func_buttons = [
    (43, 544, 131, 48),   # A/P
    (177, 544, 131, 48),  # IFF
    (312, 544, 131, 48),  # TCN
    (446, 544, 131, 48),  # ILS
    (581, 544, 131, 48),  # D/L
    (715, 544, 131, 48),  # BCN
    (850, 544, 131, 48),  # ON/OFF
]
for btn in func_buttons:
    mask = add_rect_cutout(mask, *btn, radius=1.5)

# ── LED indicators (bottom corners) ──────────────────────────────────
mask = add_round_cutout(mask, 8, 552, 32)
mask = add_round_cutout(mask, 984, 552, 32)

# ── I/P button (round) ───────────────────────────────────────────────
mask = add_round_cutout(mask, 27, 29, 34)

# ── ADF switch ────────────────────────────────────────────────────────
mask = add_rect_cutout(mask, 27, 67, 34, 65, radius=1.0)

# ── EMCON button ──────────────────────────────────────────────────────
mask = add_rect_cutout(mask, 954, 93, 52, 38, radius=1.0)

# ── BRT knob (round) ─────────────────────────────────────────────────
mask = add_round_cutout(mask, 962, 41, 36)

# ── COMM 1 controls (up/display/down as one cutout) ──────────────────
mask = add_rect_cutout(mask, 15, 383, 58, 137, radius=2.0)

# ── COMM 2 controls (up/display/down as one cutout) ──────────────────
mask = add_rect_cutout(mask, 951, 383, 58, 137, radius=2.0)


# ═══════════════════════════════════════════════════════════════════════
# Export
# ═══════════════════════════════════════════════════════════════════════
output_path = "ufc_mask_7inch.step"
cq.exporters.export(mask, output_path)
print(f"STEP file exported: {output_path}")
print(f"Mask dimensions: {TOTAL_W:.1f} x {TOTAL_H:.1f} x {MASK_THICKNESS:.1f} mm")
print(f"Lip: {LIP_THICKNESS}mm thick, {LIP_DEPTH}mm deep on top/left/right edges")
