const assert = require("assert");
const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "..", "app.js");
const indexPath = path.join(__dirname, "..", "public", "index.html");
const vercelConfigPath = path.join(__dirname, "..", "vercel.json");

const appSource = fs.readFileSync(appPath, "utf8");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const stylesSource = fs.readFileSync(
  path.join(__dirname, "..", "public", "assets", "css", "styles.css"),
  "utf8"
);
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"));

assert(
  /const publicRoot = path\.join\(__dirname, ['"]public['"]\);/.test(appSource) &&
    /express\.static\(publicRoot\)/.test(appSource),
  "Express should serve the public directory"
);

assert(
  /process\.env\.PORT\s*\|\|\s*3000/.test(appSource),
  "App should use process.env.PORT with a local fallback"
);

assert(
  /<html\s+lang="en"/.test(indexHtml),
  "Homepage should declare its language"
);

assert(
  /<title>Tassos Lambrou \| Full Stack Web Developer<\/title>/.test(indexHtml),
  "Homepage should include the expected title"
);

assert(
  /<div id="bio"/.test(indexHtml),
  "Homepage should include the profile section"
);

assert(
  /<h2 id="subtitle" style="height: 3em;" class="presentation-subtitle text-center">/.test(indexHtml),
  "Hero subtitle should be visible before JavaScript runs"
);

assert(
  /#lineDrawing\s*{\s*display:\s*block;/.test(stylesSource),
  "Hero logo space should be present before JavaScript runs"
);

assert(
  /#lineDrawing svg\s*{[\s\S]*aspect-ratio:\s*350 \/ 139;/.test(stylesSource),
  "Hero logo should reserve a stable aspect-ratio box"
);

assert(
  /\.presentation-page \.title-brand\s*{[\s\S]*max-width:\s*730px;/.test(stylesSource),
  "Critical hero title layout should not wait for deferred CSS"
);

assert(
  /<img class="components-macbook" src="assets\/img\/mockups\/parkr-3screens-mockup\.jpg" width="747" height="560"/.test(indexHtml),
  "PARKR mockup should reserve layout space before loading"
);

assert(
  /function hydrateHeroVideo\(\)/.test(fs.readFileSync(path.join(__dirname, "..", "public", "assets", "js", "scripts.js"), "utf8")),
  "Homepage scripts should hydrate the hero video lazily"
);

assert(
  /window\.loadScriptOnce/.test(fs.readFileSync(path.join(__dirname, "..", "public", "assets", "js", "scripts.js"), "utf8")),
  "Optional interaction bundles should be loaded on demand"
);

assert(
  /loadScriptOnce\('assets\/js\/anime\.min\.js'/.test(fs.readFileSync(path.join(__dirname, "..", "public", "assets", "js", "scripts.js"), "utf8")),
  "Logo animation code should load Anime.js only when animation can run"
);

assert.deepStrictEqual(
  vercelConfig.builds,
  [{ src: "public/**", use: "@vercel/static" }],
  "Vercel should deploy the static public directory"
);

assert.deepStrictEqual(
  vercelConfig.routes,
  [{ src: "/(.*)", dest: "/public/$1" }],
  "Vercel should route requests to static public files"
);
