# Verification results

Verified on 2026-11-20 with local macOS Google Chrome, React 19 and Vite 7.

- `npm run build`: TypeScript and production build passed.
- `npm test`: 5 unit tests passed, including full-resolution stroke generation, contour alignment, seeded repeatability and stalled-frame catch-up.
- Playwright: 3 browser checks passed (desktop playback/persistence/exact replay, mobile DPR 3 layout/touch/bitmap content, and uninterrupted timing). The first two were run together; the timing check was run separately after the final completion-time accounting change.
- 280,427 actual textured pigment strokes across four progressively finer passes.
- Scheduled duration: 8,566 ms. Uninterrupted observed completion, including the final draw work: **8,625.9 ms**. Median playback frame interval 16.7 ms, 95th percentile 33.3 ms, maximum 233.4 ms. These are local headless-browser measurements, not a guarantee for every device. Occasional slower frames remain.
- Desktop screenshots captured at requested 0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8 and 8.566 second thresholds; capture overhead and first observation latency mean actual captures can be later. The development `verification/timing.json` preserves observed timestamps. The first nominal zero-time capture is not an exact t=0 sample.
- No browser exceptions were observed in the desktop playback/replay test. The mobile bitmap-content assertion also passed.
- Desktop 1280 × 1000 and mobile 390 × 844 screenshots visually inspected; no horizontal overflow or subject cropping. Device pixel ratio 3 rendering is capped at 2 internally.
- Pixel-for-pixel equality of the finished bitmap across replay passed. The final canvas stays unchanged while idle.
- Final rendered image compared with the isolated 630 × 900 MP4 artwork: SSIM **0.8960**, mean absolute channel error **3.166 / 255**, RMSE **5.148 / 255**. This comparison measures similarity to the derived crop, not to an unavailable original photograph. It is not a claim of pixel-perfect fidelity.

The largest visual limitation is source resolution and photographed-screen softness. The output remains slightly softer than the reference, and exact original stroke paths/order are not reproduced. The small upper-right text cleanup is reconstructed foliage. Timing broadly follows the observed coarse-to-fine development but expands the painting segment to the requested standalone 8.566-second schedule.

Screenshots, intermediate frames and machine-generated QA reports are intentionally excluded from Git. Local final screenshot: `verification/painting-8566.png`; layout captures: `verification/desktop.png` and `verification/mobile.png`; progression sheet: `verification/progression.jpg`. These can be regenerated with the Playwright suite. Source video is not included.

## Anniversary landing page

Added the supplied Snoopy illustration, a fourth-anniversary note, and a flower button. Both views use a soft pink surrounding background. `/#flowers` preserves direct access to the procedural painting. Browser history and focus restoration are supported.

The new desktop (1280 × 1000) and phone (390 × 844) landing screenshots were visually inspected, together with the pink flower view. Snoopy loads from a local asset. Landing-page checks verified no horizontal overflow, image decoding, flower-button navigation and focus restoration on browser Back. Build and five unit tests passed. All four browser checks passed across the initial run and targeted reruns. The latest uninterrupted painting completed in 8,766 ms; the schedule remains 8,566 ms. An earlier local run exceeded the original 8,800 ms timing tolerance; screenshot-overhead timing is now assessed separately from the dedicated uninterrupted check.

Local screenshots: `verification/anniversary-1280.png`, `verification/anniversary-390.png`, and `verification/mobile.png` (flower view).

## Thanksgiving theme

Replaced the pink palette with orange gingham, cream paper, cocoa text and a terracotta action. Added an HTML/CSS pumpkin cluster next to the unchanged Snoopy JPEG and updated the note for Thanksgiving. The painting's surround is apricot; the stroke engine is unchanged. No image-generation tools were used.

Production build and five unit tests passed. Targeted Playwright checks passed for mobile painting layout/touch replay and anniversary navigation on desktop/mobile. Both new landing screenshots were visually inspected. Primary text/button color-pair contrast calculations exceed 4.5:1; research and exact ratios appear in `design-notes.md`.

## Flower startup improvement

Moved Gaussian/gradient analysis and stroke generation into a Vite-bundled module worker. Preparation starts after the anniversary note mounts, is shared across navigation, and retries after errors. Brush atlas creation yields in short message-task batches and completes before playback, preserving the existing texture/stroke sequence. A short preparation status covers direct visits or clicks before the cache is ready.

Build and five unit tests passed. All five browser checks passed across the full run and targeted reruns. After background preparation completed, actual click-event-to-first-drawn-stroke checks measured 60.6 ms on the first visit and 47.8 ms on a return visit. These exclude the initial background preparation period and are local measurements rather than device guarantees. The latest uninterrupted playback completed in 8,760.3 ms against the unchanged 8,566 ms schedule; median frame interval was 16.7 ms and p95 was 33.3 ms, with an occasional longer frame. The existing narrow wall-clock check exceeded its tolerance on an earlier run and passed on rerun. Desktop replay equality, mobile touch/layout and browser navigation checks passed.

## Notes-first opening and lossless phone optimization

Fresh visits/reloads now show the note, including saved `#flowers` URLs. In-session flower-button navigation and browser history remain supported. The main branch's configured remote is `origin` (`victorhuii/4th-anniversary`); no push was performed.

The worker now transfers Float64 geometry/timing buffers, exact RGB palette indices and texture indices. Full double precision is retained. Canvas drawing uses precomputed trigonometry and indexed brush sprites instead of rebuilding string keys, looking up pigment colors and calculating angles for each mark. This removes the large cloned stroke-object collection from the UI thread; no strokes, texture variants, source detail or rendering resolution were removed.

A baseline and optimized render were captured at a 390 × 844 phone viewport, device pixel ratio 3 with the existing internal cap of 2. Both canvases are **1260 × 1800**, contain **280,427** strokes, and their decoded RGBA pixels are **exactly identical** (maximum channel difference 0). Local artifacts: `verification/phone-before.png`, `verification/phone-after.png`, and `verification/phone-quality.json`.

In Chrome phone emulation, the measured p95 frame interval improved from **33.4 ms to 16.8 ms**; the median remained 16.7 ms. Observed completion was 8,708.9 ms before and 8,676.1 ms after, against the same 8,566 ms schedule. The longest individual frame was 166.7 ms before and 250 ms after, so occasional stalls still occur. These are local emulation measurements, not a physical iPhone/Android benchmark or an every-frame performance guarantee.

Production build and six unit tests passed, including exact full-precision buffer packing. Browser checks verified the phone render, fresh/reloaded flower links returning to the note, and the unchanged stroke count and canvas dimensions. The existing replay/navigation suite also checks the revised note-first flow.

## Website deployment preparation

Added a GitHub Pages deployment workflow that installs the locked dependencies, runs unit tests, builds for `/4th-anniversary/`, and deploys the static `dist/` output. Image URLs respect Vite's deployment base, including the bouquet source used by the worker pipeline. Root-domain builds remain supported separately.

The Pages production build and six unit tests passed. A production-preview Playwright check passed at the repository subdirectory, verifying default note routing, Snoopy loading, the compiled module worker path and the completed 280,427-stroke painting with no browser exceptions or failed asset requests.
