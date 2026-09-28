# Afterlife Theory Labs

A cinematic React / React Three Fiber / Three.js / GSAP landing page.

## Run

From this directory, run `npm install` and `npm run dev`. Use `npm run build` for a production build and `npx tsc --noEmit` to check types.

## Composition

`components/scene/` separates Earth, atmosphere, satellite, foreground, and camera orchestration. The supplied Earth maps drive a procedural PBR sphere; the supplied boy and satellite are GLTF models loaded with Suspense. The boy model is Z-up and faces +Y, so a -90° X rotation makes him upright and facing Earth, away from the camera. The foreground is procedural curved terrain because no foreground model was provided. No reference sketch was available in the workspace; the written brief determines the composition.

The satellite follows an independent inclined elliptical orbit. Earth and clouds rotate independently. GSAP ScrollTrigger eases the camera toward Earth, and cursor movement adds subtle parallax. The pause control stops ambient motion; reduced-motion preferences also disable the camera journey and reveal movement. Hidden tabs suspend continuous rendering. Mobile uses 1K textures, fewer terrain vertices, lower pixel ratio, and no cursor parallax. PerformanceMonitor lowers pixel ratio on slower devices.

Textures are WebP compressed with desktop and mobile variants. The originals remain in the parent assets directory. Regenerate with `node scripts/prepare-assets.mjs` (requires sharp).

Work and About open keyboard-accessible dialogs. Work links to the scene experiment. Contact opens `mailto:allono.at@gmail.com`, as supplied. Replace the short Work and About copy in `app/page.tsx` with verified lab information as needed.
