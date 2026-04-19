# Dorm Upgrade Ideas

A static dorm feature review site designed for:

- GitHub Pages hosting
- Supabase shared storage
- Browser-only frontend deployment

## Free hosting architecture

GitHub Pages hosts the HTML, CSS, and JavaScript.
Supabase stores reviews in a hosted Postgres database.

This avoids the need for a paid Node server.

## Supabase setup

1. Create a free project at [Supabase](https://supabase.com/).
2. Open the SQL editor.
3. Run the contents of `supabase-schema.sql`.
4. In your Supabase project settings, copy:
   - Project URL
   - Anon/public key
5. Paste them into `config.js`.

## GitHub Pages setup

1. Push this repository to GitHub.
2. In the repository, open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Save.

Your site should publish at:

`https://20SHA07.github.io/dorm-upgrade-ideas/`

## Important notes

- `config.js` must contain your real Supabase values before shared reviews will work.
- The Supabase anon key is meant for client-side use, but your Row Level Security policies must stay enabled.
- GitHub Pages is static-only, so this project now runs as a frontend-only site backed by Supabase.
