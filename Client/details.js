/** Simple function to fetch the top search result for an official trailer on YouTube (YouTube Data API) */
async function fetchYouTubeTrailer(movieTitle, apiKey, trailerButton) {
  try {
    const getTrailer = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${movieTitle}%20trailer&topicId=%2Fm%2F02vxn&key=${apiKey}`
    );

    if (!getTrailer.ok) {
      console.log("trailer unavailable at the moment");
      trailerButton.innerHTML = `trailer unavailable at the moment`;
      return;
    }
    const data = await getTrailer.json();
    trailerButton.innerHTML = `<iframe width="420" height="315"
    src="https://www.youtube.com/embed/${data.items[0].id.videoId}">
    </iframe>`;

  } catch (error) {
    console.log("trailer unavailable at the moment");
    trailerButton.innerHTML = `trailer unavailable at the moment`;
    return;
  }
}
function openRatingModal(linkId) {
  Swal.fire({
    title: "Add Rating",
    input: "select",
    inputOptions: {
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
    },
    inputPlaceholder: "Select a rating",
    showCancelButton: true,
    confirmButtonText: "Submit",
    preConfirm: (score) => {
      return fetch("/links/add-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        body: JSON.stringify({
          linkId: linkId,
          user: sessionStorage.getItem("username") || "Guest",
          score: parseInt(score),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            data.message === "Rating added" ||
            data.message === "Rating updated"
          ) {
            Swal.fire(
              "Success!",
              `Rating updated! New average: ${data.averageRating.toFixed(1)}`,
              "success"
            );

            document.querySelector(`#rating-${linkId}`).textContent =
              data.averageRating.toFixed(1);

            renderLinksTable();
          } else {
            Swal.fire("Error", data.message, "error");
          }
        })
        .catch((error) => {
          Swal.fire("Error", "Something went wrong!", "error");
          //console.error("Error:", error);
          return;
        });
    },
  });
}

