let selectedMovie=JSON.parse(localStorage.getItem("selectedMovie"));selectedMovie&&(document.getElementById("film-result").innerHTML=`
    <div class="flex flex-col items-center">
      <img src="https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}" alt="${selectedMovie.title}" class="mb-4 rounded shadow-lg" />
      <h2 class="text-2xl font-bold mb-2">${selectedMovie.title}</h2>
      <p class="text-gray-700 mb-2">${selectedMovie.release_date}</p>
      <p class="text-gray-600 max-w-md">${selectedMovie.overview}</p>
    </div>
  `),document.getElementById("write-thoughts-btn").onclick=function(){let e=document.getElementById("thoughts-textarea").value.trim();if(!e)return void alert("Please write your thoughts before saving.");if(!selectedMovie)return void alert("No movie selected.");let t=JSON.parse(localStorage.getItem("movieThoughts")||"{}");t[selectedMovie.id]=e,localStorage.setItem("movieThoughts",JSON.stringify(t)),alert("Your thoughts have been saved!")};
//# sourceMappingURL=journal.b174f7c1.js.map
