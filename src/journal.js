// Display selected movie info if available
const selectedMovie = JSON.parse(localStorage.getItem("selectedMovie"));
if (selectedMovie) {
  document.getElementById("film-result").innerHTML = `
    <div class="flex flex-col items-center">
      <img src="https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}" alt="${selectedMovie.title}" class="mb-4 rounded shadow-lg" />
      <h2 class="text-2xl font-bold mb-2">${selectedMovie.title}</h2>
      <p class="text-gray-700 mb-2">${selectedMovie.release_date}</p>
      <p class="text-gray-600 max-w-md">${selectedMovie.overview}</p>
    </div>
  `;
}

document.getElementById("write-thoughts-btn").onclick = function () {
  const thoughts = document.getElementById("thoughts-textarea").value.trim();
  if (!thoughts) {
    alert("Please write your thoughts before saving.");
    return;
  }
  if (!selectedMovie) {
    alert("No movie selected.");
    return;
  }
  let movieThoughts = JSON.parse(localStorage.getItem("movieThoughts") || "{}");
  movieThoughts[selectedMovie.id] = thoughts;
  localStorage.setItem("movieThoughts", JSON.stringify(movieThoughts));
  alert("Your thoughts have been saved!");
};
