# Dorm Upgrade Ideas

A simple dorm feature review site with:

- Static frontend
- Node/Express backend
- Shared review storage in `data/reviews.json`

## Run locally

1. Install dependencies:

```powershell
npm install
```

2. Start the app:

```powershell
npm start
```

3. Open:

`http://localhost:3000`

## Deploy on Render from GitHub

This repo includes a `render.yaml` file so Render can read the service settings directly from GitHub.

Important:

- GitHub Pages cannot run this backend.
- Render's default filesystem is ephemeral.
- This setup uses a persistent disk mounted at `/opt/render/project/src/data` so reviews survive restarts and deploys.
- According to Render's docs, persistent disks require a paid Render web service plan.

### Steps

1. Create a new GitHub repository.
2. Push this project to that repository.
3. Go to [Render Dashboard](https://dashboard.render.com/).
4. Click `New` -> `Blueprint`.
5. Connect your GitHub account and choose this repository.
6. Render will detect `render.yaml`.
7. Create the service and wait for the first deploy.
8. Open the public Render URL and test submitting a review.

## Notes

- Reviews are shared for everyone who uses the deployed site.
- Reviews are stored in the server data file, not in each visitor's browser.
- If you want a stronger long-term setup later, the next upgrade would be moving from JSON storage to PostgreSQL.
