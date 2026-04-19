const dormFeatures = {
  1: "Pool & Jacuzzi",
  2: "Skating Park",
  3: "Food Trucks",
  4: "Underground Mall",
  5: "Parking Lot Building",
  6: "Theatre with Bean Bags",
  7: "Music & Karaoke",
  8: "Golf Carts"
};

const appConfig = window.APP_CONFIG || {};
const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("adminLoginForm");
const usernameInput = document.getElementById("adminUsername");
const passwordInput = document.getElementById("adminPassword");
const loginError = document.getElementById("adminLoginError");
const adminStatus = document.getElementById("adminStatus");
const adminSummary = document.getElementById("adminSummary");
const adminReviewList = document.getElementById("adminReviewList");
const refreshAdminBtn = document.getElementById("refreshAdminBtn");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");

const hasSupabaseConfig =
  typeof appConfig.supabaseUrl === "string" &&
  appConfig.supabaseUrl.includes("supabase.co") &&
  typeof appConfig.supabaseAnonKey === "string" &&
  typeof appConfig.adminUsername === "string" &&
  typeof appConfig.adminEmail === "string";

const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
  : null;

initializeAdminPage();

async function initializeAdminPage() {
  if (!supabaseClient) {
    setAdminStatus("Add your Supabase and admin settings in config.js before using moderation.", true);
    return;
  }

  loginForm.addEventListener("submit", handleAdminLogin);
  refreshAdminBtn.addEventListener("click", loadAdminReviews);
  logoutAdminBtn.addEventListener("click", handleAdminLogout);

  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    showAdminPanel();
    await loadAdminReviews();
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginError.textContent = "Enter both username and password.";
    return;
  }

  if (username !== appConfig.adminUsername) {
    loginError.textContent = "That username is not allowed for admin access.";
    return;
  }

  loginError.textContent = "";
  setAdminStatus("Signing in...");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: appConfig.adminEmail,
    password
  });

  if (error) {
    console.error(error);
    loginError.textContent = "Could not sign in. Check the username and password.";
    setAdminStatus("Sign in failed.", true);
    return;
  }

  loginForm.reset();
  showAdminPanel();
  await loadAdminReviews();
}

async function handleAdminLogout() {
  await supabaseClient.auth.signOut();
  adminPanel.hidden = true;
  loginSection.hidden = false;
  adminReviewList.innerHTML = "";
  adminSummary.textContent = "";
  setAdminStatus("Logged out.");
  usernameInput.focus();
}

async function loadAdminReviews() {
  setAdminStatus("Loading all reviews...");

  const { data, error } = await supabaseClient
    .from("reviews")
    .select("id, feature_id, reviewer_name, review_text, rating, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    setAdminStatus("Could not load reviews. Check your admin SQL policy and account.", true);
    return;
  }

  renderAdminSummary(data);
  renderAdminReviews(data);
  setAdminStatus("Moderation dashboard is up to date.");
}

function renderAdminSummary(reviews) {
  const count = reviews.length;

  if (count === 0) {
    adminSummary.textContent = "There are no reviews to moderate yet.";
    return;
  }

  const average = (reviews.reduce((sum, review) => sum + review.rating, 0) / count).toFixed(1);
  adminSummary.textContent = `${count} total review${count === 1 ? "" : "s"} across all features. Current average rating: ${average}/5.`;
}

function renderAdminReviews(reviews) {
  adminReviewList.innerHTML = "";

  if (reviews.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Nothing to moderate right now.";
    adminReviewList.appendChild(emptyState);
    return;
  }

  reviews.forEach((review) => {
    const item = document.createElement("article");
    item.className = "review-item admin-review-item";

    const meta = document.createElement("div");
    meta.className = "admin-review-meta";

    const feature = document.createElement("span");
    feature.className = "detail-tag";
    feature.textContent = dormFeatures[review.feature_id] || `Feature ${review.feature_id}`;
    meta.appendChild(feature);

    const timestamp = document.createElement("span");
    timestamp.className = "admin-review-date";
    timestamp.textContent = new Date(review.created_at).toLocaleString();
    meta.appendChild(timestamp);

    const header = document.createElement("div");
    header.className = "review-item-header";

    const name = document.createElement("span");
    name.className = "review-name";
    name.textContent = review.reviewer_name;
    header.appendChild(name);

    const rating = document.createElement("span");
    rating.className = "review-rating";
    rating.textContent = `${review.rating}/5`;
    header.appendChild(rating);

    const text = document.createElement("p");
    text.className = "review-text";
    text.textContent = review.review_text;

    const actions = document.createElement("div");
    actions.className = "admin-review-actions";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete review";
    deleteButton.addEventListener("click", async () => {
      deleteButton.disabled = true;
      await deleteReview(review.id);
    });
    actions.appendChild(deleteButton);

    item.appendChild(meta);
    item.appendChild(header);
    item.appendChild(text);
    item.appendChild(actions);
    adminReviewList.appendChild(item);
  });
}

async function deleteReview(reviewId) {
  setAdminStatus("Deleting review...");

  const { error } = await supabaseClient
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    console.error(error);
    setAdminStatus("Could not delete the review. Check your admin delete policy.", true);
    return;
  }

  await loadAdminReviews();
}

function showAdminPanel() {
  loginSection.hidden = true;
  adminPanel.hidden = false;
}

function setAdminStatus(message, isError = false) {
  adminStatus.textContent = message;
  adminStatus.classList.toggle("error", isError);
}
