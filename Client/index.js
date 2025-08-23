document.addEventListener("DOMContentLoaded", async () => {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
        alert("Please log in first!");
        window.location.href = "/login";
        return;
    }

  
    const usernameDisplay = document.getElementById("username-display");
    const logoutButton = document.getElementById("logout-button");
    const searchInput = document.getElementById("search-movie");
    const containerMoviesDiv = document.getElementById("movies-container");
    const favoritesButton = document.getElementById("all-favorites");
    const topLinksButton = document.getElementById("top-links");
    const adminPanelButton = document.getElementById("admin-panel-button");

    try {
        const username = sessionStorage.getItem("username");
        if (usernameDisplay) {
            usernameDisplay.textContent = username;
        }

        const isAdmin = await checkIfAdmin(email);
        if (isAdmin && adminPanelButton) {
            adminPanelButton.style.display = "block";
            adminPanelButton.addEventListener("click", () => {
                window.location.href = "/admin";
            });
        }
    } catch (error) {
        return;
    
    }


    const storedQuery = sessionStorage.getItem("searchQuery");
    if (searchInput && storedQuery) {
        searchInput.value = storedQuery;
        performSearch(storedQuery, containerMoviesDiv);
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim();
            if (query.length > 3) {
                performSearch(query, containerMoviesDiv);
            } else {
                containerMoviesDiv.innerHTML = ""; 
            }
        });
    }


    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            await fetch("/logout", { method: "POST" });
            sessionStorage.removeItem("userEmail");
            sessionStorage.removeItem("username");
            window.location.href = "/login";
        });
    }


    if (favoritesButton) {
        favoritesButton.addEventListener("click", () => {
            window.location.href ="/favoritesMovies";
        });
    }

    if (topLinksButton) {
        topLinksButton.addEventListener("click", () => {
            window.location.href = "/publicMovies";
        });
    }
});


async function checkIfAdmin(email) {
    try {
        const response = await fetch("/admin/check-admin", {
            method: "POST",  
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })  
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.isAdmin; 
    } catch (error) {
        return false;
    }
}

function handleUnauthorizedRequest(status){
      if (status == 401 || status == 403) {
        sessionStorage.clear();
        window.location.href = "/login";
        return;
      }
}


function getMovieIdFromAddress(){
  const urlParams = new URLSearchParams(window.location.search);
  const imdbID = urlParams.get("imdbid");

  return imdbID;
}

function performSearch(query, container) {
    console.log("Performing search for query:", query);
    sessionStorage.setItem("searchQuery", query);
    container.innerHTML = ""; 

    MovieAPI.fetchMovies(query)
        .then(movies => MovieAPI.RenderMoviesCard(movies, container))
        .catch(error => console.error("Error fetching movies:", error));
}
