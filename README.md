# Gator

A TypeScript CLI RSS feed aggregator. Register users, follow feeds, scrape posts into Postgres on an interval, and browse the latest articles from the terminal.

Built as part of the [Boot.dev](https://www.boot.dev) Blog Aggregator project.

## Requirements

- **Node.js** 22+ (see `.nvmrc`)
- **PostgreSQL** running locally
- **npm**

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the config file

Create a "gatorfonfig.json" config file in your home directory.
Gator reads `~/.gatorconfig.json`.

the file must include the following:
```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
  "current_user_name": ""
}
```

Update `db_url` to match your database. `current_user_name` is set automatically when you `register` or `login`.

### 3. Create the database

```bash
createdb gator
```

(Or create a database named `gator` however you prefer.)

### 4. Run migrations

```bash
npm run generate   # only needed after schema changes
npm run migrate
```

If `migrate` does not apply cleanly, you can apply SQL files under `src/lib/db/` with `psql` and your connection string.

## Running the CLI

```bash
npm run start <command> [args...]
```

## Commands

| Command | Args | Description |
|---------|------|-------------|
| `register` | `<username>` | Create a user and set them as current |
| `login` | `<username>` | Switch the current user |
| `users` | — | List users (`(current)` marks who is logged in) |
| `reset` | — | Delete all users (cascades related data) |
| `addfeed` | `<name> <url>` | Add a feed and follow it *(logged in)* |
| `feeds` | — | List all feeds and who created them |
| `follow` | `<url>` | Follow an existing feed by URL *(logged in)* |
| `following` | — | List feeds you follow *(logged in)* |
| `unfollow` | `<url>` | Unfollow a feed *(logged in)* |
| `agg` | `<duration>` | Continuously scrape feeds (e.g. `10s`, `1m`, `1h`) |
| `browse` | `[limit]` | Show latest posts from followed feeds (default `2`) *(logged in)* |

Commands marked *(logged in)* require a valid current user in the config and database.

## Example workflow

```bash
# Create / select a user
npm run start register alice

# Add some RSS feeds (must be RSS XML endpoints, not HTML blog pages)
npm run start addfeed "Hacker News" https://hnrss.org/newest
npm run start addfeed "TechCrunch" https://techcrunch.com/feed/

# Scrape in the background (Ctrl+C to stop)
npm run start agg 10s

# In another terminal — browse saved posts
npm run start browse
npm run start browse 5

# Follow / unfollow
npm run start following
npm run start unfollow https://hnrss.org/newest
```

### Suggested feed URLs

Use real RSS/Atom endpoints, for example:

- Hacker News: `https://hnrss.org/newest` or `https://news.ycombinator.com/rss`
- TechCrunch: `https://techcrunch.com/feed/`
- Boot.dev blog: `https://blog.boot.dev/index.xml`

## Project structure

```
src/
  index.ts              # CLI entrypoint / command registry
  commandHandler.ts     # Handlers + logged-in middleware
  config.ts             # ~/.gatorconfig.json helpers
  feed.ts               # Fetch/parse RSS, scrape loop, duration parsing
  lib/db/
    schema.ts           # Drizzle schema
    queries/            # DB access helpers
    *.sql               # Migrations
```

## Notes

- Feed URLs must be unique; post URLs must be unique (re-scraping skips duplicates).
- Deleting users cascades to their feeds/follows; deleting feeds cascades to posts/follows.
- `agg` is long-running — leave it open in one terminal while you use other commands in another.
