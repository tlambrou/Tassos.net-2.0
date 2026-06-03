const assert = require("assert");
const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "public", "index.html");
const html = fs.readFileSync(indexPath, "utf8");

assert(
  /<meta\s+name="description"\s+content="[^"]{80,}"/.test(html),
  "Homepage should include a concise meta description"
);

assert(
  /<link\s+rel="canonical"\s+href="https:\/\/www\.tassos\.net\/"\s*\/?>/.test(html),
  "Homepage should declare the canonical HTTPS production URL"
);

assert(
  !/href=['"]http:\/\//.test(html),
  "Stylesheets and metadata should not reference insecure HTTP URLs"
);

assert(
  !/cdnjs\.cloudflare\.com\/ajax\/libs\/animate\.css/.test(html),
  "Duplicate CDN animate.css should not be loaded"
);

for (const href of [
  "assets/css/demo.css",
  "assets/css/animate.css",
  "assets/css/woah.css",
]) {
  const deferredCssPattern = new RegExp(
    `<link href="${href}" rel="stylesheet" media="print" onload="this.media='all'"`
  );

  assert(
    deferredCssPattern.test(html),
    `${href} should be deferred so it does not block first paint`
  );
}

assert(
  /<script src="assets\/js\/typed\.min\.js" type="text\/javascript"><\/script>/.test(html),
  "The page should load the minified Typed.js bundle"
);
