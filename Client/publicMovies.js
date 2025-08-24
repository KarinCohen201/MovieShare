document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/links/public");
        if (!response.ok) throw new Error("Failed to fetch public movies");

        const movies = await response.json();
        console.log("Movies received from server:", movies);

        const moviesTableBody = document.getElementById("movies-table-body");

        if (!movies || movies.length === 0) {
            console.log("No public movies found.");
            moviesTableBody.innerHTML = "<tr><td colspan='5'>No public movies available.</td></tr>";
            return;
        }

        moviesTableBody.innerHTML = ""; 

        movies.forEach(movie => {
            const posterUrl = movie.moviePoster && movie.moviePoster !== "N/A"
                ? movie.moviePoster
                : "default_poster.png";

            let row = `
                <tr>
                    <td><img src="${posterUrl}" alt="${movie.movieTitle}" width="60" height="90"></td>
                    <td>${movie.movieTitle || "Unknown Title"}</td>
                    <td><a href="${movie.url}" target="_blank">${movie.urlName}</a></td>
                    <td>${movie.averageRating !== "No Ratings" ? movie.averageRating.toFixed(1) : "No Ratings"}</td>
                    <td>
                        <button class="btn btn-primary" onclick="viewMovie('${movie.imdbID}')">View</button>
                    </td>
                </tr>
            `;

            moviesTableBody.insertAdjacentHTML("beforeend", row);
        });

    } catch (error) {
        console.error("Error fetching public movies:", error.message);
        document.getElementById("movies-table-body").innerHTML = 
            "<tr><td colspan='5'>Error loading movies. Please try again later.</td></tr>";
    }
});


function viewMovie(imdbID) {
    window.location.href = `/details?imdbid=${imdbID}`;
}
