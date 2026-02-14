# Open Issue Tracker GitHub Action

![Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)
![Coverage](./badges/coverage.svg)

A GitHub Action that tracks and reports on open issues in a repository. This
action fetches all open issues from a specified repository and provides a
summary with the total count and details of recent issues.

## Features

- Fetches all open issues from a GitHub repository
- Filters out pull requests to show only actual issues
- Provides detailed summary with issue count and titles
- Can track issues in the current repository or any specified repository
- Outputs results for use in subsequent workflow steps

## Usage

### Basic Usage (Current Repository)

Track open issues in the current repository:

```yaml
steps:
  - name: Track Open Issues
    uses: ./
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Track Issues in a Different Repository

Track open issues in a specific repository:

```yaml
steps:
  - name: Track Open Issues
    uses: ./
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      owner: octocat
      repo: hello-world
```

### Use Outputs in Subsequent Steps

Access the issue count and summary in subsequent steps:

```yaml
steps:
  - name: Track Open Issues
    id: track-issues
    uses: ./
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}

  - name: Display Issue Count
    run:
      echo "There are ${{ steps.track-issues.outputs.issue-count }} open issues"

  - name: Display Issue Summary
    run: echo "${{ steps.track-issues.outputs.issue-summary }}"
```

## Inputs

| Input          | Required | Default                  | Description                                                     |
| -------------- | -------- | ------------------------ | --------------------------------------------------------------- |
| `github-token` | Yes      | N/A                      | GitHub token for API access (use `${{ secrets.GITHUB_TOKEN }}`) |
| `owner`        | No       | Current repository owner | Repository owner (organization or username)                     |
| `repo`         | No       | Current repository name  | Repository name                                                 |

## Outputs

| Output          | Description                                          |
| --------------- | ---------------------------------------------------- |
| `issue-count`   | Total count of open issues (excluding pull requests) |
| `issue-summary` | Markdown-formatted summary of open issues            |

## Example Workflow

Here's a complete example workflow that runs on a schedule to track issues:

```yaml
name: Track Open Issues

on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at midnight
  workflow_dispatch: # Manual trigger

jobs:
  track-issues:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Track Open Issues
        id: track
        uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Comment on Issue Count
        if: steps.track.outputs.issue-count > 10
        run: |
          echo "Warning: High number of open issues!"
          echo "Count: ${{ steps.track.outputs.issue-count }}"
```

## Development

### Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`fnm`](https://github.com/Schniz/fnm), this template has a `.node-version`
> file at the root of the repository that can be used to automatically switch to
> the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node`
> actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   npm test
   ```

### Building and Testing

The action code is written in TypeScript and needs to be bundled into JavaScript
for distribution.

1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > This step is important! It will run [`rollup`](https://rollupjs.org/) to
   > build the final JavaScript action code with all dependencies included. If
   > you do not run this step, your action will not work correctly when it is
   > used in a workflow.

2. (Optional) Test your action locally

   The [`@github/local-action`](https://github.com/github/local-action) utility
   can be used to test your action locally. It is a simple command-line tool
   that "stubs" (or simulates) the GitHub Actions Toolkit. This way, you can run
   your TypeScript action locally without having to commit and push your changes
   to a repository.

   The `local-action` utility can be run in the following ways:
   - Visual Studio Code Debugger

     Make sure to review and, if needed, update
     [`.vscode/launch.json`](./.vscode/launch.json)

   - Terminal/Command Prompt

     ```bash
     # npx @github/local action <action-yaml-path> <entrypoint> <dotenv-file>
     npx @github/local-action . src/main.ts .env
     ```

   You can provide a `.env` file to the `local-action` CLI to set environment
   variables used by the GitHub Actions Toolkit. For example, setting inputs and
   event payload data used by your action. For more information, see the example
   file, [`.env.example`](./.env.example), and the
   [GitHub Actions Documentation](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Validate the Action

You can now validate the action by referencing it in a workflow file. For
example, [`ci.yml`](./.github/workflows/ci.yml) demonstrates how to reference an
action in the same repository.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: ./
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}

  - name: Print Issue Count
    id: output
    run: echo "Open Issues: ${{ steps.test-action.outputs.issue-count }}"
```

For example workflow runs, check out the
[Actions tab](https://github.com/actions/typescript-action/actions)! :rocket:

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
