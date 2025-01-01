import * as fs from "fs";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";
import { paginateGraphQL } from "@octokit/plugin-paginate-graphql";

type Follower = {
  login: string;
  avatorUrl: string;
};

export type Inputs = {
  login: string;
  token: string;
  owner: string;
  repo: string;
  issueNumber: number;
};

const followerToString = (follower: Follower): string => {
  return `<img width="32" alt="image" src="${follower.avatorUrl}"> [${follower.login}](https://github.com/${follower.login})`;
};

export const main = async (inputs: Inputs): Promise<any> => {
  if (inputs.token === "") {
    throw new Error("GITHUB_TOKEN is required");
  }
  if (inputs.login === "") {
    throw new Error("login is required");
  }
  if (inputs.owner === "") {
    throw new Error("owner is required");
  }
  if (inputs.repo === "") {
    throw new Error("repo is required");
  }
  const prevFollowers = convArrayToMap(
    JSON.parse(fs.readFileSync("followers.json", "utf8")) as Follower[],
  );
  // List followers by GraphQL API
  const currentFollowers = convArrayToMap(
    await getFollowers(inputs.login, inputs.token),
  );
  // Output latest followers
  fs.writeFileSync(
    "latest-followers.json",
    JSON.stringify([...currentFollowers.values()]),
  );
  // Compare
  const oldFollowers: Follower[] = [];
  const newFollowers: Follower[] = [];
  for (const [key, follower] of prevFollowers) {
    if (!currentFollowers.has(key)) {
      oldFollowers.push(follower);
    }
  }
  for (const [key, follower] of currentFollowers) {
    if (!prevFollowers.has(key)) {
      newFollowers.push(follower);
    }
  }
  if (oldFollowers.length === 0 && newFollowers.length === 0) {
    core.info("No followers are changed");
    return;
  }
  core.info(
    JSON.stringify({
      newFollowers: newFollowers,
      oldFollowers: oldFollowers,
    }),
  );
  let body = "Total followers: " + currentFollowers.size + "\n\n";
  if (newFollowers.length > 0) {
    body += `## :smile: New followers (${newFollowers.length})\n\n`;
    for (const follower of newFollowers) {
      body += followerToString(follower) + "\n";
    }
  }
  if (oldFollowers.length > 0) {
    body += `## :cry: Past followers (${oldFollowers.length})\n\n`;
    for (const follower of oldFollowers) {
      body += followerToString(follower) + "\n";
    }
  }
  // Post a comment to an issue if followers are changed
  const octokit = github.getOctokit(inputs.token);
  octokit.rest.issues.createComment({
    owner: inputs.owner,
    repo: inputs.repo,
    issue_number: inputs.issueNumber,
    body: body,
  });
};

const convArrayToMap = (followers: Follower[]): Map<string, Follower> => {
  const map = new Map<string, Follower>();
  for (const follower of followers) {
    map.set(follower.login, {
      login: follower.login,
      avatorUrl: follower.avatorUrl,
    });
  }
  return map;
};

const getFollowers = async (
  login: string,
  token: string,
): Promise<Follower[]> => {
  const MyOctokit = Octokit.plugin(paginateGraphQL);
  const octokit = new MyOctokit({ auth: token });
  const pageIterator = octokit.graphql.paginate.iterator(
    `query($cursor: String, $login: String!) {
       user(login: $login) {
         followers(first: 100, after: $cursor) {
           totalCount
           pageInfo {
             endCursor
             hasNextPage
           }
           nodes {
             login
             avatarUrl
           }
         }
       }
     }`,
    {
      cursor: null,
      login: login,
    },
  );
  const followers: Follower[] = [];
  for await (const response of pageIterator) {
    core.debug("response: " + JSON.stringify(response));
    for (const node of response.user.followers.nodes) {
      followers.push({
        login: node.login,
        avatorUrl: node.avatarUrl,
      });
    }
  }
  return followers;
};
