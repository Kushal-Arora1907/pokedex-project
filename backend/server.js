// server.js
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import { LRUCache } from "lru-cache";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const POKEAPI_BASE = "https://pokeapi.co/api/v2";

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// LRUCache config: max 500 items, ttl 24 hours (ms)
const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

// helper to fetch and cache
async function fetchAndCache(url, cacheKey) {
  if (cache.has(cacheKey)) {
    return { fromCache: true, data: cache.get(cacheKey) };
  }

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Upstream returned ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  cache.set(cacheKey, data);
  return { fromCache: false, data };
}

// normalize /api/pokemon/:name response
function normalizePokemonData(raw) {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    types: raw.types.map((t) => t.type.name),
    abilities: raw.abilities.map((a) => ({
      name: a.ability.name,
      is_hidden: a.is_hidden,
    })),
    sprites: {
      front_default: raw.sprites.front_default,
      official_artwork:
        raw.sprites.other?.["official-artwork"]?.front_default || null,
    },
    stats: raw.stats.map((s) => ({ name: s.stat.name, base: s.base_stat })),
    moves: raw.moves.slice(0, 8).map((m) => m.move.name), // first 8 moves
    species_url: raw.species?.url || null,
  };
}

// GET /api/pokemon/:name
app.get("/api/pokemon/:name", async (req, res) => {
  const name = (req.params.name || "").trim().toLowerCase();
  if (!name) return res.status(400).json({ error: "name required" });

  const cacheKey = `pokemon:${name}`;
  try {
    // fetch main pokemon info
    const { data: raw } = await fetchAndCache(
      `${POKEAPI_BASE}/pokemon/${encodeURIComponent(name)}`,
      cacheKey
    );
    const normalized = normalizePokemonData(raw);

    // optionally: fetch species (for flavor text / evolution chain)
    if (normalized.species_url) {
      const speciesKey = `species:${raw.species.name}`;
      try {
        const { data: speciesRaw } = await fetchAndCache(
          normalized.species_url,
          speciesKey
        );
        normalized.species = {
          color: speciesRaw.color?.name,
          habitat: speciesRaw.habitat?.name || null,
          flavor_text_entries:
            speciesRaw.flavor_text_entries?.slice(0, 3).map((f) => {
              return {
                flavor: f.flavor_text.replace(/\n|\f/g, " "),
                language: f.language.name,
              };
            }) || [],
        };
      } catch (e) {
        // non-fatal — species fetch failed, continue but keep notice
        normalized.species = { error: "species fetch failed" };
      }
    }

    res.json({
      ok: true,
      cached: cache.has(cacheKey),
      data: normalized,
    });
  } catch (error) {
    const status = error.status || 500;
    if (status === 404) {
      return res.status(404).json({ ok: false, error: "Pokemon not found" });
    }
    console.error("Error fetching pokemon:", error);
    return res
      .status(status)
      .json({ ok: false, error: error.message || "Upstream error" });
  }
});

// health and cache control endpoints
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/cache/stats", (req, res) => {
  res.json({
    size: cache.size,
    max: cache.max,
  });
});
app.post("/api/cache/clear", (req, res) => {
  cache.clear();
  res.json({ ok: true, cleared: true });
});

// serve static frontend in production if built into ../frontend/dist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
