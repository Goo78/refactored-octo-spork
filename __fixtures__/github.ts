import { jest } from '@jest/globals'

const mockListForRepo = jest.fn()

const mockOctokit = {
  rest: {
    issues: {
      listForRepo: mockListForRepo
    }
  }
}

export const getOctokit = jest.fn(() => mockOctokit)

export const context = {
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  }
}
