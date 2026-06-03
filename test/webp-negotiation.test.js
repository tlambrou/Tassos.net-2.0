const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const expectedWebpAssets = [
  "assets/img/nightmountains.webp",
  "assets/img/faces/billandi.webp",
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
}

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
