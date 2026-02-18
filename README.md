# 🎮 Game Store

A central hub and launcher for my browser-based games. This acts as a simple, stylish portal to access all my games quickly.

![Game Store](https://img.shields.io/badge/version-1.0-purple)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- 🎯 **Quick Access** - One-click access to all my games
- 🔍 **Search** - Instantly find games by title or description
- 🎨 **Multiple Themes** - Choose from 4 beautiful themes:
  - 💜 Purple (default)
  - ⚫ Dark (Black & White)
  - 🌸 Light (Warm tones)
  - 🌊 Ocean (Cool blues)
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Lightweight** - Pure HTML/CSS/JS, no frameworks

## 🕹️ Games Included

| Game | Description | Link |
|------|-------------|------|
| 🐍 Snake Rush | A fast-paced snake game with classic gameplay | [Play](https://merinm488.github.io/snake-rush/) |
| 💣 Minesweeper | Classic puzzle game - find all the mines! | [Play](https://merinm488.github.io/minesweeper/) |
| 📦 Sokoban | Push boxes to their target locations | [Play](https://merinm488.github.io/sokoban/) |

## 🚀 Live Demo

Visit the game store: [https://merinm488.github.io/game-store/](https://merinm488.github.io/game-store/)

## 🛠️ Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with CSS variables for theming
- **JavaScript (ES6+)** - Dynamic game loading and interactions
- **GitHub Pages** - Hosting

## 📁 Project Structure

```
game-store/
├── index.html       # Main launcher page
├── list.json        # Game metadata (titles, descriptions, URLs)
├── styles.css       # Styling with theme support
├── script.js        # Dynamic game loading & interactions
└── README.md        # This file
```

## 🎯 How It Works

The game store is a simple, data-driven launcher:

1. **`list.json`** contains metadata for all games
2. **`script.js`** fetches this JSON and dynamically renders game cards
3. Each game card displays the game's emoji, title, description, and a "Play Now" button
4. Clicking "Play Now" opens the game in a new tab

### Adding a New Game

To add a new game, simply add an entry to `list.json`:

```json
{
  "title": "Your Game Name",
  "description": "Short description",
  "emoji": "🎮",
  "url": "https://your-username.github.io/your-game/"
}
```

That's it! No code changes needed. The game will automatically appear in the store.

## 🎨 Themes

The game store supports 4 themes that change the entire look and feel:

- **Purple** - Vibrant purple gradient (default)
- **Dark** - Minimalist black & white
- **Light** - Warm peach and pink tones
- **Ocean** - Cool cyan and blue gradients

Themes are saved to localStorage, so your choice persists across visits.

## 📱 Responsive Design

The layout adapts seamlessly:
- **Desktop**: Horizontal cards with icon, content, and button side-by-side
- **Mobile**: Vertical stacked layout for better touch interaction

## 🔧 Development

To run locally:

```bash
# Using Python 3
cd game_store
python3 -m http.server 5500

# Using Node.js
npx http-server -p 5500

# Or simply open index.html in your browser
```

Then visit `http://localhost:5500`

## 📝 License

This project is open source and available for anyone to use and modify.

## 🤝 Contributing

Feel free to fork this project and customize it for your own games!

---

Made with ❤️ for fun games
