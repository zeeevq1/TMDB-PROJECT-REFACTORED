"use strict";
/**
 * favorites.js — Favorites page (plain JS)
 *
 * Includes the "course pattern":
 *   - fetchMovies(apiUrl) with try/catch
 *   - displayShows([]) on empty/error → shows an empty-state with an image
 *
 * Covers:
 * - FR010: small, purpose-specific functions
 * - FR006: English comments + JSDoc
 * - FR008: graceful empty state (image + message)
 * - FR009: robust error handling (toasts + non-crashing UI)
 * - FR007: fixes (bad JSON, duplicates, safe poster URL, non-skinny grid)
 */ ///////////////////////////
// Config & API settings //
///////////////////////////
/** Public image base for TMDB posters */ const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
/** LocalStorage key: favorites (array of IDs or movie objects) */ const LS_KEY = "favorites";
/** Optional TMDB credentials (read from window to avoid build-time config) */ const API = {
    key: typeof window !== "undefined" ? window.__TMDB_KEY__ || "" : "",
    bearer: typeof window !== "undefined" ? window.__TMDB_BEARER__ || "" : "",
    baseUrl: "https://api.themoviedb.org/3",
    language: "en-US"
};
/** Network defaults for TMDB calls */ const NET = {
    timeout: 12000
};
////////////////////
// UI: toast/state
////////////////////
/** Lightweight toast (user-visible short messages) */ function toast(msg, ms = 3200) {
    let host = document.getElementById("app-toast");
    if (!host) {
        host = document.createElement("div");
        host.id = "app-toast";
        host.setAttribute("aria-live", "polite");
        host.className = "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]";
        document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "mb-2 rounded-xl bg-black/80 text-white px-4 py-2 shadow text-sm whitespace-pre-wrap";
    el.textContent = String(msg || "");
    host.appendChild(el);
    setTimeout(()=>el.remove(), ms);
}
/** Escape helper for safe innerHTML text nodes */ function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m)=>({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[m]);
}
/** DOM helper: get favorites container */ function getShowContainer() {
    return /** @type {HTMLElement} */ document.getElementById("fav-container");
}
//////////////////////////
// Storage + data shape //
//////////////////////////
/**
 * @typedef {{ id:number, title?:string, name?:string, poster_path?:string, profile_path?:string, vote_average?:number }} MovieLite
 */ /**
 * Read favorites safely from localStorage.
 * Accepts arrays of numbers (IDs) or arrays of movie-like objects.
 * Removes duplicates.
 * @returns {(number|MovieLite)[]}
 */ function readFavoritesRaw() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        const val = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(val)) return [];
        // de-duplicate by JSON string
        const uniq = Array.from(new Set(val.map((x)=>JSON.stringify(x)))).map((s)=>JSON.parse(s));
        return uniq;
    } catch  {
        return [];
    }
}
/**
 * Normalize favorites into a consistent shape (MovieLite[]).
 * @param {(number|MovieLite)[]} raw
 * @returns {MovieLite[]}
 */ function normalize(raw) {
    /** @type {MovieLite[]} */ const out = [];
    for (const it of raw){
        if (typeof it === "number") out.push({
            id: Number(it)
        });
        else if (it && typeof it === "object") {
            const id = Number(it.id);
            if (Number.isFinite(id)) out.push({
                id,
                title: it.title || it.name || "",
                poster_path: it.poster_path || it.profile_path || "",
                vote_average: typeof it.vote_average === "number" ? it.vote_average : undefined
            });
        }
    }
    return out;
}
/** Remove one favorite by id and persist + toast */ function removeFavorite(id) {
    const current = readFavoritesRaw();
    const next = current.filter((x)=>typeof x === "number" ? Number(x) !== id : Number(x?.id) !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    toast("Removed from favorites");
}
/** Build a safe poster URL from various shapes */ function safePosterUrl(p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return p.startsWith("/") ? IMAGE_BASE + p : IMAGE_BASE + "/" + p;
}
/////////////////////////
// TMDB: robust helper //
/////////////////////////
/** Build TMDB URL with api_key when no Bearer is present. */ function tmdbUrl(path, params = {}) {
    const url = new URL(path, API.baseUrl);
    if (!API.bearer && API.key) url.searchParams.set("api_key", API.key);
    for (const [k, v] of Object.entries(params))if (v != null) url.searchParams.set(k, String(v));
    return url.toString();
}
/**
 * GET wrapper for TMDB with friendly error codes.
 * throws e.code in: AUTH, RATE, TIMEOUT, DOWN
 */ async function tmdbGet(path, params = {}) {
    const ctrl = new AbortController();
    const id = setTimeout(()=>ctrl.abort(), NET.timeout);
    try {
        const headers = {
            "Content-Type": "application/json"
        };
        if (API.bearer) headers["Authorization"] = `Bearer ${API.bearer}`;
        const res = await fetch(tmdbUrl(path, params), {
            headers,
            signal: ctrl.signal
        });
        if (!res.ok) {
            const err = new Error(`HTTP ${res.status}`);
            // @ts-ignore
            err.status = res.status;
            throw err;
        }
        return await res.json();
    } catch (e) {
        if (e?.name === "AbortError") {
            const err = new Error("Timeout");
            err.code = "TIMEOUT";
            throw err;
        }
        if (e?.status === 401 || e?.status === 403) {
            const err = new Error("Auth");
            err.code = "AUTH";
            throw err;
        }
        if (e?.status === 429) {
            const err = new Error("Rate");
            err.code = "RATE";
            throw err;
        }
        if (typeof e?.status === "number" && e.status >= 500) {
            const err = new Error("Down");
            err.code = "DOWN";
            throw err;
        }
        throw e;
    } finally{
        clearTimeout(id);
    }
}
//////////////////////
// Course-style API //
//////////////////////
/**
 * COURSE PATTERN — generic fetch with empty/error flow.
 * You can use this anywhere (e.g., for search/trending), not mandatory for favorites.
 * @param {string} apiUrl
 */ async function fetchMovies(apiUrl) {
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        const movies = data?.results || [];
        // If we don't have any films, we display an empty state
        if (!movies || movies.length === 0) {
            displayShows([]); // "No movies found"
            return;
        }
        displayMovies(movies);
        displayShows(movies);
    } catch (error) {
        console.error("Error fetching movies:", error);
        displayShows([]); // show empty/error block
    }
}
/////////////////////
// Render helpers  //
/////////////////////
/**
 * Create a movie card (2:3 poster ratio, minimal + accessible)
 * @param {MovieLite} m
 * @returns {HTMLElement}
 */ function createCard(m) {
    const card = document.createElement("div");
    card.className = "bg-white/60 backdrop-blur rounded-lg overflow-hidden shadow-md group";
    // Wrapper to position Remove button
    const wrapper = document.createElement("div");
    wrapper.className = "relative";
    // Poster image (CSS class .poster controls ratio in HTML header)
    const img = document.createElement("img");
    img.className = "poster";
    img.alt = m.title || "Untitled";
    img.src = m.poster_path ? safePosterUrl(m.poster_path) : "";
    img.onerror = ()=>{
        img.onerror = null;
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750'>
           <rect width='100%' height='100%' fill='#e5e7eb'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                 fill='#9ca3af' font-family='sans-serif' font-size='20'>No Image</text>
         </svg>`);
    };
    // Remove button (shows on hover)
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "absolute top-2 right-2 rounded-full bg-black/70 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", ()=>{
        removeFavorite(m.id);
        card.remove();
        const host = getShowContainer();
        if (host && host.querySelectorAll("div.bg-white\\/60").length === 0) displayShows([]); // fall back to empty state block
    });
    // Body
    const body = document.createElement("div");
    body.className = "p-4";
    const title = document.createElement("h2");
    title.className = "text-lg font-semibold text-gray-900";
    title.textContent = m.title || "Untitled";
    const rating = document.createElement("p");
    rating.className = "text-sm text-gray-600";
    rating.textContent = `Rating: ${m.vote_average ?? "-"}`;
    // Compose
    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    card.appendChild(wrapper);
    body.appendChild(title);
    body.appendChild(rating);
    card.appendChild(body);
    return card;
}
/**
 * Render grid of cards into the host element (flexible columns).
 * @param {HTMLElement} host
 * @param {MovieLite[]} items
 */ function renderGrid(host, items) {
    host.innerHTML = "";
    host.classList.add("grid", "gap-6", "pb-10");
    host.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
    const frag = document.createDocumentFragment();
    for (const it of items)frag.appendChild(createCard(it));
    host.appendChild(frag);
}
/**
 * COURSE PATTERN — displayMovies: render list when we have content.
 * @param {MovieLite[]} movies
 */ function displayMovies(movies) {
    const showContainer = getShowContainer();
    if (!showContainer) return;
    renderGrid(showContainer, movies);
}
/**
 * COURSE PATTERN — displayShows:
 * - empty/error → show image + message
 * - otherwise → delegate to displayMovies
 * @param {MovieLite[]} movies
 */ function displayShows(movies) {
    const showContainer = getShowContainer();
    if (!showContainer) return;
    if (!movies || movies.length === 0) {
        showContainer.classList.remove("grid");
        showContainer.innerHTML = `
      <div class="flex flex-col p-6 items-center justify-center text-gray-500 mt-6">
        <img
          src="../img/scared.jpg"
          alt="No movies"
          class="w-[70rem] h-[30rem] object-scale-down rounded-lg mb-4
                 max-[910px]:w-[1000px] max-[910px]:h-[350px] max-[910px]:object-cover max-[910px]:object-center"
        />
        <p class="text-2xl font-semibold">Oops! No movies found</p>
        <p class="text-md text-gray-600 mt-2">Please try again later, the API might be offline..</p>
      </div>
    `;
        return;
    }
    // If we DO have movies, render normally
    displayMovies(movies);
}
//////////////////////
// Orchestration    //
//////////////////////
/**
 * Load favorites from storage, optionally enrich from TMDB if we only have IDs,
 * then show via course-style display functions.
 */ async function loadAndRenderFavorites() {
    const host = getShowContainer();
    if (!host) return;
    // Read + normalize
    const raw = readFavoritesRaw();
    const items = normalize(raw);
    // Nothing saved? show empty block
    if (items.length === 0) {
        displayShows([]); // empty
        return;
    }
    // If some items are IDs only, enrich with TMDB (robust error handling)
    try {
        const needs = items.some((m)=>!m.title);
        if (needs) {
            const notified = {
                AUTH: false,
                RATE: false,
                DOWN: false
            };
            await Promise.allSettled(items.filter((m)=>!m.title && Number.isFinite(m.id)).map(async (m)=>{
                try {
                    const data = await tmdbGet(`/movie/${m.id}`, {
                        language: API.language
                    });
                    m.title = data.title || m.title || "";
                    m.poster_path = data.poster_path || m.poster_path || "";
                    if (typeof data.vote_average === "number") m.vote_average = data.vote_average;
                } catch (e) {
                    if (e?.code === "AUTH" && !notified.AUTH) {
                        toast("TMDB credentials invalid/missing. Showing saved items only.");
                        notified.AUTH = true;
                    } else if (e?.code === "RATE" && !notified.RATE) {
                        toast("TMDB rate limit reached. Try again in a minute.");
                        notified.RATE = true;
                    } else if (e?.code === "DOWN" && !notified.DOWN) {
                        toast("TMDB seems down. Showing saved items only.");
                        notified.DOWN = true;
                    } else if (e?.code === "TIMEOUT") toast("Network timeout while contacting TMDB.");
                    console.warn("Enrich failed for id", m.id, e);
                }
            }));
        }
    } catch (e) {
        // Any unexpected error during enrichment → fallback to empty/info block
        console.error("Favorites enrich error:", e);
        toast("Error loading favorites.");
    }
    // Finally, show using the course-style function
    displayShows(items);
}
// Boot
document.addEventListener("DOMContentLoaded", loadAndRenderFavorites);

//# sourceMappingURL=favorites.e93a57ed.js.map
