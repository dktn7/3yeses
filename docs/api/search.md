# Talent Search API

POST /api/search

Description: Search for categories, subcategories, and talent profiles using text queries and filters. Supports pagination, sorting, and filters for skills and location.

Request body (JSON):

- query: string (required) — Text search across name, bio, roleDescription, and user name.
- filters: object (optional) — Filtering options. Supported keys:
  - skills: array of strings — Match talents who have any of these skills (OR semantics).
  - location: string — Partial, case-insensitive match against talent `location`.
  - gender: array of strings — Filter by gender values.
  - ageRange: { min: number, max: number }
- page: number (optional) — 1-based page number (default: 1).
- limit: number (optional) — Number of results per page (default: 20, max: 100).
- sortBy: string (optional) — One of `relevance` (default), `rating`, `experience`.

Example request:

```json
{
  "query": "improv comedy",
  "filters": {
    "skills": ["Improv", "Sketch"],
    "location": "Los Angeles",
    "gender": ["female"]
  },
  "page": 1,
  "limit": 20,
  "sortBy": "rating"
}
```

Response (200 OK):

- success: boolean
- categories: array — matching categories (id, name, description)
- subcategories: array — matching subcategories (id, name, categoryId)
- talents: array — paginated talent objects (id, userId, roleDescription, bio, location, experience, rating, avatarUrl, videoUrl, skills)
- pagination: { page, limit, total }
- cached: boolean — whether the response was returned from server cache

Example response:

```json
{
  "success": true,
  "categories": [{ "id": "actors", "name": "Actors" }],
  "subcategories": [{ "id": "female-actor", "name": "Female Actor", "categoryId": "actors" }],
  "talents": [
    { "id": "1", "userId": "u1", "roleDescription": "Lead Actress", "bio": "...", "location": "Los Angeles", "experience": 8, "rating": 4.9, "skills": ["Method Acting"] }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1 },
  "cached": false
}
```

Notes and recommendations:

- Indexing: The API expects `create_indexes.sql` to be applied for good performance (GIN index on `skills`, trigram on `lower(location)`, and full-text on concatenated fields).
- For production, replace the in-memory cache with Redis or Memcached if running multiple server instances.
- Use `EXPLAIN ANALYZE` on your real DB to confirm the planner is using these indexes for heavy queries.
- Consider adding a dedicated search engine if you have very large datasets or advanced ranking needs (ElasticSearch, MeiliSearch, or Typesense).
