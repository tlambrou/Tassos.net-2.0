const requiredEnv = [
  "VERCEL_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "PR_HEAD_SHA",
  "PR_HEAD_REF",
  "PR_REPO_OWNER",
  "PR_REPO_NAME",
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isMatchingDeployment(deployment) {
  const meta = deployment.meta || {};

  return (
    meta.githubCommitSha === process.env.PR_HEAD_SHA &&
    meta.githubCommitRef === process.env.PR_HEAD_REF &&
    meta.githubOrg === process.env.PR_REPO_OWNER &&
    meta.githubRepo === process.env.PR_REPO_NAME
  );
}

async function fetchDeployments() {
  const params = new URLSearchParams({
    projectId: process.env.VERCEL_PROJECT_ID,
    teamId: process.env.VERCEL_ORG_ID,
    limit: "20",
  });
  const response = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
    headers: {
      authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel API ${response.status}: ${body}`);
  }

  return response.json();
}

async function main() {
  const maxAttempts = Number(process.env.VERCEL_PREVIEW_ATTEMPTS || 40);
  const intervalMs = Number(process.env.VERCEL_PREVIEW_INTERVAL_MS || 15000);
  let lastMatch = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const data = await fetchDeployments();
    const deployment = (data.deployments || []).find(isMatchingDeployment);

    if (deployment) {
      lastMatch = deployment;
      if (deployment.readyState === "READY" || deployment.state === "READY") {
        console.error(`Found ready Vercel preview deployment on attempt ${attempt}.`);
        console.log(`https://${deployment.url}`);
        return;
      }

      if (deployment.readyState === "ERROR" || deployment.state === "ERROR") {
        throw new Error(`Vercel preview deployment failed: ${deployment.url}`);
      }

      console.error(
        `Vercel preview deployment is ${deployment.readyState || deployment.state}; waiting...`
      );
    } else {
      console.error(`No Vercel preview deployment found for ${process.env.PR_HEAD_SHA}; waiting...`);
    }

    if (attempt < maxAttempts) {
      await sleep(intervalMs);
    }
  }

  const lastStatus = lastMatch
    ? `${lastMatch.url} was ${lastMatch.readyState || lastMatch.state}`
    : "no matching deployment was found";
  throw new Error(`Timed out waiting for Vercel preview deployment; ${lastStatus}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
