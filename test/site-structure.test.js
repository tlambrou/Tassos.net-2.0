const assert = require("assert");
const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "..", "app.js");
const indexPath = path.join(__dirname, "..", "public", "index.html");
const vercelConfigPath = path.join(__dirname, "..", "vercel.json");

const appSource = fs.readFileSync(appPath, "utf8");
const indexHtml = fs.readFileSync(indexPath, "utf8");
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
