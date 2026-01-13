# Home Assistant Frontend PR Stats

A beautiful CLI tool to display GitHub PR statistics for the home-assistant/frontend repository.

## Features

- View total open + draft PRs
- Count open PRs (non-draft)
- Count draft PRs
- Filtered view of actionable PRs (excludes drafts, "wait for backend", "Needs UX" labels, and PRs with changes requested)
- Interactive GitHub authentication with token storage
- Colored and formatted table output
- Higher API rate limits with authentication (5000/hour vs 60/hour)

## Installation

Install dependencies:

```bash
bun install
```

## Usage

Run the CLI:

```bash
bun src/index.ts
```

Or use the npm script:

```bash
bun start
```

### First Run

On your first run, the tool will guide you through creating a GitHub Personal Access Token:

1. The tool will display a direct link to GitHub's token creation page
2. The token will have the `repo` scope pre-selected
3. Copy your generated token
4. Paste it when prompted
5. The token is saved securely in `~/.config/ha-frontend-pr-stats/token` with 0600 permissions

The tool will:
1. Check for authentication (prompt if needed)
2. Fetch PR data from GitHub
3. Display a nicely formatted table with statistics

## Example Output

```
════════════════════════════════════════════════════════════
  Home Assistant Frontend - PR Statistics
════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────┬──────────┐
│ Metric                                      │ Count    │
├─────────────────────────────────────────────┼──────────┤
│ Total Open + Draft PRs                      │ 150      │
├─────────────────────────────────────────────┼──────────┤
│ Open PRs (non-draft)                        │ 120      │
├─────────────────────────────────────────────┼──────────┤
│ Draft PRs                                   │ 30       │
├─────────────────────────────────────────────┼──────────┤
│                                             │          │
├─────────────────────────────────────────────┼──────────┤
│ Open PRs (filtered)                         │ 85       │
└─────────────────────────────────────────────┴──────────┘

Filtered PRs exclude:
  • Draft PRs
  • PRs with "wait for backend" label
  • PRs with "Needs UX" label
  • PRs with changes requested

════════════════════════════════════════════════════════════
```

## Project Structure

```
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── src/
    ├── index.ts          # Main entry point
    ├── auth.ts           # GitHub authentication
    ├── github.ts         # GitHub API interactions
    └── display.ts        # Terminal output formatting
```

## Technologies

- **Runtime**: Bun.js
- **GitHub API**: @octokit/rest
- **CLI Colors**: chalk
- **Tables**: cli-table3
- **Language**: TypeScript
