# F/A-18C Hornet — Clickable Cockpit Reference

> All numeric codes resolved from `command_defs.lua` and `devices.lua`.
> Each command group resets its counter at `start_command = 3000`, so first entry = 3001.

---

## Device IDs

| ID | Name | Description |
|----|------|-------------|
| 1 | FM_PROXY | Flight Model |
| 2 | CONTROL_INTERFACE | Flight Controls |
| 3 | ELEC_INTERFACE | Electrical System |
| 4 | HYDRAULIC_INTERFACE | Hydraulic System |
| 5 | GEAR_INTERFACE | Landing Gear |
| 6 | FUEL_INTERFACE | Fuel System |
| 7 | CPT_MECHANICS | Cockpit Mechanics |
| 8 | EXT_LIGHTS | Exterior Lights |
| 9 | CPT_LIGHTS | Cockpit Lights |
| 10 | OXYGEN_INTERFACE | Oxygen (OBOGS) |
| 11 | ECS_INTERFACE | Environmental Control |
| 12 | ENGINES_INTERFACE | Engines |
| 13 | HOTAS | Stick & Throttle |
| 14 | MUX | Multiplex Manager |
| 15 | SDC | Signal Data Computer |
| 16 | MISSION_COMPUTER_NO_1 | MC1 AN/AYK-14 |
| 17 | MISSION_COMPUTER_NO_2 | MC2 AN/AYK-14 |
| 18 | FCCA | Flight Control Computer A |
| 19 | FCCB | Flight Control Computer B |
| 20 | ADC | Air Data Computer |
| 21 | ARMAMENT_COMPUTER | AYK-22 |
| 22 | CONTROL_CONVERTER | C-10382/A |
| 23 | SMS | Stores Management System |
| 24 | DIGITAL_MAP_COMPUTER | CP-1802/ASQ-196 |
| 25 | UFC | Up Front Controller |
| 26 | AAU52 | Standby Altimeter |
| 27 | AVU35 | Airspeed Indicator |
| 28 | AVU53 | Vertical Speed Indicator |
| 29 | STANDBY_COMPASS | AQU-3/A |
| 30 | ID2163A | Radar Altimeter Indicator |
| 31 | RADAR_ALTIMETER | APN-194(V) |
| 32 | SAI | Standby Attitude Indicator |
| 33 | IFEI | Fuel/Engine Indicator |
| 34 | HUD | Head-Up Display |
| 35 | MDI_LEFT | Left DDI |
| 36 | MDI_RIGHT | Right DDI |
| 37 | AMPCD | Center Display |
| 38 | UHF1 | ARC-210 Radio 1 |
| 39 | UHF2 | ARC-210 Radio 2 |
| 40 | INTERCOM | AM-7360/A |
| 41 | KY58 | Secure Speech |
| 42 | RADAR | AN/APG-73 |
| 43 | FLIR | FLIR Pod |
| 44 | INS | AN/ASN-139 |
| 45 | GPS | AN/ASN-163 |
| 46 | MAD | Magnetic Azimuth Detector |
| 47 | SIDEWINDER_INTERFACE | Sidewinder |
| 48 | MAVERICK_INTERFACE | Maverick |
| 49 | ADF | Direction Finder |
| 50 | ANTENNA_SELECTOR | Antenna Selector |
| 51 | MIDS | MIDS-LVT (Link 16 / TACAN) |
| 52 | ILS | AN/ARA-63D |
| 53 | RWR | AN/ALR-67(V) |
| 54 | CMDS | Countermeasures |
| 55 | MACROS | Macros |
| 56 | IFF | AN/APX-111(V) |
| 57 | HELMET | Helmet |
| 58 | HMD_INTERFACE | HMD |
| 59 | MIDS_RT | MIDS RT |
| 60 | CLC | Command Launch Computer |
| 61 | HARM_INTERFACE | HARM |
| 62 | TGP_INTERFACE | Targeting Pod |
| 63 | WALLEYE_INTERFACE | Walleye |
| 64 | DATALINK_INTERFACE | Datalink |
| 65 | SLAM_INTERFACE | SLAM |
| 66 | ASPJ | ECM Jammer |
| 67 | BCN | Beacon |
| 68 | KNEEBOARD | Kneeboard |
| 69 | LINK4 | Link 4 |
| 70 | HEAD_WRAPPER | Head Wrapper |
| 71 | MDL | Mission Data Loader |

