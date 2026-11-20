# Thanksgiving design notes

## Research and applied decisions

- [Nielsen Norman Group: Why Does a Design Look Good?](https://www.nngroup.com/articles/why-does-design-look-good/) examines Medium, Ritual and NPR. Its grid/typography examples informed a consistent left text edge, a comfortable reading column, two font families, and repeated spacing. The seasonal styling keeps the same personal note and single main action rather than adding unrelated sections.
- [Nielsen Norman Group: 5 Principles of Visual Design](https://www.nngroup.com/articles/principles-visual-design/) explains scale, hierarchy, balance, contrast and grouping. Here the anniversary heading is the main text focal point; Snoopy balances it on desktop. The pumpkins form one supporting cluster at his feet. Mobile stacks illustration, heading, note and button in reading order.
- [W3C: Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) specifies 4.5:1 for normal text. The implementation uses cocoa ink on cream, with a darker burnt-orange button rather than light orange text. Calculated contrast ratios: body 10.88:1; secondary text 5.80:1; button 5.80:1; handwritten-style sign-off 5.93:1; flower-page links 5.61:1. These are color-pair checks, not a full accessibility audit.

## Visual direction

A cozy Thanksgiving table and handwritten anniversary letter: warm orange gingham outside, cream stationery inside, cocoa text, terracotta emphasis, and small sage/golden pumpkin accents. Gingham appears only around the letter so it does not compete with the note. The painting view uses a plain warm apricot surround.

The supplied Snoopy JPEG is reused unchanged. Pumpkins consist only of HTML spans and CSS borders, solid fills and curved lobes; the existing small heart and flower icons remain code-native SVG. No image generation service, new illustration file, image search or external font dependency is used. All decorations are hidden from assistive technology. Focus styles, browser history, reduced-motion handling and the original stroke renderer remain available.
