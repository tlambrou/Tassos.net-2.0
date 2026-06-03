const assert = require("assert");
const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "public", "index.html");
const stylesPath = path.join(__dirname, "..", "public", "assets", "css", "styles.css");

const html = fs.readFileSync(indexPath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");

assert(
  !/<h5\s+class="description"/.test(html),
  "Body copy should not use h5.description headings"
);

assert(
  !/<h[1-6]\b[^>]*>[^<]*(?:<small>[^<]*<\/small>)?<\/p>/.test(html),
  "Heading elements should not be closed with paragraph tags"
);

const iconOnlyLinks = [...html.matchAll(/<a\b(?=[^>]*\bbtn-just-icon\b)([^>]*)>/g)];

assert(iconOnlyLinks.length > 0, "Expected icon-only links to be present");

for (const [, attributes] of iconOnlyLinks) {
  assert(
    /\baria-label="[^"]+"/.test(attributes),
    `Icon-only link should have an aria-label: <a${attributes}>`
  );
}

assert(
  /\.card-description[\s\S]*color:\s*#5f5f5f/.test(styles),
  "Testimonial card descriptions should use a higher-contrast text color"
);

assert(
  /\.card-category[\s\S]*color:\s*#5f5f5f/.test(styles),
  "Testimonial card categories should use a higher-contrast text color"
);

assert(
  /\.btn-success[\s\S]*background-color:\s*#2f8f5b/.test(styles),
  "Success buttons should use an accessible contrast background"
);

assert(
  /\.btn-danger[\s\S]*background-color:\s*#c7351f/.test(styles),
  "Danger buttons should use an accessible contrast background"
);
