/**
 * Selected movie data passed from the previous page via localStorage.
 * @typedef {Object} SelectedMovie
 * @property {string|number} id - Unique movie identifier
 * @property {string} [title]
 * @property {string} [poster_path] - May be a full URL or a TMDB relative path
 * @property {string} [poster_url] - Explicit full poster URL when available
 * @property {string} [release_date]
 * @property {string} [overview]
 */

/**
 * Display selected movie info if available
 * @type {SelectedMovie|null}
 */
const selectedMovie = JSON.parse(localStorage.getItem("selectedMovie"));
if (selectedMovie) {
  const posterIsFullUrl =
    typeof selectedMovie.poster_path === "string" &&
    /^https?:\/\//i.test(selectedMovie.poster_path);
  const poster = posterIsFullUrl
    ? selectedMovie.poster_path
    : `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path || ""}`;

  document.getElementById("film-result").innerHTML = `
    <div class="flex flex-col items-center">
      <img src="${poster}" alt="${selectedMovie.title || "Movie"}" class="mb-4 rounded shadow-lg" />
      <h2 class="text-2xl font-bold mb-2">${selectedMovie.title || "Movie"}</h2>
      <p class="text-gray-700 mb-2">${selectedMovie.release_date || ""}</p>
      <p class="text-gray-600 max-w-md">${selectedMovie.overview || ""}</p>
    </div>
  `;
}

// --- Comments persistence & rendering ---
const THOUGHTS_STORAGE_KEY = "movieThoughts";

/**
 * Safely parse and return the entire thoughts map from localStorage.
 * Returns an empty object if nothing is stored or JSON is invalid.
 * @returns {Object<string, string|string[]>}
 */
function getThoughtsMap() {
  try {
    return JSON.parse(localStorage.getItem(THOUGHTS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Get comments for a specific movie as a string array.
 * Handles backward compatibility when a single string was previously stored.
 * @param {string|number} movieId
 * @returns {string[]}
 */
function getCommentsForMovie(movieId) {
  const map = getThoughtsMap();
  const value = map[movieId];
  if (!value) return [];
  // Backward compatibility: previously stored as a single string
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.filter((t) => typeof t === "string" && t.trim());
  return [];
}

/**
 * Append a new comment for the given movie and persist to localStorage.
 * @param {string|number} movieId
 * @param {string} text
 * @returns {void}
 */
function saveCommentForMovie(movieId, text) {
  const map = getThoughtsMap();
  const existing = getCommentsForMovie(movieId);
  existing.push(text);
  map[movieId] = existing;
  localStorage.setItem(THOUGHTS_STORAGE_KEY, JSON.stringify(map));
}

/**
 * Ensure a container exists for rendering the comments list.
 * @returns {HTMLElement}
 */
function ensureCommentsContainer() {
  let container = document.getElementById("comments-list");
  if (!container) {
    container = document.createElement("div");
    container.id = "comments-list";
    container.className = "mt-6";
    const host = document.getElementById("commentar") || document.body;
    host.appendChild(container);
  }
  return container;
}

/**
 * Render all saved comments for the selected movie.
 * @returns {void}
 */
function renderComments() {
  if (!selectedMovie) return;
  const container = ensureCommentsContainer();
  const comments = getCommentsForMovie(selectedMovie.id);
  if (comments.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No comments yet. Be the first to write one!</p>`;
    return;
  }
  const items = comments
    .map(
      (t) =>
        `<li class=\"bg-gray-100 p-3 rounded-md\">${
          t.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }</li>`
    )
    .join("");
  container.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">Saved Comments (${comments.length})</h3>
    <ul class="space-y-2">${items}</ul>
  `;
}

/**
 * Click handler: save a new comment for the current movie and re-render the list.
 * @returns {void}
 */
document.getElementById("write-thoughts-btn").onclick = function () {
  const textarea = document.getElementById("thoughts-textarea");
  const thoughts = (textarea.value || "").trim();
  if (!thoughts) {
    alert("Please write your thoughts before saving.");
    return;
  }
  if (!selectedMovie) {
    alert("No movie selected.");
    return;
  }
  saveCommentForMovie(selectedMovie.id, thoughts);
  textarea.value = "";
  renderComments();
};

// Initial render of existing comments on page load
renderComments();
