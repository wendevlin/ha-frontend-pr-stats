import { Octokit } from '@octokit/rest';

export interface PRStats {
  totalOpenAndDraft: number;
  openOnly: number;
  draftOnly: number;
  filteredOpen: number;
}

export interface PRInfo {
  number: number;
  title: string;
  url: string;
}

export interface PRData {
  stats: PRStats;
  needsAttentionPRs: PRInfo[];
}

interface PullRequest {
  number: number;
  title: string;
  draft: boolean;
  labels: Array<{ name: string }>;
  state: string;
}

export async function fetchPRStats(octokit: Octokit): Promise<PRData> {
  const owner = 'home-assistant';
  const repo = 'frontend';

  // Fetch all open PRs (including drafts)
  const { data: allPRs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  // Initialize counters
  let totalOpenAndDraft = allPRs.length;
  let openOnly = 0;
  let draftOnly = 0;
  let filteredOpen = 0;
  const needsAttentionPRs: PRInfo[] = [];

  // Process each PR
  for (const pr of allPRs) {
    // Count open vs draft
    if (pr.draft) {
      draftOnly++;
    } else {
      openOnly++;
    }

    // Check if PR should be included in filtered count
    if (!pr.draft) {
      const labelNames = pr.labels.map((label) => {
        if (typeof label === 'string') {
          return label;
        }
        return label.name || '';
      });

      // Check for excluded labels
      const hasWaitForBackend = labelNames.some((name) =>
        name.toLowerCase().includes('wait for backend')
      );
      const hasNeedsUX = labelNames.some((name) =>
        name.toLowerCase().includes('needs ux')
      );

      // Skip if has excluded labels
      if (hasWaitForBackend || hasNeedsUX) {
        continue;
      }

      // Check for changes requested
      const { data: reviews } = await octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: pr.number,
      });

      // Get the latest review from each reviewer
      const latestReviews = new Map<string, string>();
      for (const review of reviews) {
        if (review.user && review.state) {
          latestReviews.set(review.user.login, review.state);
        }
      }

      // Check if any reviewer has requested changes (as their latest review)
      const hasChangesRequested = Array.from(latestReviews.values()).some(
        (state) => state === 'CHANGES_REQUESTED'
      );

      if (!hasChangesRequested) {
        filteredOpen++;

        // Check if PR needs attention (no reviewers and no assignees)
        const hasNoReviewers = reviews.length === 0 && (!pr.requested_reviewers || pr.requested_reviewers.length === 0);
        const hasNoAssignees = !pr.assignees || pr.assignees.length === 0;

        if (hasNoReviewers && hasNoAssignees) {
          needsAttentionPRs.push({
            number: pr.number,
            title: pr.title,
            url: pr.html_url,
          });
        }
      }
    }
  }

  return {
    stats: {
      totalOpenAndDraft,
      openOnly,
      draftOnly,
      filteredOpen,
    },
    needsAttentionPRs,
  };
}
