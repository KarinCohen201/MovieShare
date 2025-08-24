/** Fetch favorite movies from the server for the currently logged-in user. */
let favoriteMoviesList = [];

async function fetchFavorites() {
  const email = sessionStorage.getItem("userEmail");
  if (!email) {
    alert("Please log in first!");
    window.location.href = "/login";
  }

  try {
    const response = await fetch(`/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"), 
      },
    });

    handleUnauthorizedRequest(response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch favorites.");
    }

    favoriteMoviesList = await response.json();
    return favoriteMoviesList;
  } catch (error) {
    return null;
  }
}

async function updateFavoritesButton(imdbid) {
  const button = document.getElementById("favorites-button");
  const email = sessionStorage.getItem("userEmail");

  if (!email) {
    console.warn("User is not logged in. Can't update favorites button.");
    return;
  }

  try {
    const response = await fetch(`/is-favorite?imdbID=${imdbid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });

    handleUnauthorizedRequest(response.status);
    const data = await response.json();

    console.log("Favorite check response:", data);

    if (data.isFavorite) {
      button.textContent = "Remove from Favorites";
      button.classList.add("btn-danger");
      button.classList.remove("btn-success");
    } else {
      button.textContent = "Add to Favorites";
      button.classList.add("btn-success");
      button.classList.remove("btn-danger");
    }
  } catch (error) {
      return;
  }
}


async function toggleFavorite(movie) {
  console.log("SessionStorage userEmail:", sessionStorage.getItem("userEmail"));
  console.log("SessionStorage username:", sessionStorage.getItem("username"));

  const email = sessionStorage.getItem("userEmail");
  const username = sessionStorage.getItem("username");

  if (!email || !username) {
    alert("Please log in first!");
    window.location.href = "/login";
    return;
  }

  try {
    // Check if the movie is already in favorites
    const isCurrentlyFavorite = await isFavorite(movie.imdbid);

    let response;
    if (isCurrentlyFavorite) {
      // If the movie is already in favorites, send a DELETE request to remove it
      response = await fetch("/remove-favorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" ,  Authorization: "Bearer " + sessionStorage.getItem("token") },
        body: JSON.stringify({ imdbID: movie.imdbid }),
      });
    } else {
      // If the movie is not in favorites, send a POST request to add it
      response = await fetch("/add-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json",  Authorization: "Bearer " + sessionStorage.getItem("token")},
        body: JSON.stringify({
          imdbID: movie.imdbid,
          username,
          title: movie.title,
          year: movie.year,
          poster: movie.poster,
          rating: movie.rating,
        }),
      });
    }
    handleUnauthorizedRequest(response.status);
    
    const data = await response.json();
    console.log("Server Response:", response.status, data);

    if (!response.ok) {
      throw new Error("Failed to update favorites.");
    }

    alert(data.message);

    // Update the button appearance based on the new state
    await updateFavoritesButton(movie.imdbid);

    // If the movie is in favorites, show the links table; otherwise, hide it
    if (await isFavorite(movie.imdbid)) {
      renderLinksTable();
    } else {
      document.getElementById("movie-links").style.display = "none";
    }
  } catch (error) {
    return;
  }
}

async function isFavorite(imdbid) {
  const email = sessionStorage.getItem("userEmail");

  if (!email) {
    alert("Please log in first!");
    window.location.href = "/login";
  }

  try {
    const response = await fetch(
      `/is-favorite?imdbID=${imdbid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      }
    );

    const data = await response.json();

    handleUnauthorizedRequest(data.status)

    console.log("isFavorite response:", data);

    return data.isFavorite; // true or false
  } catch (error) {
    return false;
  }
}
// Function to sort movies
async function fetchUserMovies() {
  const token = sessionStorage.getItem("token"); 
  if (!token) {
      console.error("No token found, redirecting to login.");
      window.location.href = "/login"; 
      return [];
  }

  try {
      const response = await fetch("/favorites", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
          }
      });

      if (!response.ok) throw new Error("Failed to fetch movies");

      return await response.json();
  } catch (error) {
      return [];
  }
}


function sortMovies(criteria) {
  if (!favoriteMoviesList || !favoriteMoviesList.length) {
    return;
  }

  console.log("Sorting by:", criteria); 
  console.log("Before sorting:", favoriteMoviesList);
 
  switch (criteria) {
    case "name":
      favoriteMoviesList.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "year":
      favoriteMoviesList.sort((a, b) => (a.year || 0) - (b.year || 0));
      break;
    case "rating":
      favoriteMoviesList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
  }

  console.log("After sorting:", favoriteMoviesList); 


  const container = document.getElementById("favorites-container");
  if (!container) {
    return;
  }

  renderMovies(favoriteMoviesList, container); 
}



// `movies` is an array of objects, where each object represents a movie
// as stored in the MongoDB database.
function renderMovies(movies, container) {
  container.innerHTML = "";

  if (movies.length === 0) {
    container.innerHTML = "<p>No favorite movies found.</p>";
    return;
  }

  movies.forEach((movie) => {
    const card = `
            <div class="col-md-3 d-flex justify-content-center">
              <div class="card" style="width: 18rem;">
                <img src="${movie.poster}" class="card-img-top" alt="${movie.title}">
                <div class="card-body">
                  <h5 class="card-title">${movie.title}</h5>
                  <p class="card-text">${movie.year}</p>
                  <button onclick="handleMovieDetails('${movie.imdbID}')" class="btn btn-primary">Details</button>
                </div>
              </div>
            </div>
          `;


    container.insertAdjacentHTML("beforeend", card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favorites-container");
  if (!container) {
    return;
  }
  const sortOptions = document.getElementById("sort-options");

  const email = sessionStorage.getItem("userEmail");
  if (!email) {
    alert("Please log in first!");
    window.location.href = "/login"; 
    return;
  }
  favoriteMoviesList = await fetchFavorites(); 
  sortOptions.addEventListener("change", (event) => {
    const selectedOption = event.target.value;
    sortMovies(selectedOption);
  });
  

  renderMovies(favoriteMoviesList, container);
});
