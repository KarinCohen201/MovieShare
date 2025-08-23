const reviewsData = {};
const reviewsPerPage = 3;
const currentPage = { 1: 0, 2: 0 };

function loadReviews(linkId, reviews) {
  if (reviews) reviewsData[linkId] = reviews

  const container = document.getElementById(`reviews-${linkId}`);
  container.innerHTML = "";

  if (!currentPage[linkId]) currentPage[linkId] = 0

  const start = currentPage[linkId] * reviewsPerPage;
  const end = start + reviewsPerPage;
  const pageReviews = reviewsData[linkId].slice(start, end);

  pageReviews.forEach((review) => {
    const reviewBox = document.createElement("div");
    reviewBox.className = "review-box";

    const name = review.email ? review.email.split("@")[0] : "";

    reviewBox.innerHTML = `
      <div class="review-header">
        <div class="user-info">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User Icon">
          ${name}
        </div>
        <div class="review-date">
          <img src="https://cdn-icons-png.flaticon.com/512/747/747310.png" alt="Date Icon">
          ${review.createdAt && review.createdAt.substring(0, 10)}
        </div>
      </div>
      <div class="review-text">${review.content}</div>
    `;
    container.appendChild(reviewBox);
  });


  document.getElementById(`prev-${linkId}`).disabled =
    currentPage[linkId] === 0;
  document.getElementById(`next-${linkId}`).disabled =
    end >= reviewsData[linkId].length;
}

function prevPage(linkId) {
  if (currentPage[linkId] > 0) currentPage[linkId]--;
  loadReviews(linkId);
}

function nextPage(linkId) {
  if ((currentPage[linkId] + 1) * reviewsPerPage < reviewsData[linkId].length)
    currentPage[linkId]++;
  loadReviews(linkId);
}

async function addReview(linkId, movieId, textId) {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    return;
  }

  const input = document.getElementById(`review-${textId}`);
  const reviewText = (input?.value || "").trim();
  if (!reviewText) {
    alert("Please write a review first.");
    return;
  }

  try {
    const res = await fetch("/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ linkId, imdbID: movieId, content: reviewText })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data.error ||
        data.message ||
        (res.status === 403 ? "You cannot review your own link." : "Failed to add review");
      alert(msg);
      return;
    }

    const review = data.newReview || data.review || data;

    if (!reviewsData[textId]) reviewsData[textId] = [];
    reviewsData[textId].push({
      user: review.email,
      createdAt: (review.createdAt || new Date().toISOString()).substring(0, 12),
      content: review.content || reviewText,
      email: review.email
    });

    loadReviews(textId);
    if (input) input.value = "";
  } catch (err) {
    console.error(err);
    alert("Network error. Please try again later.");
  }
}
