import { useState } from "react";
import "./App.css";

/* Small inline search icon */
function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 21l-4.35-4.35"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SampleChip({ name, onClick }) {
  return (
    <button className="chip" onClick={() => onClick(name)}>
      {name}
    </button>
  );
}

export default function App() {
  const [q, setQ] = useState("");
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // API base: prefer Vite env var, otherwise fallback to your Render URL
  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    "https://pokedex-project-pttb.onrender.com/api";

  async function doSearch(name) {
    if (!name) return;
    setErr("");
    setPokemon(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/pokemon/${encodeURIComponent(name)}`
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Not found");
      setPokemon(json.data);

      // scroll result into view a bit after it renders
      setTimeout(() => {
        const el = document.querySelector(".result-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 140);
    } catch (e) {
      setErr(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doSearch(q.trim().toLowerCase());
  }

  const sample = ["Pikachu", "Charizard", "Mewtwo", "Eevee", "Dragonite"];

  return (
    <div className="page-root">
      <div className="page-center">
        <header className="logo">
          <svg
            className="spark"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden>
            <path
              d="M12 2l1.8 3.8L18 7l-3 2 1 4L12 11 8 13l1-4L6 7l4.2-1.2L12 2z"
              fill="#4F46E5"
              opacity="0.95"
            />
          </svg>
          <h1>Pokédex</h1>
        </header>

        <p className="subtitle">
          Discover detailed information about your favorite Pokémon. Search by
          name to explore stats, abilities, and more!
        </p>

        <main className="hero-body">
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              className="search-input"
              placeholder="Search for a Pokemon (e.g., pikachu, charizard, mewtwo)..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search Pokemon"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <SearchIcon />
            </button>
          </form>

          {/* empty / initial state */}
          {!pokemon && !loading && !err && (
            <section className="empty-state">
              <div className="magnifier-emoji">🔍</div>
              <h2>Ready to explore?</h2>
              <p className="muted">
                Enter a Pokémon name above to get started!
              </p>

              <div className="chips">
                {sample.map((s) => (
                  <SampleChip
                    key={s}
                    name={s}
                    onClick={(n) => {
                      setQ(n);
                      doSearch(n.toLowerCase());
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {loading && (
            <section className="empty-state">
              <div className="loader" />
              <h2>Searching…</h2>
            </section>
          )}

          {err && (
            <section className="empty-state">
              <div className="error-box">{err}</div>
            </section>
          )}

          {/* RESULT CARD */}
          {pokemon && (
            <div className="result-card adorable fade-in">
              <div className="card-left">
                <div className="art-wrap cute-frame">
                  <img
                    className="poke-art"
                    src={
                      pokemon.sprites.official_artwork ||
                      pokemon.sprites.front_default
                    }
                    alt={pokemon.name}
                  />
                </div>

                <div className="type-badges">
                  {pokemon.types.map((t) => (
                    <span key={t} className={`type-badge type-${t} cute`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-right">
                <div className="title-row">
                  <h3 style={{ textTransform: "capitalize" }}>
                    {pokemon.name} <span className="pid">#{pokemon.id}</span>
                  </h3>
                </div>

                <div className="meta-row">
                  <div>
                    <strong>Types:</strong> {pokemon.types.join(", ")}
                  </div>
                  <div>
                    <strong>Height:</strong> {pokemon.height} •{" "}
                    <strong>Weight:</strong> {pokemon.weight}
                  </div>
                </div>

                <div className="section abilities">
                  <strong>Abilities:</strong>
                  <div className="ability-list">
                    {pokemon.abilities.map((a) => (
                      <span key={a.name} className="ability-item">
                        {a.name}
                        {a.is_hidden ? " (hidden)" : ""}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="section stats">
                  <strong>Stats</strong>
                  <div className="stats-grid">
                    {pokemon.stats.map((s) => {
                      const pct = Math.min(
                        100,
                        Math.round((s.base / 200) * 100)
                      );
                      return (
                        <div key={s.name} className="stat">
                          <div className="stat-top">
                            <div className="stat-name">{s.name}</div>
                            <div className="stat-num">{s.base}</div>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-fill"
                              style={{ width: `${pct}%` }}
                            />
                            <div
                              className="stat-glow"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {pokemon.species?.flavor_text_entries?.[0] && (
                  <div className="section flavor">
                    “{pokemon.species.flavor_text_entries[0].flavor}”
                  </div>
                )}

                <div className="section moves">
                  <strong>Moves (sample):</strong>
                  <div className="moves-list">{pokemon.moves.join(", ")}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