---

## UFC (Device 25)

### Function Selectors
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | A/P | 128 | Button |
| 3002 | IFF | 129 | Button |
| 3003 | TCN | 130 | Button |
| 3004 | ILS | 131 | Button |
| 3005 | D/L | 132 | Button |
| 3006 | BCN | 133 | Button |
| 3007 | ON/OFF | 134 | Button |

### COMM Channel Push
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3008 | COMM 1 Channel Selector (push) | 125 | Button |
| 3009 | COMM 2 Channel Selector (push) | 127 | Button |

### Option Select
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3010 | Option Select 1 | 100 | Button |
| 3011 | Option Select 2 | 101 | Button |
| 3012 | Option Select 3 | 102 | Button |
| 3013 | Option Select 4 | 103 | Button |
| 3014 | Option Select 5 | 106 | Button |

### I/P, ADF, EMCON
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3015 | I/P Pushbutton | 99 | Button |
| 3016 | ADF Function Select, 1/OFF/2 | 107 | 3-pos Toggle |
| 3017 | EMCON Pushbutton | 110 | Button |

### Keyboard
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3018 | Key 0 | 120 | Button |
| 3019 | Key 1 | 111 | Button |
| 3020 | Key 2 (N) | 112 | Button |
| 3021 | Key 3 | 113 | Button |
| 3022 | Key 4 (W) | 114 | Button |
| 3023 | Key 5 | 115 | Button |
| 3024 | Key 6 (E) | 116 | Button |
| 3025 | Key 7 | 117 | Button |
| 3026 | Key 8 (S) | 118 | Button |
| 3027 | Key 9 | 119 | Button |
| 3028 | CLR | 121 | Button |
| 3029 | ENT | 122 | Button |

### Volume & Brightness
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3030 | COMM 1 Volume | 108 | Axis |
| 3031 | COMM 2 Volume | 123 | Axis |
| 3032 | Brightness (BRT/DIM) | 109 | Axis |

### COMM Channel Rotate
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3033 | COMM 1 Channel Selector (rotate) | 124 | Axis |
| 3034 | COMM 2 Channel Selector (rotate) | 126 | Axis |

---

## HOTAS (Device 13)

### Stick
| Code | Name | Type |
|------|------|------|
| 3001 | Trigger 1st Detent | Button |
| 3002 | Trigger 2nd Detent | Button |
| 3003 | Weapon Release | Button |
| 3004 | RECCE Event Mark | Button |
| 3005 | Sensor Control Fwd | Button |
| 3006 | Sensor Control Aft | Button |
| 3007 | Sensor Control Left | Button |
| 3008 | Sensor Control Right | Button |
| 3009 | Weapon Select Fwd (Sparrow) | Button |
| 3010 | Weapon Select Aft (Gun) | Button |
| 3011 | Weapon Select In (AMRAAM) | Button |
| 3012 | Weapon Select Down (Sidewinder) | Button |
| 3013 | Undesignate/NWS | Button |
| 3014 | Trimmer Up | Button |
| 3015 | Trimmer Down | Button |
| 3016 | Trimmer Left | Button |
| 3017 | Trimmer Right | Button |
| 3018 | Paddle (AP/NWS Disengage) | Button |

### Throttle
| Code | Name | Type |
|------|------|------|
| 3019 | TDC Up | Button |
| 3020 | TDC Down | Button |
| 3021 | TDC Left | Button |
| 3022 | TDC Right | Button |
| 3023 | TDC Depress | Button |
| 3024 | Elevation Control Up | Button |
| 3025 | Elevation Control Down | Button |
| 3026 | Elevation Control Axis | Axis |
| 3027 | COMM Switch COMM 1 | Button |
| 3028 | COMM Switch COMM 2 | Button |
| 3029 | COMM Switch MIDS A | Button |
| 3030 | COMM Switch MIDS B | Button |
| 3031 | Cage/Uncage | Button |
| 3032 | Dispense Fwd (CHAFF) | Button |
| 3033 | Dispense Aft (FLARE) | Button |
| 3034 | RAID/FLIR FOV | Button |
| 3035 | Speed Brake | 3-pos Toggle |
| 3036 | Speed Brake EXT | — |
| 3037 | ATC Engage/Disengage | Button |
| 3038 | Left Fingerlift EXT | — |
| 3039 | Right Fingerlift EXT | — |
| 3040 | Both Fingerlift EXT | — |
| 3041 | Exterior Lights ON/OFF | 2-pos Toggle |

