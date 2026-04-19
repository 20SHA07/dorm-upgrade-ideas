const dormOptions = [
  {
    id: 1,
    title: "Pool & Jacuzzi",
    shortText: "Relaxation and swimming area",
    description: "A pool and jacuzzi would help students relax and unwind after classes.",
    tag: "Wellbeing",
    image: "images/Pool jaz.jpg.jpeg",
    reviews: []
  },
  {
    id: 2,
    title: "Skating Park",
    shortText: "Outdoor skating space",
    description: "A skating park would give students a fun and active way to spend free time.",
    tag: "Recreation",
    image: "images/skaetpark.jpg.jpeg",
    reviews: []
  },
  {
    id: 3,
    title: "Food Trucks",
    shortText: "Variety of quick meals",
    description: "Food trucks would offer affordable and diverse food options right near the dorms.",
    tag: "Daily Life",
    image: "images/food-truck.jpg.jpeg",
    reviews: []
  },
  {
    id: 4,
    title: "Underground Mall",
    shortText: "Shops below dorms",
    description: "An underground mall could include cafes, stores, and services for convenience.",
    tag: "Convenience",
    image: "images/tenjin-underground-mall.jpg.jpeg",
    reviews: []
  },
  {
    id: 5,
    title: "Parking Lot Building",
    shortText: "Organized parking space",
    description: "A multi-level parking building would solve parking issues and improve safety.",
    tag: "Infrastructure",
    image: "images/a-brief-history-of-parking-garage-design_1.jpg.jpeg",
    reviews: []
  },
  {
    id: 6,
    title: "Theatre with Bean Bags",
    shortText: "Comfortable movie space",
    description: "A theatre with bean bags would create a cozy place for movies and events.",
    tag: "Entertainment",
    image: "images/theatre.png",
    reviews: []
  },
  {
    id: 7,
    title: "Music & Karaoke",
    shortText: "Sing and play music",
    description: "A karaoke and music room would help students express themselves and have fun.",
    tag: "Social Life",
    image: "images/Karaoke.jpg.jpeg",
    reviews: []
  },
  {
    id: 8,
    title: "Golf Carts",
    shortText: "Easy transport around campus",
    description: "Golf carts would make it easier for students to move around large dorm areas.",
    tag: "Transport",
    image: "images/Yamaha_Drive_2_golf_car.jpg.jpeg",
    reviews: []
  }
];

const grid = document.getElementById("optionsGrid");
const home = document.getElementById("homeSection");
const panel = document.getElementById("reviewPanel");
const title = document.getElementById("detailTitle");
const desc = document.getElementById("detailDescription");
const detailTag = document.getElementById("detailTag");
const detailImage = document.getElementById("detailImage");
const ratingSummary = document.getElementById("ratingSummary");
const reviewsBox = document.getElementById("reviewsContainer");
const starsBox = document.getElementById("starContainer");
const form = document.getElementById("reviewForm");
const nameInput = document.getElementById("reviewerName");
const reviewInput = document.getElementById("reviewText");
const formError = document.getElementById("formError");
const backBtn = document.getElementById("backBtn");
const serverStatus = document.getElementById("serverStatus");
const featureCount = document.getElementById("featureCount");
const totalReviewCount = document.getElementById("totalReviewCount");
const overallAverage = document.getElementById("overallAverage");
const reviewsMeta = document.getElementById("reviewsMeta");

let selectedOption = null;
let currentRating = 0;
let lastOpenedButton = null;

const supabaseConfig = window.APP_CONFIG || {};
const hasSupabaseConfig =
  typeof supabaseConfig.supabaseUrl === "string" &&
  supabaseConfig.supabaseUrl.includes("supabase.co") &&
  typeof supabaseConfig.supabaseAnonKey === "string" &&
  !supabaseConfig.supabaseAnonKey.startsWith("YOUR-");

const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseAnonKey)
  : null;

function buildCard(option) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "option-card";
  card.setAttribute("role", "listitem");
  card.setAttribute("aria-label", `Open details for ${option.title}`);

  const image = document.createElement("img");
  image.className = "card-image";
  image.src = option.image;
  image.alt = `${option.title} preview`;
  image.loading = "lazy";
  card.appendChild(image);

  const heading = document.createElement("h3");
  heading.textContent = option.title;
  card.appendChild(heading);

  const text = document.createElement("p");
  text.textContent = option.shortText;
  card.appendChild(text);

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = option.tag;
  card.appendChild(tag);

  const count = document.createElement("p");
  count.className = "card-review-count";
  count.textContent = `${option.reviews.length} review${option.reviews.length === 1 ? "" : "s"}`;
  card.appendChild(count);

  card.addEventListener("click", () => {
    lastOpenedButton = card;
    openOption(option.id);
  });

  return card;
}

function renderCards() {
  grid.innerHTML = "";
  dormOptions.forEach((option) => {
    grid.appendChild(buildCard(option));
  });
  renderOverviewStats();
}

function openOption(optionId) {
  selectedOption = dormOptions.find((option) => option.id === optionId) || null;

  if (!selectedOption) {
    return;
  }

  title.textContent = selectedOption.title;
  desc.textContent = selectedOption.description;
  detailTag.textContent = selectedOption.tag;
  detailImage.src = selectedOption.image;
  detailImage.alt = `${selectedOption.title} illustration`;

  currentRating = 0;
  updateStars();
  formError.textContent = "";
  form.reset();
  renderRatingSummary();
  renderReviews();

  home.hidden = true;
  panel.hidden = false;
  backBtn.focus();
}

