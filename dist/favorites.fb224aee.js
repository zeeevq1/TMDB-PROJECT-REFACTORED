let imageBaseUrl="https://image.tmdb.org/t/p/w500",LS_KEY="favorites";function loadFavorites(){try{return JSON.parse(localStorage.getItem("favorites"))||[]}catch{return[]}}function renderFavorites(){let t=loadFavorites(),e=document.getElementById("fav-container");if(e.innerHTML="",!t.length){e.innerHTML='<p class="col-span-full text-center text-gray-600">No favorites yet.</p>';return}t.forEach(t=>{let a=document.createElement("div");a.className="bg-white/60 backdrop-blur rounded-lg overflow-hidden shadow-md",a.innerHTML=`
      <img src="https://image.tmdb.org/t/p/w500${t.poster_path}" alt="${t.title}" class="w-full h-auto">
      <div class="p-4">
        <h2 class="text-lg font-semibold text-gray-900">${t.title}</h2>
        <p class="text-sm text-gray-600">Rating: ${t.vote_average??"-"}</p>
      </div>
    `,e.appendChild(a)})}renderFavorites();
//# sourceMappingURL=favorites.fb224aee.js.map
