# Afterlife Theory Labs

A cinematic React / React Three Fiber / Three.js / GSAP landing page.

## Run

From this directory, run `npm install` and `npm run dev`. Use `npm run build` for a production build and `npx tsc --noEmit` to check types.

## Composition

`components/scene/` separates Earth, atmosphere, satellite, foreground, and camera orchestration. High-resolution day, cloud, and night maps from Solar System Scope (CC BY 4.0) drive the rotating Earth; a restrained shader lift gives the land a greener cast. The supplied satellite GLB follows an inclined elliptical orbit. The supplied foreground planet GLB provides the terrain and rocks. Its surface winding and central depression are corrected in cloned geometry, then layered with Poly Haven Moon 01 PBR maps (CC0) and a subtle procedural regolith albedo. A rear-view photographic plate keeps the small seated figure natural at the hero scale. The original boy GLB remains available in `public/assets` for a future fully animated character. The layout follows the reference image attached to the brief; there was no separate sketch file in the workspace.

The satellite follows an independent inclined elliptical orbit. Earth and clouds rotate independently. GSAP ScrollTrigger eases the camera toward Earth, and cursor movement adds subtle parallax. The pause control stops ambient motion; reduced-motion preferences also disable the camera journey and reveal movement. Hidden tabs suspend continuous rendering. Mobile uses 1K textures, fewer terrain vertices, lower pixel ratio, and no cursor parallax. PerformanceMonitor lowers pixel ratio on slower devices.

Textures are WebP compressed with desktop and mobile variants. Original maps remain in the parent assets directory. Regenerate compressed assets with `node scripts/prepare-assets.mjs` (requires sharp); regenerate the procedural lunar albedo with `python3 ../assets/moon_material/generate-albedo.py` first.

Work and About open keyboard-accessible dialogs. Work links to the scene experiment. Contact opens `mailto:allono.at@gmail.com`, as supplied. Replace the short Work and About copy in `app/page.tsx` with verified lab information as needed.
