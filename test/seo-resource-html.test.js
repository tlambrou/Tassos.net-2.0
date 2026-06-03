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
  !/<script src="assets\/js\/typed(\.min)?\.js"/.test(html),
  "The page should not load Typed.js when no Typed instance is used"
);

assert(
  !/<script src="assets\/js\/presentation-page\/main\.js"><\/script>/.test(html),
  "The isometric grid bundle should not be loaded on the initial mobile path"
);

assert(
  /loadScriptOnce\('assets\/js\/presentation-page\/main\.js'/.test(html),
  "The isometric grid bundle should be loaded conditionally for large screens"
);

assert(
  !/<script src="https:\/\/unpkg\.com\/scrollreveal\/dist\/scrollreveal\.min\.js"><\/script>/.test(html),
  "ScrollReveal should not be loaded unconditionally"
);

assert(
  !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html),
  "Homepage should not request external web fonts on the critical path"
);

for (const href of [
  "https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css",
  "assets/css/nucleo-icons.css",
]) {
  const deferredCssPattern = new RegExp(
    `<link href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" rel="stylesheet" media="print" onload="this.media='all'"`
  );

  assert(
    deferredCssPattern.test(html),
    `${href} should be deferred so font/icon CSS does not block first paint`
  );
}
