const apiKey = "fcb5f9f40d9acdf7af2d8c38ded9bb12";
const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
const LS_KEY = "favorites"; // کلید ذخیره‌سازی

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveFavorites(favs) {
  localStorage.setItem(LS_KEY, JSON.stringify(favs));
}
function isFav(id) {
  const favs = loadFavorites();
  return favs.some((m) => m.id === id);
}
function toggleFav(movie) {
  const favs = loadFavorites();
  const idx = favs.findIndex((m) => m.id === movie.id);
  if (idx >= 0) favs.splice(idx, 1);
  else
    favs.push({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    });
  saveFavorites(favs);
}

async function fetchMovies() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const movies = data.results;

    // If movies don't exist or have 0 elemnts inside.
    if (!movies || movies.length === 0) {
      displayShows([]); // "No movies found (exmpty array"
      return;
    }
    displayMovies(movies);
    displayShows(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    displayShows([]);
  }
}

function displayMovies(movies) {
  const container = document.getElementById("movie-container");
  container.innerHTML = "";

  movies.forEach((movie) => {
    const faved = isFav(movie.id);
    const movieCard = document.createElement("div");
    movieCard.className =
      "bg-white/60 backdrop-blur rounded-lg overflow-hidden shadow-md hover:scale-105 transition transform duration-300 text-gray-900";

    movieCard.innerHTML = `
      <div class="relative">
        <img src="${imageBaseUrl}${movie.poster_path}" alt="${
      movie.title
    }" class="w-full h-auto">
        <button
          class="fav-btn absolute top-2 right-2 rounded-full p-2 bg-white/80 hover:bg-white shadow"
          aria-label="favorite"
          data-id="${movie.id}">
          ${
            faved
              ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-pink-500" viewBox="0 0 24 24"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.37 1.05 8.85 1.72 7.01 3.41 5.75 5.39 5.75c1.5 0 2.86.79 3.61 2.02.75-1.23 2.11-2.02 3.61-2.02 1.98 0 3.67 1.26 4.34 3.1.55 1.52.19 3.38-1.52 5.09C18.716 16.65 12 21 12 21z"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>`
          }
        </button>
      </div>
      <div class="p-4">
        <h2 class="text-lg font-semibold">${movie.title}</h2>
        <p class="text-sm text-gray-600">Rating: ${movie.vote_average}</p>
      </div>
    `;

    movieCard.querySelector(".fav-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(movie);

      const btn = e.currentTarget;
      const nowFav = isFav(movie.id);
      btn.innerHTML = nowFav
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-pink-500" viewBox="0 0 24 24"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.37 1.05 8.85 1.72 7.01 3.41 5.75 5.39 5.75c1.5 0 2.86.79 3.61 2.02.75-1.23 2.11-2.02 3.61-2.02 1.98 0 3.67 1.26 4.34 3.1.55 1.52.19 3.38-1.52 5.09C18.716 16.65 12 21 12 21z"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>`;
    });

    movieCard.addEventListener("click", (e) => {
      document.getElementById("popup").classList.remove("hidden");
      e.preventDefault();
      populatePopup(movie);
    });

    container.appendChild(movieCard);
  });
}

fetchMovies();

/**
 * Show 4 films from one random array.
 * @function randomFilmArray
 * @param {Object[]} array - Complet list of films.
 * @returns {Object[]} New array with 4 random films.
 */
function randomFilmArray(array) {
  return array.sort(() => Math.random() - 0.5).slice(0, 4);
}

/**
 * Show Casual cards into the  "Live Shows" section.
 *
 * @function displayShows
 * @param {Object[]} movies - Films list from dall'API TMDB.
 * @param {string} movies[].title - Titol of Film.
 * @param {string} movies[].overview - Description of film.
 * @param {string} movies[].poster_path - Image for each film from TMDB.
 *
 * @example
 * // Example of how to use displayShows function:
 * displayShows(moviesArray);
 */
