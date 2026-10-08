# Project media and categories

Edit `projects.ts` to add projects. Categories drive the available filters; service IDs decide which solution panels repeat the project. Empty service galleries render nothing. Media can contain desktop and mobile screenshots plus an optional MP4 recording. Recordings are previews, not embedded live websites.

The original user media stays in public/assets. Optimized WebP images and the browser-compatible Trashbuddy MP4 are in public/assets/projects. Trashbuddy's website poster is a frame from the supplied recording. Mayaloka has screenshots only at present.

Cards automatically play muted, looping recordings while visible. Mobile screenshots auto-advance and remain swipeable, with passive pagination indicators and no playback controls. The project dialog supports touch and keyboard. External website links open only on explicit activation.
