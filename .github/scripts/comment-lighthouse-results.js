const fs = require("fs");

const [mobilePath, desktopPath] = process.argv.slice(2);

if (!mobilePath || !desktopPath) {
  throw new Error("Usage: node comment-lighthouse-results.js <mobile.json> <desktop.json>");
}

const requiredEnv = [
  "GITHUB_TOKEN",
  "GITHUB_REPOSITORY",
  "GITHUB_SHA",
  "PR_NUMBER",
  "PREVIEW_URL",
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function readReport(filePath) {
  const report = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const categories = Object.fromEntries(
    Object.entries(report.categories).map(([key, value]) => [
      key,
      Math.round(value.score * 100),
    ])
  );

  return {
    performance: categories.performance,
    accessibility: categories.accessibility,
    bestPractices: categories["best-practices"],
    seo: categories.seo,
    fcp: report.audits["first-contentful-paint"]?.displayValue || "n/a",
    lcp: report.audits["largest-contentful-paint"]?.displayValue || "n/a",
    speedIndex: report.audits["speed-index"]?.displayValue || "n/a",
    tbt: report.audits["total-blocking-time"]?.displayValue || "n/a",
    cls: report.audits["cumulative-layout-shift"]?.displayValue || "n/a",
    tti: report.audits.interactive?.displayValue || "n/a",
  };
}

function tableRow(mode, result) {
  return [
    mode,
    result.performance,
    result.accessibility,
    result.bestPractices,
    result.seo,
    result.fcp,
    result.lcp,
    result.speedIndex,
    result.tbt,
    result.cls,
    result.tti,
  ].join(" | ");
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} for ${path}: ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

async function main() {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const mobile = readReport(mobilePath);
  const desktop = readReport(desktopPath);
  const marker = "<!-- codex-lighthouse-preview-report -->";
  const body = `${marker}
## Preview Deployment Lighthouse

- Preview URL: ${process.env.PREVIEW_URL}
- Commit: ${process.env.GITHUB_SHA}
- Updated: ${new Date().toISOString()}
- Smoke test: passed before Lighthouse ran.

| Mode | Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS | TTI |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ${tableRow("Mobile", mobile)} |
| ${tableRow("Desktop", desktop)} |

These scores are regenerated for each PR commit by the \`PR Preview and Lighthouse\` workflow.`;

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${body.replace(`${marker}\n`, "")}\n`);
  }

  const comments = await githubRequest(
    `/repos/${owner}/${repo}/issues/${process.env.PR_NUMBER}/comments?per_page=100`
  );
  const existing = comments.find((comment) => comment.body.includes(marker));

  if (existing) {
    await githubRequest(`/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
  } else {
    await githubRequest(`/repos/${owner}/${repo}/issues/${process.env.PR_NUMBER}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }
}

main().catch((error) => {
  if (error.message.includes("Resource not accessible by integration")) {
    console.warn(`Unable to update PR comment; Lighthouse scores are available in the job summary.`);
    return;
  }

  console.error(error);
  process.exit(1);
});
