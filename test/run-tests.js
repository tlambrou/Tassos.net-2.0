const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const testDir = __dirname;
const testFiles = fs
  .readdirSync(testDir)
  .filter((file) => file.endsWith(".test.js"))
  .sort();

if (testFiles.length === 0) {
  throw new Error("No test files found");
}

for (const file of testFiles) {
  const testPath = path.join(testDir, file);
  const result = spawnSync(process.execPath, [testPath], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status);
  }
}