function displayShows(movies) {
  movies = randomFilmArray(movies);
  const showContainer = document.getElementById("liveshows");
  showContainer.innerHTML = "";

  // Handle  edge-case: array empty or null
  if (!movies || movies.length === 0) {
    showContainer.classList.remove("grid");
    showContainer.innerHTML = `
      <div class="flex flex-col  p-20 items-center justify-center text-gray-500 mt-6">
        <img 
          src="../img/scared.jpg" 
          alt="No movies" 
          class="w-[70rem] h-[30rem] object-scale-down rounded-lg mb-4 max-[910px]:w-[1000px] max-[910px]:h-[350px] max-[910px]:object-cover max-[910px]:object-center"
        />
        <p class="text-2xl font-semibold">Oops! No movies found</p>
        <p class="text-md text-gray-600 mt-2">Please try again later, the API might be offline or doens't work..</p>
      </div>
    `;
    return;
  }

  movies.forEach((movie) => {
    const showCard = document.createElement("div");

    showCard.innerHTML = `
        <a   href="">
              <img
                class="w-full aspect-[16/24] bg-cover rounded-lg overflow-hidden mb-3  max-[910px]:w-[1000px] max-[910px]:bg-fit max-[910px]:h-[350px]"
                src="${imageBaseUrl}${movie.poster_path}"
                alt="${movie.title}"
              />
              <a
                href="#"
                class="text-[1.1rem] font-bold tracking-normal hover:text-blue-600 transition-colors"
              >
                ${movie.title}
              </a>
              <p class="mt-2 text-[0.9rem]">${movie.overview}</p>
            </a>
    `;

    // When we click on the showCard, we want to open the popup
    showCard.addEventListener("click", (e) => {
      document.getElementById("popup").classList.remove("hidden");
      e.preventDefault();
      populatePopup(movie);
    });

    showContainer.appendChild(showCard);
  });
}

const popup = document.getElementById("popup");

// Close button functionality for the popup
const closeBtn = document.getElementById("popupCloseBtn");

closeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

//POP UP FUNCTIONALITY

/**
 * Fills the popup with detailed information about a movie
 * and makes the modal visible.
 *
 * @function populatePopup
 * @param {Movie} movie - Movie object containing TMDB data.
 *
 * @example
 * // Example usage:
 * populatePopup({
 *   id: 123,
 *   title: "Inception",
 *   overview: "A mind-bending thriller...",
 *   release_date: "2010-07-16",
 *   poster_path: "/abc123.jpg",
 *   vote_average: 8.8,
 *   popularity: 350
 * });
 */
function populatePopup(movie) {
  currentMovieId = movie.id;

  const titlePopUp = document.querySelector(".info-container h1");
  // Title of the movie in the popup
  titlePopUp.textContent = movie.title;

  // Release year of the movie in the popup
  const year = movie.release_date;
  const infoFilm = document.querySelector("#popup .info-film");
  infoFilm.innerHTML = `
    <p class="bg-orange-400 rounded-md px-2 py-1">Release Year: ${year}</p>
  `;

  // Rating of the movie in the popup
  const ratingValue = movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";
  document.querySelector(
    "#popup .pop-container .flex.flex-col.items-center p.text-white span"
  ).textContent = ratingValue;

  const popularity = movie.popularity ? Math.round(movie.popularity) : "N/A";
  document.querySelector(
    "#popup .pop-container .flex.items-center.gap-2 p.text-gray-500 span"
  ).textContent = popularity;

  // Poster image of the movie in the popup
  const imageElem = document.querySelector(".img-popup");
  imageElem.src = imageBaseUrl + movie.poster_path;
  imageElem.alt = movie.title;

  document.querySelector(".description").textContent = movie.overview;

  popup.classList.remove("hidden");

  loadReviewsForMovie(currentMovieId);
}

//REVIEW FUNCTIONALITY

/**
 * Returns the localStorage key for storing reviews of a movie
 * @param {number} movieId - Movie ID
 * @returns {string} - Key for localStorage
 */
