import * as core from "@actions/core";
import { main } from "./run";

try {
  const issueNumber = process.env.ISSUE_NUMBER;
  if (!issueNumber) {
    throw new Error("ISSUE_NUMBER is required");
  }
  main({
    token: process.env.GITHUB_TOKEN || "",
    login: process.env.LOGIN || process.env.GITHUB_REPOSITORY_OWNER || "",
    issueNumber: parseInt(issueNumber, 10),
    owner: process.env.GITHUB_REPOSITORY_OWNER || "",
    repo: (process.env.GITHUB_REPOSITORY || "").split("/")[1],
    pullResult: process.env.RESULT || "",
  });
} catch (error) {
  core.setFailed(
    error instanceof Error ? error.message : JSON.stringify(error),
  );
}
