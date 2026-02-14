import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const token = core.getInput('github-token', { required: true })
    let owner = core.getInput('owner')
    let repo = core.getInput('repo')

    // If owner and repo are not provided, use the current repository context
    if (!owner || !repo) {
      owner = github.context.repo.owner
      repo = github.context.repo.repo
      core.info(`Using repository context: ${owner}/${repo}`)
    }

    core.info(`Fetching open issues for ${owner}/${repo}`)

    // Create GitHub client
    const octokit = github.getOctokit(token)

    // Fetch open issues
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100
    })

    // Filter out pull requests (GitHub API includes PRs in issues endpoint)
    const actualIssues = issues.filter((issue) => !issue.pull_request)

    const issueCount = actualIssues.length
    core.info(`Found ${issueCount} open issues`)

    // Create summary
    let summary = `**Open Issues Summary for ${owner}/${repo}**\n\n`
    summary += `Total Open Issues: ${issueCount}\n\n`

    if (issueCount > 0) {
      summary += 'Recent Issues:\n'
      actualIssues.slice(0, 10).forEach((issue) => {
        summary += `- #${issue.number}: ${issue.title}\n`
      })

      if (issueCount > 10) {
        summary += `\n... and ${issueCount - 10} more issues`
      }
    }

    // Set outputs
    core.setOutput('issue-count', issueCount.toString())
    core.setOutput('issue-summary', summary)

    // Also log the summary
    core.info('\n' + summary)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
