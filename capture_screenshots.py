"""Capture UFC screenshots for README in all three themes."""
from playwright.sync_api import sync_playwright
import time

URL = "http://localhost:5174"
OUT_DIR = "screenshots"

THEMES = ["stealth", "viper", "hornet"]

DEMO_SCRIPT = """
// Populate displays with realistic data
const sp = document.querySelector('.ufc-scratchpad');
if (sp) sp.textContent = '254.000';

const opts = document.querySelectorAll('.ufc-opt-line');
const texts = ['1 TACAN', '2 MAGIC', '3 CORDS', '4 ELEV', '5 UFC'];
opts.forEach((el, i) => { if (texts[i]) el.textContent = texts[i]; });

const ch1 = document.querySelector('.ufc-col-left .ufc-chan-display');
if (ch1) ch1.textContent = 'G01';
const ch2 = document.querySelector('.ufc-col-right .ufc-chan-display');
if (ch2) ch2.textContent = 'M02';
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1024, "height": 600})
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    for theme in THEMES:
        # Reset theme class
        page.evaluate("""(theme) => {
            const panel = document.querySelector('.ufc-panel');
            panel.className = theme === 'stealth' ? 'ufc-panel' : 'ufc-panel theme-' + theme;
        }""", theme)

        # Inject demo data
        page.evaluate(DEMO_SCRIPT)
        time.sleep(0.3)

        path = f"{OUT_DIR}/ufc-{theme}.png"
        page.screenshot(path=path)
        print(f"Saved {path}")

    browser.close()
    print("Done!")
