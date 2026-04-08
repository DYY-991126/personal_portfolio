# Project 2 Provider Setup

## Current Provider Plan

- `OPENROUTER_API_KEY`
  - Used for Project 2 chat and the later website-design generation stage
  - Current usage:
    - `/api/project-2-chat`
  - Planned usage:
    - `website_design`

- `FIRECRAWL_API_KEY`
  - Used for server-side link reading and content extraction
  - Current usage:
    - `firecrawl` tool hydration in `/api/project-2-chat`

- `SERPAPI_KEY`
  - Used for Google Maps business profile retrieval
  - Current usage:
    - `maps` scenario research inside `/api/project-2-chat`

- `RUNWARE_API_KEY`
  - Planned provider for `image_generation`
  - Planned provider for `video_generation`
  - Planned usage:
    - hero visuals
    - section visuals
    - supporting website imagery

## Why This Split

- `OpenRouter` handles language reasoning and generation planning
- `Firecrawl` handles link reading and content extraction
- `SerpAPI` handles Google Maps business facts
- `Runware` handles image and video generation

## Current State

- `OpenRouter` is already wired into Project 2 chat
- `Firecrawl` is now wired into the server-side `firecrawl` tool path
- `SerpAPI` is now wired into the `maps` scenario path
- `image_generation` and `video_generation` already have skill files and generation entry points
- Real image/video provider calls are not wired yet

## Next Integration Order

1. Confirm `FIRECRAWL_API_KEY`
2. Wire `website_design` generation through `OpenRouter`
3. Wire `image_generation` through Runware
4. Wire `video_generation` through Runware