---

## Control Interface (Device 2)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | RUD TRIM Control | 345 | Axis |
| 3002 | T/O TRIM Button | 346 | Button |
| 3003 | FCS RESET Button | 349 | Button |
| 3004 | FCS BIT Switch | 470 | Button |
| 3005 | GAIN Switch Cover | 348 | Cover |
| 3006 | GAIN Switch, NORM/ORIDE | 347 | 2-pos Toggle |
| 3007 | FLAP Switch, AUTO/HALF/FULL | 234 | 3-pos Toggle |
| 3008 | Spin Recovery Switch Cover | 139 | Cover |
| 3009 | Spin Recovery Switch, RCVY/NORM | 138 | 2-pos Toggle |
| 3010 | Wing Fold Pull | 296 | Lever |
| 3011 | Wing Fold Select | 295 | Toggle |
| 3012 | Throttles Friction Lever | 504 | Axis |

---

## Electrical System (Device 3)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Battery Switch, ON/OFF/ORIDE | 404 | 3-pos Toggle |
| 3002 | Left Generator, NORM/OFF | 402 | 2-pos Toggle |
| 3003 | Right Generator, NORM/OFF | 403 | 2-pos Toggle |
| 3004 | External Power Switch | 336 | Toggle |
| 3005 | External Power Reset | 336 | Button |
| 3006 | Generator TIE Control Switch | 378 | 2-pos Toggle |
| 3007 | Generator TIE Control Cover | 379 | Cover |
| 3008 | Ground Power 1 Switch A | 332 | Spring-loaded |
| 3009 | Ground Power 1 Switch B | 332 | Spring-loaded |
| 3010 | Ground Power 2 Switch A | 333 | Spring-loaded |
| 3011 | Ground Power 2 Switch B | 333 | Spring-loaded |
| 3012 | Ground Power 3 Switch A | 334 | Spring-loaded |
| 3013 | Ground Power 3 Switch B | 334 | Spring-loaded |
| 3014 | Ground Power 4 Switch A | 335 | Spring-loaded |
| 3015 | Ground Power 4 Switch B | 335 | Spring-loaded |
| 3016 | Pitot Heater, ON/AUTO | 409 | Spring-loaded |
| 3017 | CB FCS CHAN 1 | 381 | Circuit Breaker |
| 3018 | CB FCS CHAN 2 | 382 | Circuit Breaker |
| 3019 | CB SPD BRK | 383 | Circuit Breaker |
| 3020 | CB LAUNCH BAR | 384 | Circuit Breaker |
| 3021 | CB FCS CHAN 3 | 454 | Circuit Breaker |
| 3022 | CB FCS CHAN 4 | 455 | Circuit Breaker |
| 3023 | CB HOOK | 456 | Circuit Breaker |
| 3024 | CB LG | 457 | Circuit Breaker |
| 3025 | MC Switch, MC1 OFF | 368 | Spring-loaded |
| 3026 | MC Switch, MC2 OFF | 368 | Spring-loaded |

---

## Hydraulic System (Device 4)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Hydraulic Isolate Override, NORM/ORIDE | 369 | 2-pos Toggle |

---

## Landing Gear (Device 5)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Landing Gear Handle, UP/DOWN | 226 | Toggle |
| 3002 | Emergency Down | 228 | Button |
| 3003 | Down Lock Override Button | 229 | Button |
| 3004 | Anti Skid Switch, ON/OFF | 238 | 2-pos Toggle |
| 3005 | Emergency/Parking Brake On/Off | 240 | Lever |
| 3006 | Emergency/Parking Brake Select Park | 241 | Toggle |
| 3007 | Emergency/Parking Brake Select Emerg | 241 | Toggle |
| 3008 | Launch Bar, EXTEND/RETRACT | 233 | Button |
| 3009 | Arresting Hook Handle, UP/DOWN | 293 | 2-pos Toggle |

---

## Fuel System (Device 6)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Int Wing Tank Fuel, INHIBIT/NORM | 340 | 2-pos Toggle |
| 3002 | Probe Control, EXTEND/RETRACT/EMERG | 341 | 3-pos Toggle |
| 3003 | Fuel Dump, ON/OFF | 344 | Button |
| 3004 | Ext Centerline Tank, STOP/NORM/ORIDE | 343 | 3-pos Toggle |
| 3005 | Ext Wing Tanks, STOP/NORM/ORIDE | 342 | 3-pos Toggle |

