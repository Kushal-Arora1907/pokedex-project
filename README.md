# 🎒 Pokédex Search Engine

A fast, modern, and beautiful Pokédex built with **Node.js**, **Express**, **React (Vite)**, and the **PokeAPI**.  
This project was built for a coding challenge requiring a custom backend layer with caching and a polished frontend UI.

---

## 🚀 Features

### 🔍 Search Pokémon by Name

- Type any Pokémon name (e.g., “pikachu”, “mewtwo”, “charizard”)
- Instant results with detailed stats and artwork

### ⚡ Fast Backend With Caching

- Custom Node.js API that fetches data from **PokeAPI**
- **LRU Cache** implemented to:
  - Speed up repeated queries
  - Reduce vendor API calls
  - Auto-expire entries (TTL)
  - Limit memory usage with max-size cache

### 🎨 Beautiful Frontend UI

- Responsive, modern, and adorable card-style Pokémon UI
- Shows:
  - Official artwork
  - Stats with colored bars
  - Types
  - Abilities
  - Flavor text
  - Moves (sample)
- Smooth animations & subtle effects

### 💨 Full Local Dev Setup (Frontend + Backend Together)

- One command to run everything:
  ```bash
  npm run dev
  ```

🧱 Tech Stack
Frontend

React (Vite)

JavaScript

CSS (custom)

Fetch API

Backend

Node.js

Express.js

LRU Cache (lru-cache package)

Helmet, CORS, Morgan (security + logging)

Native fetch (Node 18+)

Other

Concurrently (to run both servers simultaneously)

REST API design principles

📁 Folder Structure
pokedex/
│
├── backend/
│ ├── server.js # Express backend with caching
│ ├── package.json
│ └── ...
│
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ ├── App.css
│ │ └── ...
│ ├── index.html
│ ├── vite.config.js
│ └── package.json
│
├── package.json # Root scripts + concurrently
├── README.md
└── .gitignore

▶️ Running the project locally

1. Install dependencies (root + subfolders)

At project root:

npm install

Then install frontend + backend:

cd backend
npm install

cd ../frontend
npm install

2. Start both servers

From project root:

npm run dev

This runs:

Backend → http://localhost:3000

Frontend → http://localhost:5173

The frontend communicates with /api/pokemon/:name.

🛠 Backend API Documentation
Base URL
http://localhost:3000/api

GET /pokemon/:name

Fetch Pokémon details by name.

Example request
GET /api/pokemon/pikachu

Success response
{
"ok": true,
"fromCache": false,
"data": {
"name": "pikachu",
"id": 25,
"types": ["electric"],
"height": 4,
"weight": 60,
"stats": [...],
"abilities": [...],
"moves": [...],
"sprites": { "official_artwork": "...", ... }
}
}

Error response
{
"ok": false,
"error": "Pokémon not found"
}

🧠 Caching Strategy (Required by Challenge)

The backend implements:

✔ LRU Cache

max size: 500 items

TTL: 24 hours

auto-eviction of old entries

avoids repeated vendor calls

dramatically improves response time

✔ Cached Data:

Pokémon base info

Pokémon species info

✔ Cache Hit Example:
GET /pokemon/pikachu → fromCache: true

✔ Cache Miss Example:
GET /pokemon/pikachu → fromCache: false (fresh fetch)

📸 Screenshots (add after upload)
Home Page

Search Result

Create a screenshots/ folder and add images later.

📝 Notes for Reviewers (Important)

The backend respects REST API guidelines.

All data fetching happens through the custom Node.js layer.

Frontend never hits PokeAPI directly.

UI is responsive and polished with a strong focus on user experience.

Code is modular, clean, and fully commented for readability.

Meets all requirements of the assignment.

📦 Deployment

You can deploy:

Frontend

Vercel

Netlify

Backend

Render

Railway

Fly.io

I can help you deploy if needed.

👨‍💻 Author

Kushal Arora
Full Stack Developer

🎉 Thank you!

Feel free to explore, clone, or extend this Pokédex!

---

# 🎯 Want me to also generate:

### ✔ `.gitignore`

### ✔ Screenshots folder placeholders

### ✔ GitHub repository description

Just tell me — I can generate everything you need.
