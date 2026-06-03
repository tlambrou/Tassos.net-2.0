const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const indexPath = path.join(publicDir, "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const expectedWebpAssets = [
  "assets/img/nightmountains.webp",
  "assets/img/faces/billandi.webp",
  "assets/img/showcase/omnivox-title-desktop-card.webp",
  "assets/img/showcase/wthr-card.webp",
  "assets/img/showcase/littlebrother-measure-mobile-card.webp",
  "assets/img/showcase/mc-search-desktop-card.webp",
  "assets/img/showcase/parkr-timer-mobile-card.webp",
  "assets/img/showcase/trubric-assessment-desktop-card.webp",
  "assets/img/showcase/trubric-dashboard-mobile-card.webp",
  "assets/img/showcase/trubric-login-mobile-card.webp",
  "assets/img/showcase/bloctorials-title-mobile-card.webp",
  "assets/img/mockups/littlebrother-mockup.webp",
  "assets/img/mockups/mc-devices-mockup.webp",
  "assets/img/mockups/omnivox-mockup.webp",
  "assets/img/mockups/bloctorials-mockup.webp",
  "assets/img/mockups/trubric-mockup.webp",
  "assets/img/mockups/wthr-mockup.webp",
];

for (const asset of expectedWebpAssets) {
  assert(
    fs.existsSync(path.join(publicDir, asset)),
    `${asset} should exist as a modern image-format alternative`
  );

  assert(
    indexHtml.includes(asset),
    `${asset} should be referenced by static production markup`
  );
}

assert(
  /<link rel="preload" as="image" href="assets\/img\/nightmountains\.webp"[^>]+fetchpriority="high">/.test(indexHtml),
  "Hero WebP poster should be preloaded for first paint"
);

assert(
  /<video[^>]+id="video-source"[^>]+preload="none"[^>]+data-src="assets\/video\/nightmountains\.mp4"[^>]*>/.test(indexHtml) &&
    !/<video[^>]+id="video-source"[\s\S]*?<source src="assets\/video\/nightmountains\.mp4"/.test(indexHtml),
  "Hero video should not include an eager MP4 source in initial HTML"
);

const { app } = require("../app");

function requestWebpAsset(port) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/assets/img/nightmountains.jpg",
        agent: false,
        headers: {
          accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({ response, body: Buffer.concat(chunks) });
        });
      }
    );

    request.setTimeout(5000, () => {
      request.destroy(new Error("Timed out waiting for WebP response"));
    });
    request.on("error", reject);
    request.end();
  });
}

(async () => {
  const server = app.listen(0, "127.0.0.1");

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    const { response, body } = await requestWebpAsset(port);

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.headers["content-type"], "image/webp");
    assert.match(response.headers.vary || "", /accept/i);
    assert(body.length > 0, "Expected WebP response body");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})();