---

## Cockpit Mechanics (Device 7)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Canopy Switch Open | 453 | Spring-loaded |
| 3002 | Canopy Switch Close | 453 | Spring-loaded |
| 3003 | Canopy Jettison Lever | 42 | 2-pos Toggle |
| 3004 | Canopy Jettison Unlock Button | 43 | Button |
| 3005 | Static Source Select | — | — |
| 3006 | Ejection Seat SAFE/ARMED | 511 | 2-pos Toggle |
| 3007 | Ejection Seat Manual Override | 512 | 2-pos Toggle |
| 3008 | Ejection Control Handle (3x) | 510 | Button |
| 3009 | Shoulder Harness, LOCK/UNLOCK | 513 | 2-pos Toggle |
| 3010 | Seat Height Up | 514 | Spring-loaded |
| 3011 | Seat Height Down | 514 | Spring-loaded |
| 3012 | Rudder Pedal Adjust Lever | 260 | Button |
| 3013 | Hide Stick Toggle | 575 | 2-pos Toggle |

---

## Exterior Lights (Device 8)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | POSITION Lights Dimmer | 338 | Axis |
| 3002 | FORMATION Lights Dimmer | 337 | Axis |
| 3003 | STROBE Switch, BRT/OFF/DIM | 339 | 3-pos Toggle |
| 3004 | LDG/TAXI Light, ON/OFF | 237 | 2-pos Toggle |

---

## Cockpit Lights (Device 9)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | CONSOLES Dimmer | 413 | Axis |
| 3002 | INST PNL Dimmer | 414 | Axis |
| 3003 | FLOOD Dimmer | 415 | Axis |
| 3004 | MODE Switch, NVG/NITE/DAY | 419 | 3-pos Toggle |
| 3005 | CHART Dimmer | 418 | Axis |
| 3006 | WARN/CAUTION Dimmer | 417 | Axis |
| 3007 | Lights Test, TEST/OFF | 416 | Spring-loaded |
| 3008 | MASTER CAUTION Reset | 14 | Button |
| 3009 | HOOK BYPASS, FIELD/CARRIER | 239 | Spring-loaded |

---

## Oxygen System (Device 10)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | OBOGS Control, ON/OFF | 365 | 2-pos Toggle |
| 3002 | OXY Flow Knob | 366 | Axis |

---

## ECS (Device 11)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Bleed Air Knob, R OFF/NORM/L OFF/OFF | 411 | Multi-pos |
| 3002 | Bleed Air Knob AUG PULL | 412 | Button |
| 3003 | ECS Mode, AUTO/MAN/OFF/RAM | 405 | 3-pos Toggle |
| 3004 | Cabin Pressure, NORM/DUMP/RAM/DUMP | 408 | 3-pos Toggle |
| 3005 | Defog Handle | 451 | Axis |
| 3006 | Cabin Temperature Knob | 407 | Axis |
| 3007 | Suit Temperature Knob | 406 | Axis |
| 3008 | AV COOL Switch, NORM/EMERG | 297 | Button |
| 3009 | Windshield Anti-Ice/Rain | 452 | 3-pos Toggle |
| 3010 | Left Louver | 505 | Axis |
| 3011 | Right Louver | 506 | Axis |

---

## Engines (Device 12)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | APU Control, ON/OFF | 375 | Button |
| 3002 | Engine Crank Left | 377 | Spring-loaded |
| 3003 | Engine Crank Right | 377 | Spring-loaded |
| 3004 | L AMAD Decoupler Handle | — | — |
| 3005 | R AMAD Decoupler Handle | — | — |
| 3006 | Fire Test A | 331 | Spring-loaded |
| 3007 | Fire Test B | 331 | Spring-loaded |
| 3008 | Fire Extinguisher Discharge | 46 | Button |
| 3009 | APU Fire Warning/Extinguisher | 30 | Push Toggle |
| 3010 | Left Engine Fire Warning | 11 | Button |
| 3011 | Right Engine Fire Warning | 27 | Button |
| 3012 | Left Engine Fire Cover | 12 | Cover |
| 3013 | Right Engine Fire Cover | 28 | Cover |
| 3014 | Engine Anti-Ice, ON/OFF/TEST | 410 | 3-pos Toggle |

