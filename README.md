# monitor-gh-follower-action

[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/suzuki-shunsuke/monitor-gh-follower-action/main/LICENSE) | [Example Workflow](https://github.com/suzuki-shunsuke/monitor-gh-follower-action/blob/main/.github/workflows/watch-follower.yaml) | [action.yaml](action.yaml)

GitHub Action to monitor changes of a specific user's GitHub Followers.
By running this action periodically via GitHub Actions' schedule event, you can detect changes of GitHub Followers and post them to a specific GitHub Issue.

<img width="424" alt="image" src="https://github.com/user-attachments/assets/b01b31f8-e342-4658-aa53-c2c3c3b9f538" />

## Action's Inputs / Outputs

Please see [action.yaml](action.yaml).

## Setup GitHub Container Registry

This action stores the result of the latest followers into GitHub Container Registry.
You need to allow GitHub Access token's owner to access the package.

[Oras CLI](https://oras.land/docs/category/oras-commands) is used.

1. Push a dummy followers.json

https://oras.land/docs/commands/oras_push

```sh
echo '{}' > followers.json
oras push "ghcr.io/$GITHUB_REPOSITORY/followers.json:latest" followers.json
```

2. [Grant the permission](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)

If you use [GITHUB_TOKEN secret](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication), you need to grant the repository where this action is run to the permission.

## Available versions

> [!CAUTION]
> We don't add `dist/*.js` in the main branch and feature branches.
> So you can't specify `main` and feature branches as versions.
>
> ```yaml
> # This never works as dist/index.js doesn't exist.
> uses: suzuki-shunsuke/monitor-gh-followers-action@main
> ```

The following versions are available.

1. [Release versions](https://github.com/suzuki-shunsuke/monitor-gh-followers-action/releases)

```yaml
uses: suzuki-shunsuke/monitor-gh-followers-action@v0.1.0
```

2. [Pull Request versions](https://github.com/suzuki-shunsuke/monitor-gh-followers-action/branches/all?query=pr%2F&lastTab=overview): These versions are removed when we feel unnecessary. These versions are used to test pull requests.

```yaml
uses: suzuki-shunsuke/monitor-gh-followers-action@pr/22
```

3. [latest branch](https://github.com/suzuki-shunsuke/monitor-gh-followers-action/tree/latest): [This branch is built by CI when the main branch is updated](https://github.com/suzuki-shunsuke/monitor-gh-followers-action/blob/latest/.github/workflows/main.yaml). Note that we push commits to the latest branch forcibly.

```yaml
uses: suzuki-shunsuke/monitor-gh-followers-action@latest
```

Pull Request versions and the latest branch are unstable.
These versions are for testing.
You should use the latest release version in production.
