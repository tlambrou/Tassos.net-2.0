const assert = require("assert");
const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "..", "public", "assets", "css", "styles.css");
const css = fs.readFileSync(cssPath, "utf8");

const reducedMotionMatch = css.match(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]+)\}\s*$/);

assert(
  reducedMotionMatch,
  "styles.css should define a prefers-reduced-motion: reduce media query"
);

const reducedMotionCss = reducedMotionMatch[1];

assert(
  /animation-duration\s*:\s*0\.001s\s*!important/.test(reducedMotionCss),
  "reduced-motion CSS should shorten animation duration"
);

assert(
  /animation-iteration-count\s*:\s*1\s*!important/.test(reducedMotionCss),
  "reduced-motion CSS should prevent repeating animations"
);

assert(
  /transition-duration\s*:\s*0\.001s\s*!important/.test(reducedMotionCss),
  "reduced-motion CSS should shorten transition duration"
);

assert(
  /scroll-behavior\s*:\s*auto\s*!important/.test(reducedMotionCss),
  "reduced-motion CSS should disable smooth scrolling"
);
