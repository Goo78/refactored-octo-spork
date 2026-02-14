/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

// Get the mock octokit instance once
const mockOctokit = github.getOctokit()

describe('main.ts', () => {
  beforeEach(() => {
    // Reset mocks but not implementation
    core.getInput.mockReset()
    core.info.mockReset()
    core.setOutput.mockReset()
    core.setFailed.mockReset()
    mockOctokit.rest.issues.listForRepo.mockReset()

    // Set default mock implementations
    core.getInput.mockImplementation((name: string) => {
      if (name === 'github-token') return 'fake-token'
      if (name === 'owner') return 'test-owner'
      if (name === 'repo') return 'test-repo'
      return ''
    })
  })

  it('Fetches and reports open issues', async () => {
    // Mock the GitHub API response
    const mockIssues = [
      {
        number: 1,
        title: 'Test issue 1',
        pull_request: undefined
      },
      {
        number: 2,
        title: 'Test issue 2',
        pull_request: undefined
      },
      {
        number: 3,
        title: 'Test issue 3',
        pull_request: undefined
      }
    ]

    mockOctokit.rest.issues.listForRepo.mockResolvedValue({
      data: mockIssues
    })

    await run()

    // Verify the issue count output was set
    expect(core.setOutput).toHaveBeenCalledWith('issue-count', '3')

    // Verify the summary output was set
    expect(core.setOutput).toHaveBeenCalledWith(
      'issue-summary',
      expect.stringContaining('Total Open Issues: 3')
    )

    // Verify info logs were called
    expect(core.info).toHaveBeenCalledWith(
      expect.stringContaining('Fetching open issues')
    )
  })

  it('Filters out pull requests from issues', async () => {
    // Mock the GitHub API response with PRs mixed in
    const mockIssues = [
      {
        number: 1,
        title: 'Test issue 1',
        pull_request: undefined
      },
      {
        number: 2,
        title: 'Test PR',
        pull_request: { url: 'https://api.github.com/repos/test/test/pulls/2' }
      },
      {
        number: 3,
        title: 'Test issue 2',
        pull_request: undefined
      }
    ]

    mockOctokit.rest.issues.listForRepo.mockResolvedValue({
      data: mockIssues
    })

    await run()

    // Should only count actual issues, not PRs
    expect(core.setOutput).toHaveBeenCalledWith('issue-count', '2')
  })

  it('Uses repository context when owner and repo are not provided', async () => {
    // Mock empty inputs for owner and repo
    core.getInput.mockImplementation((name: string) => {
      if (name === 'github-token') return 'fake-token'
      return ''
    })

    mockOctokit.rest.issues.listForRepo.mockResolvedValue({
      data: []
    })

    await run()

    // Verify it used the context
    expect(core.info).toHaveBeenCalledWith(
      'Using repository context: test-owner/test-repo'
    )

    // Verify API was called with context values
    expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      state: 'open',
      per_page: 100
    })
  })

  it('Sets a failed status on error', async () => {
    // Mock an error from the GitHub API
    mockOctokit.rest.issues.listForRepo.mockRejectedValue(
      new Error('API error')
    )

    await run()

    // Verify that the action was marked as failed
    expect(core.setFailed).toHaveBeenCalledWith('API error')
  })

  it('Handles zero open issues correctly', async () => {
    mockOctokit.rest.issues.listForRepo.mockResolvedValue({
      data: []
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('issue-count', '0')
    expect(core.setOutput).toHaveBeenCalledWith(
      'issue-summary',
      expect.stringContaining('Total Open Issues: 0')
    )
  })
})