---

## SMS / Master Arm (Device 23)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Master Mode A/A | 458 | Button |
| 3002 | Master Mode A/G | 459 | Button |
| 3003 | Master Arm, ARM/SAFE | 49 | 2-pos Toggle |
| 3004 | Emergency Jettison | 50 | Button |
| 3005 | Jett Station Center | 153 | Push Toggle |
| 3006 | Jett Station Left In | 155 | Push Toggle |
| 3007 | Jett Station Left Out | 157 | Push Toggle |
| 3008 | Jett Station Right In | 159 | Push Toggle |
| 3009 | Jett Station Right Out | 161 | Push Toggle |
| 3010 | Selective Jettison Button | 235 | Button |
| 3011 | Selective Jettison Knob | 236 | Multi-pos |
| 3012 | Auxiliary Release, ENABLE/NORM | 258 | 2-pos Toggle |
| 3013 | IR Cooling, ORIDE/NORM/OFF | 135 | 3-pos Toggle |

---

## HUD (Device 34)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Symbology Reject, NORM/REJ1/REJ2 | 140 | 3-pos Toggle |
| 3002 | Symbology Brightness Knob | 141 | Axis |
| 3003 | Symbology Brightness, DAY/NIGHT | 142 | 2-pos Toggle |
| 3004 | Black Level Knob | 143 | Axis |
| 3005 | Video Control, W/B/VID/OFF | 144 | 3-pos Toggle |
| 3006 | Balance Knob | 145 | Axis |
| 3007 | AOA Indexer Knob | 146 | Axis |
| 3008 | Altitude Switch, BARO/RDR | 147 | 2-pos Toggle |
| 3009 | Attitude Selector, INS/AUTO/STBY | 148 | 3-pos Toggle |

---

## Left MDI (Device 35) / Right MDI (Device 36)

### Controls (same codes, different device)
| Code | Name | Type |
|------|------|------|
| 3001 | Brightness Selector, OFF/NIGHT/DAY | 3-pos Toggle |
| 3002 | Brightness Knob | Axis |
| 3003 | Contrast Knob | Axis |
| 3004 | HDG Set Positive (Left MDI only) | Spring-loaded |
| 3005 | HDG Set Negative (Left MDI only) | Spring-loaded |
| 3006 | CRS Set Positive (Left MDI only) | Spring-loaded |
| 3007 | CRS Set Negative (Left MDI only) | Spring-loaded |

### Pushbuttons (3011-3030, shared with AMPCD)
| Code | PB # | Code | PB # |
|------|------|------|------|
| 3011 | PB 1 | 3021 | PB 11 |
| 3012 | PB 2 | 3022 | PB 12 |
| 3013 | PB 3 | 3023 | PB 13 |
| 3014 | PB 4 | 3024 | PB 14 |
| 3015 | PB 5 | 3025 | PB 15 |
| 3016 | PB 6 | 3026 | PB 16 |
| 3017 | PB 7 | 3027 | PB 17 |
| 3018 | PB 8 | 3028 | PB 18 |
| 3019 | PB 9 | 3029 | PB 19 |
| 3020 | PB 10 | 3030 | PB 20 |

---

## AMPCD (Device 37)

### Controls
| Code | Name | Type |
|------|------|------|
| 3001 | Off/Brightness Knob | Axis |
| 3002 | Night/Day Selector DAY | Switch + |
| 3003 | Night/Day Selector NGT | Switch - |
| 3004 | Symbology UP | Switch + |
| 3005 | Symbology DOWN | Switch - |
| 3006 | Contrast UP | Switch + |
| 3007 | Contrast DOWN | Switch - |
| 3008 | Gain UP | Switch + |
| 3009 | Gain DOWN | Switch - |

### Pushbuttons (3011-3030, same codes as MDI)
See MDI pushbutton table above.

---

## IFEI (Device 33)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | MODE Button | 168 | Button |
| 3002 | QTY Button | 169 | Button |
| 3003 | Up Arrow Button | 170 | Button |
| 3004 | Down Arrow Button | 171 | Button |
| 3005 | ZONE Button | 172 | Button |
| 3006 | ET Button | 173 | Button |
| 3007 | Brightness Knob | 174 | Axis |

---

## Instruments

