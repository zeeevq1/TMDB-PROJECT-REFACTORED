const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
const LS_KEY = "favorites";
function loadFavorites() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch  {
        return [];
    }
}
function renderFavorites() {
    const favs = loadFavorites();
    const container = document.getElementById("fav-container");
    container.innerHTML = "";
    if (!favs.length) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-600">No favorites yet.</p>`;
        return;
    }
    favs.forEach((movie)=>{
        const card = document.createElement("div");
        card.className = "bg-white/60 backdrop-blur rounded-lg overflow-hidden shadow-md";
        card.innerHTML = `
      <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}" class="w-full h-auto">
      <div class="p-4">
        <h2 class="text-lg font-semibold text-gray-900">${movie.title}</h2>
        <p class="text-sm text-gray-600">Rating: ${movie.vote_average ?? "-"}</p>
      </div>
    `;
        container.appendChild(card);
    });
}
renderFavorites();

//# sourceMappingURL=favorites.e93a57ed.js.map
