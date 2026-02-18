# Sokoban Web Game

A responsive, multi-level Sokoban puzzle game built with HTML, CSS, and JavaScript. Works as a Progressive Web App (PWA) for offline play!

![PWA Ready](https://img.shields.io/badge/PWA-Ready-green)
![Offline Support](https://img.shields.io/badge/Offline-Yes-green)
![Responsive](https://img.shields.io/badge/Responsive-Yes-blue)
![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-purple)

---

This project showcases how AI can accelerate development while maintaining code quality, proper structure, and attention to detail. Every feature was implemented through thoughtful iteration and refinement with Claude Code's assistance.

---

## Features

### 🎮 Gameplay
- **15 progressively challenging levels** - From tutorial to mastery
- **Three beautiful themes**:
  - Classic - Warm brown tones with colorful game elements
  - Dark (B&W) - High contrast black and white with colored game pieces
  - Light - Clean, bright interface
- **Undo feature** - Go back on mistakes
- **Sound effects** - Toggle on/off in settings
- **Best scores tracking** - Moves and time saved per level

### 📱 PWA Features
- **Installable** - Add to home screen on mobile and desktop
- **Offline support** - Play anywhere without internet
- **App-like experience** - Full-screen, no browser UI
- **Custom icons** - Beautiful crate icon for all sizes
- **Fast loading** - All assets cached for instant access

### 🎨 Design
- **Responsive design** - Works on desktop, tablet, and mobile devices
- **Intuitive controls**:
  - Desktop: Arrow keys or WASD to move, Z to undo
  - Touch: Swipe gestures for mobile play
- **How to Play section** - Visual tutorial with actual game elements
- **Animated menus** - Bouncing box logo and smooth transitions
- **Celebration effects** - Confetti and animations on level completion

### 🎯 Game Statistics
- Move counter and timer
- Best scores saved per level (local storage)
- Level completion tracking
- Tutorial system for first-time players

## How to Play

1. Push all boxes (orange squares) onto the target locations (green dots)
2. You can only push one box at a time
3. Pulling boxes is not allowed
4. Complete levels with minimum moves and time for best scores

## Controls

### Desktop
- **Arrow Keys** or **WASD** - Move player
- **Z** - Undo last move
- **Space** or **P** or **Escape** - Pause game
- **R** - Reset level

### Touch/Mobile
- **Swipe** in any direction to move
- Use on-screen buttons for Undo, Reset, Pause, and Quit

## Installation (PWA)

### On Mobile (Chrome/Edge)
1. Open the game in your browser
2. Tap the menu (⋮) or share icon
3. Select "Add to Home Screen" or "Install App"
4. The game will appear as an app with its icon

### On Desktop (Chrome/Edge)
1. Open the game in your browser
2. Click the install icon in the address bar (⊕ or install button)
3. Confirm installation
4. The game will open in its own window

### On iOS (Safari)
1. Open the game in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm


## Project Structure

```
sokoban/
├── index.html          # Main HTML with all screens
├── styles.css          # Themes and responsive styles
├── game.js             # Game engine and logic
├── levels.js           # Level data and utilities
├── manifest.json       # PWA manifest
├── sw.js               # Service worker for offline support
├── icon-*.png          # App icons (various sizes)
├── icon-maskable-*.png # Adaptive icons for Android
└── README.md           # This file
```

## Browser Support

- ✅ Chrome/Edge (recommended) - Full PWA support
- ✅ Firefox - Full support
- ✅ Safari - Full support (iOS add to home screen)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Technical Details

- **Pure JavaScript** - No frameworks or dependencies
- **Local Storage** - Saves settings, progress, and best scores
- **Service Worker** - Caches all assets for offline play
- **Responsive Grid** - Adapts to any screen size
- **Touch Events** - Native swipe gestures on mobile
- **CSS Custom Properties** - Dynamic theming system

## Level Progression

1. **Levels 1-3 (Tutorial)**: Learn basic mechanics with 1-2 boxes
2. **Levels 4-6 (Easy)**: Simple puzzles with 2-3 boxes
3. **Levels 7-10 (Medium)**: Introduce tight spaces and planning with 2-4 boxes
4. **Levels 11-13 (Medium-Hard)**: Complex layouts with obstacles, 3-4 boxes
5. **Levels 14-15 (Hard)**: Strategic challenges requiring careful planning with 6 boxes

## Credits

Sokoban is a classic puzzle game invented in 1981 by Hiroyuki Imabayashi. This web version brings the classic to modern browsers with PWA capabilities.

## License

Feel free to use this project for learning and personal projects!