function closeOption() {
  selectedOption = null;
  panel.hidden = true;
  home.hidden = false;

  if (lastOpenedButton instanceof HTMLElement) {
    lastOpenedButton.focus();
  }
}

function createStarButtons() {
  for (let value = 1; value <= 5; value += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "star-button";
    button.dataset.value = String(value);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", "false");
    button.setAttribute("aria-label", `${value} star${value === 1 ? "" : "s"}`);
    button.textContent = "\u2605";
    button.addEventListener("click", () => {
      setRating(value);
    });
    button.addEventListener("keydown", handleStarKeydown);
    starsBox.appendChild(button);
  }
}

function handleStarKeydown(event) {
  const currentValue = Number(event.currentTarget.dataset.value);

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    setRating(Math.min(5, currentValue + 1));
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    setRating(Math.max(1, currentValue - 1));
  }
}

function setRating(value) {
  currentRating = value;
  formError.textContent = "";
  updateStars();
  const selectedStar = starsBox.querySelector(`[data-value="${value}"]`);

  if (selectedStar instanceof HTMLElement) {
    selectedStar.focus();
  }
}

function updateStars() {
  const starButtons = starsBox.querySelectorAll(".star-button");

  starButtons.forEach((button, index) => {
    const selected = index < currentRating;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-checked", String(Number(button.dataset.value) === currentRating));
  });
}

function renderRatingSummary() {
  if (!selectedOption) {
    ratingSummary.textContent = "";
    reviewsMeta.textContent = "0 reviews so far";
    return;
  }

  const count = selectedOption.reviews.length;

  if (count === 0) {
    ratingSummary.textContent = "No ratings yet. Be the first student to review this idea.";
    reviewsMeta.textContent = "0 reviews so far";
    return;
  }

  const total = selectedOption.reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = (total / count).toFixed(1);
  ratingSummary.textContent = `Average rating: ${average}/5 from ${count} review${count === 1 ? "" : "s"}.`;
  reviewsMeta.textContent = `${count} review${count === 1 ? "" : "s"} so far`;
}

function renderReviews() {
  reviewsBox.innerHTML = "";

  if (!selectedOption || selectedOption.reviews.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No reviews yet. Add the first one.";
    reviewsBox.appendChild(emptyState);
    return;
  }

  selectedOption.reviews
    .slice()
    .reverse()
    .forEach((review) => {
      const item = document.createElement("article");
      item.className = "review-item";

      const header = document.createElement("div");
      header.className = "review-item-header";

      const name = document.createElement("span");
      name.className = "review-name";
      name.textContent = review.name;
      header.appendChild(name);

      const rating = document.createElement("span");
      rating.className = "review-rating";
      rating.textContent = `${review.rating}/5`;
      header.appendChild(rating);

      const text = document.createElement("p");
      text.className = "review-text";
      text.textContent = review.text;

      item.appendChild(header);
      item.appendChild(text);
      reviewsBox.appendChild(item);
    });
}

async function loadReviewsFromDatabase() {
  if (!supabaseClient) {
    setServerStatus("Add your Supabase URL and anon key in config.js to enable shared reviews.", true);
    return;
  }

  setServerStatus("Loading shared reviews...");

  const { data, error } = await supabaseClient
    .from("reviews")
    .select("feature_id, reviewer_name, review_text, rating, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    setServerStatus("Could not load shared reviews. Check your Supabase table and policies.", true);
    return;
  }

  dormOptions.forEach((option) => {
    option.reviews = data
      .filter((review) => review.feature_id === option.id)
      .map((review) => ({
        name: review.reviewer_name,
        text: review.review_text,
        rating: review.rating,
        createdAt: review.created_at
      }));
  });

  renderCards();
  renderRatingSummary();
  renderReviews();
  setServerStatus("Shared reviews are live from Supabase.");
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!selectedOption) {
    return;
  }

  const name = nameInput.value.trim();
  const text = reviewInput.value.trim();

  if (!name || !text) {
    formError.textContent = "Please enter your name and a review before submitting.";
    return;
  }

  if (currentRating < 1 || currentRating > 5) {
    formError.textContent = "Please choose a star rating before submitting.";
    return;
  }

  if (!supabaseClient) {
    formError.textContent = "Supabase is not configured yet.";
    return;
  }

  formError.textContent = "";
  setServerStatus("Saving review...");

  const payload = {
    feature_id: selectedOption.id,
    reviewer_name: name.slice(0, 60),
    review_text: text.slice(0, 500),
    rating: currentRating
  };

  const { error } = await supabaseClient.from("reviews").insert(payload);

  if (error) {
    console.error(error);
    formError.textContent = "Could not save the review.";
    setServerStatus("The review could not be saved. Check your Supabase setup.", true);
    return;
  }

  await loadReviewsFromDatabase();
  form.reset();
  currentRating = 0;
  updateStars();
  nameInput.focus();
}

function setServerStatus(message, isError = false) {
  serverStatus.textContent = message;
  serverStatus.classList.toggle("error", isError);
}

function renderOverviewStats() {
  const totalFeatures = dormOptions.length;
  const allReviews = dormOptions.flatMap((option) => option.reviews);
  const reviewCount = allReviews.length;
  const average =
    reviewCount === 0
      ? "0.0/5"
      : `${(allReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)}/5`;

  featureCount.textContent = String(totalFeatures);
  totalReviewCount.textContent = String(reviewCount);
  overallAverage.textContent = average;
}

backBtn.addEventListener("click", closeOption);
form.addEventListener("submit", handleSubmit);

createStarButtons();
renderCards();
loadReviewsFromDatabase();
