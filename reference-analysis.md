# Reference analysis

Primary reference: user-supplied `3f4b11fd39724ec5a4bdde6b898ba030.MP4`, associated with https://www.instagram.com/reel/DeiSxSLImXB/ (creator overlay: @BUILDMERI). No claim is made that the original underlying photograph or Python source was obtained.

## Confirmed observations

The MP4 contains 378 frames at 30 fps: **12.600 seconds**, rather than the brief's estimated 8.566 seconds. The opening shows the editor; the painting window appears before 1 second. An Instagram end card begins between 8.5 and 9 seconds. The website uses the requested 8.566-second painting duration, excludes the editor and end card, and retains the finished result.

Frames were decoded at 0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 8.5 seconds, with additional frames at 9–12 seconds. The development contact sheets and extracted frames are kept outside Git. Descriptions below are visual estimates, not recovered original pass parameters or measured stroke counts. Widths refer to the perspective-corrected 630 × 900 canvas. Completion describes visual development rather than percentage of pixels painted.

| MP4 time | Painted regions, palette and layering | Estimated mark size / density / direction | Development |
| --- | --- | --- | --- |
| 0.0 | Editor only; painting unavailable | No artwork strokes visible | No visible painting |
| 0.5 | Editor only | No artwork strokes visible | No visible painting |
| 1.0 | A few isolated peach, cream, cyan and brown patches in the central bouquet and below; tiny blue lower-right mark on black | ~25–50 px; very sparse, oblique, uneven overlapping dabs | ~5%; first masses |
| 2.0 | Olive/yellow foliage surrounds peach, pink and cyan flowers; brown paper and blue sleeves blocked in; black gaps remain | ~20–45 px; scattered dense clusters; diagonal and contour-following | ~35%; recognizable overall composition |
| 3.0 | Full background coverage, brown flared paper, bright sleeves, pale dome of flowers; large jagged petal patches | ~12–30 px; coverage high; overlaps close remaining black gaps | ~55%; complete silhouette |
| 4.0 | Clear bouquet, dark lower wrapping, skin areas and individual pastel clusters; greens layered over ochre | ~8–20 px; high density, contour-following; fold shadows deepen | ~70%; flower clusters separate |
| 5.0 | Pink/coral/cream petals and cyan flowers become distinct; thin wrapping accents and twine begin to read | ~5–12 px; dense directional marks, finer strokes over broad masses | ~82%; petal and hand refinement |
| 6.0 | More petal edges, sleeve pigment, brown folds and foliage flicks | ~3–8 px; high density, short multidirectional marks | ~91%; major forms settled |
| 7.0 | Fine cream, lavender and yellow accents; bow and paper edges clearer | ~2–6 px; dense localized refinement | ~96%; finer texture |
| 8.0 | Mature textured artwork; very subtle additional detail | ~1–4 px; final dense pigment and highlight marks | ~99% |
| 8.5 | Final visible artwork before end card | Finest marks; no major composition changes | ~100% |

Color relationships: dark umber folded paper behind a dense pastel flower cluster; cyan/blue flowers primarily at lower left and bottom; warmer cream/yellow/peach flowers centrally and to the right; pink accents at the sides. Two skin-colored hands meet the wrapping below the flower mass. Cerulean sleeves enter from the lower corners. Twine descends over the dark narrow paper tail. Bright olive/ochre foliage surrounds the bouquet, with pale blue sky at the top.

The visible Python text confirms Pillow/NumPy-style image conversion, weighted luminance, Gaussian filtering, gradients and smoothed gradient products (`jxx`, `jxy`, `jyy`) followed by a half-angle expression. This supports a structure-tensor interpretation. The full original brush implementation, source image, seeds, layer constants and stroke schedule are not recoverable from the video.

## Source preparation

The 8.5-second frame was used because it precedes the end card. The photographed artwork's interior corners are approximately (159,330), (609,348), (568,1000), (123,950) in the 720 × 1280 video frame. A projective transform maps these to 630 × 900. This excludes the window title, black margins, monitor and editor. A small white text overlay in the upper-right foliage was removed with localized conventional inpainting. There was no global recoloring or sharpening. Original useful resolution is roughly 450 × 640; the transform cannot recover lost detail. Mild screen softness and video compression remain.

`scripts/extract-reference.py` documents the extraction. Its fixed homography is calibrated to the final frame, so early-frame comparisons have minor camera-motion misregistration. The committed source is a derived reference crop, not an original photograph. No original MP4 is committed. Attribution is not a claim of redistribution permission; confirm rights to the derived artwork before broader reuse.

## Implementation assumptions

The browser renders four spatially shuffled, jittered passes: widths 29, 15, 7.5 and 1.9 normalized pixels. Source colors are sampled locally with small pigment variations. Gaussian luminance and smoothed structure tensors determine contour tangents at multiple scales. Eight seeded irregular alpha masks supply torn boundaries, paper-tooth gaps and dragged scratches. Colored brush sprites are cached and stamped incrementally into the retained visible bitmap. No source photograph is composited onto that bitmap.

Pass boundaries are 0–2.350, 2.350–4.050, 4.050–6.050 and 6.050–8.566 seconds. The first pass accelerates from sparse marks. These are chosen to approximate the observed coarse-to-fine sequence while expanding the isolated painting to the user-requested duration. They are not claimed to be recovered original timings. The precise original stroke trajectories and sequence differ.

The source is already painterly, so fine marks deliberately preserve its shapes instead of applying another heavy stylization. The final remains a procedural resynthesis rather than pixel-identical playback. Final browser measurements and image-comparison results are recorded in `verification/` during QA.