### Standby Altimeter AAU-52 (Device 26)
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Pressure Setting Knob | 224 | Axis |

### Radar Altimeter ID-2163A (Device 30)
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Push to Test | 291 | Button |
| 3002 | Set Min Altitude | 292 | Axis |

### Standby Attitude Indicator SAI (Device 32)
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Test Button | 215 | Button |
| 3002 | Cage Knob Pull | 213 | Button |
| 3003 | Cage Knob Rotate | 214 | Axis |

---

## Sensor Panel

### Radar (Device 42)
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | RADAR Switch, OFF/STBY/OPR/EMERG | 440 | Multi-pos |
| 3002 | RADAR Switch Pull | 440 | Button |

### INS (Device 44)
| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | INS Switch, OFF/CV/GND/NAV/IFA/GYRO/GB/TEST | 443 | Multi-pos (8) |

---

## Intercom (Device 40)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | COMM Switch | — | — |
| 3002 | VOX Volume | 357 | Axis |
| 3003 | ICS Volume | 358 | Axis |
| 3004 | RWR Volume | 359 | Axis |
| 3005 | WPN Volume | 360 | Axis |
| 3006 | MIDS A Volume | 362 | Axis |
| 3007 | MIDS B Volume | 361 | Axis |
| 3008 | TACAN Volume | 363 | Axis |
| 3009 | AUX Volume | 364 | Axis |
| 3010 | Comm Relay, CIPHER/OFF/PLAIN | 350 | 3-pos Toggle |
| 3011 | COMM G XMT, COMM1/OFF/COMM2 | 351 | 3-pos Toggle |
| 3012 | IFF Master, EMER/NORM | 356 | 2-pos Toggle |
| 3013 | IFF Mode 4, DIS/AUD/DIS/OFF | 355 | 3-pos Toggle |
| 3014 | CRYPTO Switch Zero | 354 | Spring-loaded |
| 3015 | CRYPTO Switch Hold | 354 | Spring-loaded |
| 3016 | ILS UFC/MAN Switch | 353 | 2-pos Toggle |
| 3017 | ILS Channel Selector | 352 | Multi-pos (20) |
| 3018 | Warning Tone Silence Button | 230 | Button |

---

## KY-58 (Device 41)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | Mode Select, P/C/LD/RV | 444 | Multi-pos (4) |
| 3002 | Fill Select, Z1-5/1/2/3/4/5/6/ZALL | 446 | Multi-pos (8) |
| 3003 | Fill Select Pull | — | Button |
| 3004 | Power Select, OFF/ON/TD | 447 | Multi-pos (3) |
| 3005 | Volume Knob | 445 | Axis |

---

## Antenna Selector (Device 50)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | COMM 1 Antenna, UPPER/AUTO/LOWER | 373 | 3-pos Toggle |
| 3002 | IFF Antenna, UPPER/BOTH/LOWER | 374 | 3-pos Toggle |

---

## RWR ALR-67 (Device 53)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | POWER | 277 | 2-pos Toggle |
| 3002 | DISPLAY | 275 | Button |
| 3003 | SPECIAL | 272 | Button |
| 3004 | OFFSET | 269 | Button |
| 3005 | BIT | 266 | Button |
| 3006 | DMR Control Knob | 263 | Axis |
| 3007 | DIS TYPE, N/I/A/U/F | 261 | Multi-pos (5) |
| 3008 | Intensity Knob | 216 | Axis |

---

## CMDS (Device 54)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | DISPENSER Switch, BYPASS/ON/OFF | 517 | 3-pos Toggle |
| 3002 | Dispense Button (chaff & flares) | 380 | Button |
| 3003 | ECM JETT SEL Button | 515 | Push Toggle |

---

## ASPJ / ECM (Device 66)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | ECM Mode, XMIT/REC/BIT/STBY/OFF | 248 | Multi-pos (5) |

---

## Targeting Pod / FLIR (Device 62)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | FLIR Switch, ON/STBY/OFF | 439 | 3-pos Toggle |
| 3002 | LTD/R Switch, ARM/SAFE | 441 | Spring-loaded |
| 3003 | LST/NFLR Switch, ON/OFF | 442 | 2-pos Toggle |

---

## HMD (Device 58)

| Code | Name | Arg | Type |
|------|------|-----|------|
| 3001 | HMD OFF/BRT Knob | 136 | Axis |
