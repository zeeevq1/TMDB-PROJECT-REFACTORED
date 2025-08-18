let apiKey="fcb5f9f40d9acdf7af2d8c38ded9bb12",apiUrl="https://api.themoviedb.org/3/movie/popular?api_key=fcb5f9f40d9acdf7af2d8c38ded9bb12&language=en-US&page=1",imageBaseUrl="https://image.tmdb.org/t/p/w500",LS_KEY="favorites";function loadFavorites(){try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch{return[]}}function saveFavorites(e){localStorage.setItem(LS_KEY,JSON.stringify(e))}function isFav(e){return loadFavorites().some(t=>t.id===e)}function toggleFav(e){let t=loadFavorites(),o=t.findIndex(t=>t.id===e.id);o>=0?t.splice(o,1):t.push({id:e.id,title:e.title,poster_path:e.poster_path,vote_average:e.vote_average,release_date:e.release_date}),saveFavorites(t)}async function fetchMovies(){try{let e=await fetch("https://api.themoviedb.org/3/movie/popular?api_key=fcb5f9f40d9acdf7af2d8c38ded9bb12&language=en-US&page=1"),t=await e.json(),o=t.results;displayMovies(t.results),displayMovies(o),displayShows(o)}catch(e){console.error("Error fetching movies:",e)}}function displayMovies(e){let t=document.getElementById("movie-container");t.innerHTML="",e.forEach(e=>{let o=isFav(e.id),r=document.createElement("div");r.className="bg-white/60 backdrop-blur rounded-lg overflow-hidden shadow-md hover:scale-105 transition transform duration-300 text-gray-900",r.innerHTML=`
      <div class="relative">
        <img src="${imageBaseUrl}${e.poster_path}" alt="${e.title}" class="w-full h-auto">
        <button
          class="fav-btn absolute top-2 right-2 rounded-full p-2 bg-white/80 hover:bg-white shadow"
          aria-label="favorite"
          data-id="${e.id}">
          ${o?'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-pink-500" viewBox="0 0 24 24"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.37 1.05 8.85 1.72 7.01 3.41 5.75 5.39 5.75c1.5 0 2.86.79 3.61 2.02.75-1.23 2.11-2.02 3.61-2.02 1.98 0 3.67 1.26 4.34 3.1.55 1.52.19 3.38-1.52 5.09C18.716 16.65 12 21 12 21z"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>'}
        </button>
      </div>
      <div class="p-4">
        <h2 class="text-lg font-semibold">${e.title}</h2>
        <p class="text-sm text-gray-600">Rating: ${e.vote_average}</p>
      </div>
    `,r.querySelector(".fav-btn").addEventListener("click",t=>{t.stopPropagation(),toggleFav(e),t.currentTarget.innerHTML=isFav(e.id)?'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-pink-500" viewBox="0 0 24 24"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.37 1.05 8.85 1.72 7.01 3.41 5.75 5.39 5.75c1.5 0 2.86.79 3.61 2.02.75-1.23 2.11-2.02 3.61-2.02 1.98 0 3.67 1.26 4.34 3.1.55 1.52.19 3.38-1.52 5.09C18.716 16.65 12 21 12 21z"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>'}),r.addEventListener("click",t=>{document.getElementById("popup").classList.remove("hidden"),t.preventDefault(),populatePopup(e)}),t.appendChild(r)})}function randomFilmArray(e){return e.sort(()=>Math.random()-.5).slice(0,4)}function displayShows(e){e=randomFilmArray(e);let t=document.getElementById("liveshows");t.innerHTML="",e.forEach(e=>{let o=document.createElement("div");o.innerHTML=`
        <a   href="">
              <img
                class="w-full aspect-[16/24] bg-cover rounded-lg overflow-hidden mb-3  max-[910px]:w-[1000px] max-[910px]:bg-fit max-[910px]:h-[350px]"
                src="${imageBaseUrl}${e.poster_path}"
                alt="${e.title}"
              />
              <a
                href="#"
                class="text-[1.1rem] font-bold tracking-normal hover:text-blue-600 transition-colors"
              >
                ${e.title}
              </a>
              <p class="mt-2 text-[0.9rem]">${e.overview}</p>
            </a>
    `,o.addEventListener("click",t=>{document.getElementById("popup").classList.remove("hidden"),t.preventDefault(),populatePopup(e)}),t.appendChild(o)})}fetchMovies();let popup=document.getElementById("popup"),closeBtn=document.getElementById("popupCloseBtn");function populatePopup(e){currentMovieId=e.id,document.querySelector(".info-container h1").textContent=e.title;let t=e.release_date;document.querySelector("#popup .info-film").innerHTML=`
    <p class="bg-orange-400 rounded-md px-2 py-1">Release Year: ${t}</p>
  `;let o=e.vote_average?e.vote_average.toFixed(1):"N/A";document.querySelector("#popup .pop-container .flex.flex-col.items-center p.text-white span").textContent=o;let r=e.popularity?Math.round(e.popularity):"N/A";document.querySelector("#popup .pop-container .flex.items-center.gap-2 p.text-gray-500 span").textContent=r;let a=document.querySelector(".img-popup");a.src=imageBaseUrl+e.poster_path,a.alt=e.title,document.querySelector(".description").textContent=e.overview,popup.classList.remove("hidden"),loadReviewsForMovie(currentMovieId)}closeBtn.addEventListener("click",()=>{popup.classList.add("hidden")});let reviewForm=document.getElementById("reviewForm"),reviewTextarea=document.getElementById("reviewTexareat"),reviewContainer=document.getElementById("reviewContainer"),currentMovieId=null;function getStorageKey(e){return`reviews_${e}`}function loadReviewsForMovie(e){let t=JSON.parse(localStorage.getItem(getStorageKey(e)))||[];reviewContainer.innerHTML="",t.forEach((t,o)=>{let r=document.createElement("div");r.className="bg-gray-100 p-3 mb-2 rounded-md flex justify-between items-center",r.innerHTML=`
      <span class="text-gray-700">${t}</span>
      <button class="text-red-500 hover:text-red-700" data-index="${o}">\u{274C}</button>
    `,r.querySelector("button").addEventListener("click",()=>{deleteReviewForMovie(e,o)}),reviewContainer.appendChild(r)})}function deleteReviewForMovie(e,t){let o=getStorageKey(e),r=JSON.parse(localStorage.getItem(o))||[];r.splice(t,1),localStorage.setItem(o,JSON.stringify(r)),loadReviewsForMovie(e)}reviewForm.addEventListener("submit",e=>{e.preventDefault();let t=reviewTextarea.value.trim();if(t&&currentMovieId){let e=getStorageKey(currentMovieId),o=JSON.parse(localStorage.getItem(e))||[];o.push(t),localStorage.setItem(e,JSON.stringify(o)),reviewTextarea.value="",loadReviewsForMovie(currentMovieId)}else alert("Scrivi qualcosa prima di salvare!")}),document.getElementById("random-film-btn").onclick=async function(){try{let e=await fetch("https://api.themoviedb.org/3/movie/popular?api_key=fcb5f9f40d9acdf7af2d8c38ded9bb12&language=en-US&page=1"),t=(await e.json()).results;if(!t||0===t.length){document.getElementById("film-result").innerHTML="No movies found.";return}let o=t[Math.floor(Math.random()*t.length)];document.getElementById("film-result").innerHTML=`
      <div class="flex flex-col items-center">
        <img src="https://image.tmdb.org/t/p/w300${o.poster_path}" alt="${o.title}" class="mb-4 rounded shadow-lg" />
        <h2 class="text-2xl font-bold mb-2">${o.title}</h2>
        <p class="text-gray-700 mb-2">${o.release_date}</p>
        <p class="text-gray-600 max-w-md">${o.overview}</p>
        <button id="write-thoughts-btn" class="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800 transition">Write your thoughts</button>
      </div>
    `,document.getElementById("write-thoughts-btn").onclick=function(){localStorage.setItem("selectedMovie",JSON.stringify(o)),window.location.href="journal.html"}}catch(e){document.getElementById("film-result").innerHTML="Error fetching movies."}};
//# sourceMappingURL=TMDB-PROJECT-REFACTORED.b0be5a7e.js.map
