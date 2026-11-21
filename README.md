# Pastel Bouquet

A little four-month anniversary website: Snoopy holding flowers, CSS pumpkins, a Thanksgiving love note, and a button that opens a pastel bouquet painting on a warm apricot background. The painting builds stroke by stroke in **8.566 seconds** and stays on screen. Click, tap, or focus the canvas and press Enter/Space to replay.

Fresh visits and reloads always open the note, even if the URL still contains `#flowers`. The flower button opens the painting within the current visit. The flower view links back to the note, and browser Back/Forward works between the two. The user-supplied Snoopy image is stored locally, with no external image or font requests.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To build and serve the production bundle:

```sh
npm run build
npm run preview
```

## Rendering

A perspective-corrected crop of the user-supplied reference video supplies local colors. Gaussian luminance and structure-tensor gradients orient deterministic marks along the image contours. Four progressively smaller brush passes establish color masses, forms, petals and fine texture. Procedural alpha masks create irregular pigment edges, grain gaps and dry scratches; colored sprites are reused. Approximately 280,000 strokes accumulate on the canvas. The source is sampled offscreen and is never drawn onto the visible canvas.

`requestAnimationFrame` advances a precomputed timestamped sequence against elapsed time. Delayed frames consume all pending marks, including every remaining mark at completion, rather than extending the animation. Playback stops requesting frames at completion. Device pixel ratio is capped at 2 to bound memory; the layout preserves the complete portrait on desktop and mobile. React updates only for readiness, completion and error state.

## Fast flower startup

The landing page starts preparing the painting in the background. Gaussian analysis and generation of the deterministic stroke sequence run in a module Web Worker. The worker transfers full-precision typed buffers and an exact color dictionary rather than cloning hundreds of thousands of stroke objects. Trigonometry and brush lookup are prepared ahead of playback; rendering uses indexed data while retaining every stroke, texture, color and the same canvas resolution. The page shares that preparation across navigation, so returning to the flowers does not repeat it. Brush textures warm in short, yielding batches before playback so cache creation does not cause animation stalls. A brief “Picking your flowers…” message covers an immediate click or direct visit before preparation completes. The artwork still paints through actual strokes on the same 8.566-second timeline.

## Verification

```sh
npm test
npm run test:e2e
```

The Playwright configuration uses installed macOS Google Chrome; change `executablePath` for another platform or install Playwright Chromium and omit that option. The end-to-end tests capture intermediate canvases, record real playback duration, compare replay pixel data, verify retained completion, check keyboard/touch activation and mobile bounds, and reject browser exceptions. A landing-page check also verifies the Snoopy image, desktop/mobile layouts, flower-button navigation and keyboard focus on return. Temporary screenshots and reports are ignored by Git. Unit tests cover orientation, convolution, seeded noise and delayed-frame catch-up.

See [reference-analysis.md](reference-analysis.md) for timestamp observations, source preparation, confirmed technique versus assumptions, and fidelity limits. The reference is the user-supplied MP4 associated with [@BUILDMERI's Instagram Reel](https://www.instagram.com/reel/DeiSxSLImXB/). The original video and editor interface are excluded. The committed image is a derived artwork reference; no claim is made to ownership of that artwork or to possession of the original photograph. This project does not grant rights to third-party reference art.

Measured build, browser, fidelity and timing results are recorded in [verification-results.md](verification-results.md).

The Thanksgiving palette, layout decisions, source research and contrast checks are documented in [design-notes.md](design-notes.md).

## Live website and deployment

Repository: https://github.com/victorhuii/4th-anniversary

GitHub Pages URL: https://victorhuii.github.io/4th-anniversary/

Pushes to `main` run the unit tests, build with Node 24, and publish `dist/` through `.github/workflows/deploy.yml`. GitHub Pages uses the GitHub Actions source. No runtime server, secrets or API keys are required by the website.

`npm run build:pages` builds specifically for the `/4th-anniversary/` repository path. `npm run build` remains suitable for a root-domain static host such as Vercel or Netlify. Both image assets and the module worker respect the Vite deployment base. To preview the Pages build locally, run `npm run build:pages` followed by `npm run preview -- --base=/4th-anniversary/` and open the printed URL with `/4th-anniversary/` appended.
