const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "reviews.json");
const INDEX_FILE = path.join(__dirname, "ENGL WEBSITE.html");

const featureIds = [1, 2, 3, 4, 5, 6, 7, 8];

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (request, response) => {
  response.sendFile(INDEX_FILE);
});

app.get("/api/reviews", async (request, response) => {
  const reviewData = await readReviewData();
  response.json(reviewData);
});

app.post("/api/features/:featureId/reviews", async (request, response) => {
  const featureId = Number(request.params.featureId);

  if (!featureIds.includes(featureId)) {
    response.status(404).json({ error: "Feature not found." });
    return;
  }

  const sanitizedReview = sanitizeReview(request.body);

  if (!sanitizedReview) {
    response.status(400).json({
      error: "Please provide a name, a review, and a rating from 1 to 5."
    });
    return;
  }

  const reviewData = await readReviewData();
  reviewData[String(featureId)].push(sanitizedReview);
  await writeReviewData(reviewData);

  response.status(201).json({
    message: "Review saved.",
    reviews: reviewData[String(featureId)]
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Dorm ideas site running at http://${HOST}:${PORT}`);
});

async function readReviewData() {
  await ensureDataFile();

  try {
    const fileContents = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(fileContents);
    return normalizeReviewStore(parsed);
  } catch (error) {
    console.warn("Falling back to an empty review store.", error);
    const emptyStore = buildEmptyReviewStore();
    await writeReviewData(emptyStore);
    return emptyStore;
  }
}

async function writeReviewData(reviewData) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalizeReviewStore(reviewData), null, 2)}\n`, "utf8");
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await writeReviewData(buildEmptyReviewStore());
  }
}

function buildEmptyReviewStore() {
  return featureIds.reduce((accumulator, id) => {
    accumulator[String(id)] = [];
    return accumulator;
  }, {});
}

function normalizeReviewStore(store) {
  const base = buildEmptyReviewStore();

  if (!store || typeof store !== "object") {
    return base;
  }

  featureIds.forEach((id) => {
    const reviews = store[String(id)];

    if (Array.isArray(reviews)) {
      base[String(id)] = reviews
        .map(sanitizeReview)
        .filter(Boolean);
    }
  });

  return base;
}

function sanitizeReview(review) {
  if (!review || typeof review !== "object") {
    return null;
  }

  const name = typeof review.name === "string" ? review.name.trim().slice(0, 60) : "";
  const text = typeof review.text === "string" ? review.text.trim().slice(0, 500) : "";
  const rating = Number(review.rating);

  if (!name || !text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return {
    name,
    text,
    rating,
    createdAt: typeof review.createdAt === "string" ? review.createdAt : new Date().toISOString()
  };
}
