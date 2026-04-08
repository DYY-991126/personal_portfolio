---
name: image_generation
description: Generate image-based visual assets or image directions needed by website_design, including reference visuals, enhanced assets, hero imagery, and supporting website visuals.
---

## Objective

Provide image-based visual outputs that support website generation.

## Use When

- Website design needs generated visual assets
- A hero or section needs supporting visual imagery
- Uploaded user images need enhancement before website use

## Expectations

- Keep the generated imagery aligned with the selected website style
- Prefer commercially usable outputs over decorative filler
- Treat uploaded user images as assets that may need enhancement instead of direct raw use
- Return image requirements or prompt directions that can be handed to a generation API
- When generating style reference visuals, use content structure as the primary basis whenever it exists
- If the content structure has multiple pages, use the first page as the default basis for style reference generation
- Treat the first page in the structure as the homepage or primary entry page by default
- If no content structure exists yet, switch to exploration mode and generate style references from the known business context, target audience, goals, and likely homepage content
- In exploration mode, treat style references as early visual direction rather than structure-locked final references

## Outputs

- Image generation prompts or directions
- Enhanced image plan
- Section-level visual asset plan