function getStorageKey(movieId) {
  return `reviews_${movieId}`;
}

/**
 * Loads and displays reviews for a given movie
 * @param {number} movieId - Movie ID
 */
function loadReviewsForMovie(movieId) {
  const reviews =
    JSON.parse(localStorage.getItem(getStorageKey(movieId))) || [];
  reviewContainer.innerHTML = "";

  reviews.forEach((review, index) => {
    const reviewDiv = document.createElement("div");
    reviewDiv.className =
      "bg-gray-100 p-3 mb-2 rounded-md flex justify-between items-center";

    reviewDiv.innerHTML = `
      <span class="text-gray-700">${review}</span>
      <button class="text-red-500 hover:text-red-700">❌</button>
    `;

    reviewDiv.querySelector("button").addEventListener("click", () => {
      deleteReviewForMovie(movieId, index);
    });

    reviewContainer.appendChild(reviewDiv);
  });
}

/**
 * Deletes a specific review for a movie
 * Updates the UI and localStorage
 * @param {number} movieId - Movie ID
 * @param {number} index - Index of the review to delete
 */
function deleteReviewForMovie(movieId, index) {
  const key = getStorageKey(movieId);
  const reviews = JSON.parse(localStorage.getItem(key)) || [];
  reviews.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(reviews));
  loadReviewsForMovie(movieId);
}

// the following part from hua: This function is triggered when the "Random Film" button is clicked
document.getElementById("random-film-btn").onclick = async function () {
  const apiKey = "fcb5f9f40d9acdf7af2d8c38ded9bb12"; // <-- Replace with your TMDB API key
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const movies = data.results;
    if (!movies || movies.length === 0) {
      document.getElementById("film-result").innerHTML = "No movies found.";
      return;
    }
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    document.getElementById("film-result").innerHTML = `
      <div class="flex flex-col items-center">
        <img src="https://image.tmdb.org/t/p/w300${randomMovie.poster_path}" alt="${randomMovie.title}" class="mb-4 rounded shadow-lg" />
        <h2 class="text-2xl font-bold mb-2">${randomMovie.title}</h2>
        <p class="text-gray-700 mb-2">${randomMovie.release_date}</p>
        <p class="text-gray-600 max-w-md">${randomMovie.overview}</p>
        <button id="write-thoughts-btn" class="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800 transition">Write your thoughts</button>
      </div>
    `;

    // Add event listener for the new button
    document.getElementById("write-thoughts-btn").onclick = function () {
      // Save movie info to localStorage
      localStorage.setItem("selectedMovie", JSON.stringify(randomMovie));
      // Redirect to journal.html
      window.location.href = "journal.html";
    };
  } catch (error) {
    document.getElementById("film-result").innerHTML = "Error fetching movies.";
  }
};

// Enable navigation from the static "Films" section to the journal page
(function enableStaticFilmsNavigation() {
  try {
    const toSlug = (text) =>
      String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const filmArticles = document.querySelectorAll("feature section article");
    if (!filmArticles || filmArticles.length === 0) return;

    filmArticles.forEach((article) => {
      const img = article.querySelector("img");
      const titleEl = article.querySelector("span");
      const descEl = article.querySelector("p");
      const title = titleEl ? titleEl.textContent.trim() : "Untitled";
      const posterUrl = img ? img.src : "";
      const overview = descEl ? descEl.textContent.trim() : "";
      const movie = {
        id: `static_${toSlug(title)}`,
        title,
        poster_path: posterUrl, // journal.js will handle full URLs
        poster_url: posterUrl,
        release_date: "",
        overview,
      };

      article.style.cursor = "pointer";
      article.addEventListener("click", () => {
        localStorage.setItem("selectedMovie", JSON.stringify(movie));
        window.location.href = "journal.html";
      });
    });
  } catch (err) {
    // No-op: static films section might not exist on some pages
  }
})();
