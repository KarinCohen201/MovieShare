const reviewsData = {

};


const reviewsPerPage = 3;
const currentPage = { 1: 0, 2: 0 };

function loadReviews(linkId, reviews) {
  if(reviews) reviewsData[linkId] = reviews

  const container = document.getElementById(`reviews-${linkId}`);
  container.innerHTML = "";
  
  if(!currentPage[linkId]) currentPage[linkId] = 0

  const start = currentPage[linkId] * reviewsPerPage;
  const end = start + reviewsPerPage;
  const pageReviews = reviewsData[linkId].slice(start, end);

  pageReviews.forEach((review) => {
    const reviewBox = document.createElement("div");
    reviewBox.className = "review-box";
    reviewBox.innerHTML = `
                    <div class="review-header">
                        <div class="user-info">
                            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User Icon">
                            ${review.email && review.email.substring(0,4)}
                        </div>
                        <div class="review-date">
                            <img src="https://cdn-icons-png.flaticon.com/512/747/747310.png" alt="Date Icon">
                            ${review.createdAt && review.createdAt.substring(0,10)}
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
  const email = sessionStorage.getItem("userEmail");
  const reviewText = document.getElementById(`review-${textId}`).value;
  try {

    const response = await fetch("/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId, imdbID: movieId, email, content: reviewText }),
    });

    const { newReview } = await response.json()

    reviewsData[textId].push({
      user: newReview.email,
      createdAt: newReview.createdAt.substring(0,12),
      content: reviewText,
      email: email,
    });

    loadReviews(textId);
  } catch (error) {
    console.log(error);
  }
}
