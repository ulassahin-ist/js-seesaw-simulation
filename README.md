[![Live Demo](https://img.shields.io/badge/demo-live-yellow)](https://ulassahin-ist.github.io/js-seesaw-simulation/)
[![GitHub](https://img.shields.io/badge/github-repository-blue)](https://github.com/ulassahin-ist/js-seesaw-simulation)

# 🎢 Seesaw App

A small interactive physics-based seesaw simulation built with **HTML**, **CSS**, and **JavaScript**.  
Drop weighted balls on a plank and watch how it tilts in real time!

---

## 🛠 Features

- 🎨 Multiple color themes for balls:
  - Vibrant
  - Sunrise
  - Pastel
  - Raindrops
  - Delight
- ⏸ Pause / Resume the simulation
- 🔄 Auto-drop mode for continuous ball drops
- 🧮 Dynamic weight and tilt counters
- 📜 Real-time log of dropped balls and their positions
- 🖱 Interactive aim line and distance label for precise placement
- 💾 State persistence with localStorage for balls and logs

---

## 📦 How to Use

1. Open `index.html` in your browser.
2. Click anywhere on the plank to drop a ball.
3. Use the buttons to **Pause**, **Auto-drop**, or **Reset**.
4. Change color themes from the dropdown.

---

## 🎮 Controls

| Button       | Action                                   |
| ------------ | ---------------------------------------- |
| Reset        | Clears the plank and logs                |
| Pause/Resume | Pause or resume simulation               |
| Auto         | Automatically drop balls at random spots |
| Color Theme  | Change the ball color set                |

---

## 💻 Technologies

- **HTML5** – Structure and layout
- **CSS3** – Styling and visual effects
- **JavaScript (Vanilla)** – Interactivity and game logic
- Audio feedback for actions like drop, select, and reset
- **localStorage** for persisting balls, logs, and state

---

## 📐 Mechanics

- Balls have random sizes (1–10 kg) and colors from the selected theme.
- The plank tilts based on **torque** applied by balls on either side.
- Logs display the weight, side, and distance from the center for each dropped ball.
- Auto mode uses random placement to simulate multiple drops.

---

## 🎨 Styling Notes

- Uses **CSS variables** for colors, sizes, and angles.
- Modern neumorphic-inspired design with shadows and gradients.
- Desktop-only simulation (not mobile-optimized).

---

## ⚡ Tips

- Works in desktop browsers with JavaScript enabled.
- Audio feedback requires your browser to allow autoplay.
- Adjust `DROP_OFFSET` and `MAX_ANGLE` in `index.js` to tweak physics behavior.

---

## 📂 File Structure

/project-root
├── index.html
├── css/
│ └── index.css
├── js/
│ └── index.js
├── audio/
│ ├── select.mp3
│ ├── reset.mp3
│ ├── auto.mp3
│ └── fall.mp3
└── README.md

---

## 🔊 Audio Feedback

- 🎯 `audio_select.mp3` – Button interactions
- 🔄 `audio_auto.mp3` – Auto-drop mode
- ⬇ `audio_fall.mp3` – Ball dropping sound
- 🔄 `audio_reset.mp3` – Reset plank/logs

---

## 💾 Persistence

Balls and logs are saved to localStorage automatically.

Ghost ball and counters restore after reload.

Theme selection is remembered between sessions.

## ⚖️ License

This project is **free to use** for personal and educational purposes.

---

> Made for fun and testing physics simulations in the browser.