async function renderLinksTable() {
  const imdbID = getMovieIdFromAddress();

  try {
    const token = sessionStorage.getItem('token')
    //  Fetch links from the server
    const response = await fetch(`/links?imdbID=${imdbID}`,{
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch links");

    let movieLinks = await response.json();
    console.log("Links fetched from server:", movieLinks);

    if (!movieLinks || movieLinks.length === 0) {
      console.log("No links found for this movie.");
    }

    movieLinks.sort((a, b) => {
      // If both are public, sort by averageRating (higher first)
      if (a.linkType === "public" && b.linkType === "public") {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      // If one is private, move it to the bottom
      if (a.linkType === "private" && b.linkType === "public") {
        return 1;
      }
      if (a.linkType === "public" && b.linkType === "private") {
        return -1;
      }
      return 0;
    });

    const linksContainer = document.getElementById("movie-links");
    const linksTableBody = document.getElementById("links-table-body");
    const linksTableBox = document.getElementById("links-Box");
    const addLinkButton = document.getElementById("add-link-button");

    linksContainer.style.display = "block";
    addLinkButton.style.display = "block";

    linksTableBox.innerHTML = "";
    movieLinks.forEach((link, index) => {
      const linkWrapper = document.createElement("div");
      linkWrapper.classList.add("link-wrapper");

      linkWrapper.innerHTML = `
         <div class="movie-info">
        <a href="${link.url}" target="_blank">
          Watch Link
        </a>
        <p>
          <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="Description" style="width: 20px; height: 20px;"/>
          Description: ${link.description}
        </p>
        <p>
          <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="User" style="width: 20px; height: 20px;"/>
          User: ${link.username}
        </p>
        <p>
          <img src="https://cdn-icons-png.flaticon.com/512/126/126474.png" alt="Type" style="width: 20px; height: 20px;"/>
          ${link.linkType}
        </p>
        <p>
          <img src="https://cdn-icons-png.flaticon.com/512/2107/2107957.png" alt="Rating" style="width: 20px; height: 20px;"/>
          Rating: <span id="rating-${link._id}">${link.averageRating}</span>
        </p>
        
        <div style="margin-top: 10px; display: flex; flex-direction: row; width: 100px;">
            <button class="btn btn-primary btn-sm rate-btn" onclick="openRatingModal('${
              link._id
            }')" style="width: 40px;height:40px;" data-id="${
        link._id
      }"><img src="assets/fav.png" class="icon"></img></button>
                        <button class="btn btn-info btn-sm edit-btn" onclick="editLink('${
                          link._id
                        }', '${link.urlName}',  '${link.url}','${
        link.description
      }', '${link.linkType}')"
                           data-id="${link._id}"
                           data-name="${link.urlName}"
                           data-url="${link.url}"
                           data-description="${link.description}"
                           data-type="${link.linkType}">
                           <img src="assets/edit1.png" class="icon"></img>
                       </button>
                        <button class="btn btn-danger btn-sm delete-btn" onclick="deleteLink('${
                          link._id
                        }')" data-id="${
        link._id
      }"><img src="assets/delete.png" class="icon"></button>
        </div>
      </div>
      <div class="link-container">
        <div class="link-header">
          <a href="${link.url}" target="_blank" class="watch-link">${
        link.urlName
      }</a>
          <div class="pagination">
            <button onclick="prevPage(${index + 1})" id="prev-${
        index + 1
      }" disabled>
              <img src="https://cdn-icons-png.flaticon.com/512/271/271220.png" alt="Prev" />
            </button>
            <button onclick="nextPage(${index + 1})" id="next-${index + 1}">
              <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Next" />
            </button>
          </div>
        </div>
        <div class="reviews-list" id="reviews-${index + 1}"></div>

      </div>
    `;

      linksTableBox.appendChild(linkWrapper);

      const reviewWrapper = document.createElement("div");
      reviewWrapper.classList.add("add-review-container");

      reviewWrapper.innerHTML = `
        <p>
          <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="User" style="width: 20px; height: 20px;"/>
          ${sessionStorage.getItem("username")}
        </p>
          <textarea id="review-${
            index + 1
          }" placeholder="Your Review"></textarea>
          <button onclick="addReview('${link._id}', '${link.imdbID}', ${
        index + 1
      })">Submit Review</button>
        `;

      linkWrapper.appendChild(reviewWrapper);

      loadReviews(index + 1, link.reviews);
    });
  } catch (error) {
    console.error("Error fetching movie links:", error);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const imdbid = urlParams.get("imdbid");
  ``;
  const query = urlParams.get("query") || "";
  let currentMovie;

  // IMDb link
  const imdbLinkElement = document.querySelector("#imdb-link");
  if (imdbLinkElement) {
    const imdbUrl = `https://www.imdb.com/title/${imdbid}/`;
    imdbLinkElement.href = imdbUrl;
    imdbLinkElement.target = "_blank";
    imdbLinkElement.textContent = "View on IMDb";
  }

  // Attach event listener to the favorites button
  const favoritesButton = document.getElementById("favorites-button");

  if (favoritesButton) {
    favoritesButton.addEventListener("click", () => {
      if (currentMovie) {
        toggleFavorite(currentMovie);
      }
    });
  }

  if (document.getElementById("add-link-button"))
    document
      .getElementById("add-link-button")
      .addEventListener("click", addLink);
  if (document.getElementById("upload-links"))
    document
      .getElementById("upload-links")
      .addEventListener("click", uploadLinks);

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      console.log("data-id!", button.getAttribute("data-id"));
      const linkId = button.getAttribute("data-id");
      deleteLink(linkId);
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-btn")) {
      const button = event.target;
      const linkId = button.getAttribute("data-id");
      const currentData = {
        urlName: button.getAttribute("data-name") || "",
        url: button.getAttribute("data-url") || "",
        description: button.getAttribute("data-description") || "",
        linkType: button.getAttribute("data-type") || "public",
      };

      console.log("Clicked Edit Button for ID:", linkId);
      console.log("Extracted currentData:", currentData);

      editLink(linkId, currentData);
    }
  });

  // Trailer button fallback
  const trailerButton = document.getElementById("trailer-button");
  const apiKey = `AIzaSyB3D3hpZoD54DdLOWWNIRrLGBWjKJ2fL8M`;

  MovieAPI.fetchMoviesDetails(imdbid)
    .then(async (movie) => {
      if (!movie) {
        document.querySelector(
          "#movie-details"
        ).innerHTML = `<p>Movie not found.</p>`;
        return;
      }

      currentMovie = movie;

      document.querySelector("#movie-title").textContent = movie.title;
      document.querySelector("#movie-poster").src =
        movie.poster !== "N/A" ? movie.poster : "default_poster.png";
      document.querySelector(
        "#movie-year"
      ).innerHTML = `<strong>Year:</strong> ${movie.year}`;
      document.querySelector(
        "#movie-genre"
      ).innerHTML = `<strong>Genre:</strong> ${movie.genre}`;
      document.querySelector(
        "#movie-director"
      ).innerHTML = `<strong>Director:</strong> ${movie.director}`;
      document.querySelector(
        "#movie-actors"
      ).innerHTML = `<strong>Actors:</strong> ${movie.actors}`;
      document.querySelector(
        "#movie-plot"
      ).innerHTML = `<strong>Plot:</strong> ${movie.plot}`;
      document.querySelector(
        "#movie-rating"
      ).innerHTML = `<strong>Rating:</strong> ${movie.rating}`;

      await updateFavoritesButton(movie.imdbid);

      try {
        await fetchYouTubeTrailer(movie.title, apiKey, trailerButton);
      } catch (error) {}

      if (await isFavorite(movie.imdbid)) {
        renderLinksTable();
      } else {
        document.getElementById("movie-links").style.display = "none";
      }
    })
    .catch((error) => {
      return;
    });

  // Handle "Back to Search" button
  document
    .querySelector("#back-to-search")
    .addEventListener("click", function (event) {
      event.preventDefault();
      const backUrl = query
        ? `/index?query=${encodeURIComponent(query)}`
        : `/index`;
      window.location.href = backUrl;
    });

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("rate-btn")) {
      const linkId = event.target.getAttribute("data-id");
      openRatingModal(linkId);
    }
  });
});
