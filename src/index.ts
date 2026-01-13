#!/usr/bin/env bun

import { getAuthenticatedOctokit } from './auth.js';
import { fetchPRStats } from './github.js';
import { displayStats, displayLoading, displayError } from './display.js';

async function main() {
  try {
    // Get authenticated Octokit client
    const octokit = await getAuthenticatedOctokit();

    // Show loading message
    displayLoading();

    // Fetch PR statistics and data
    const { stats, needsAttentionPRs } = await fetchPRStats(octokit);

    // Display results
    displayStats(stats, needsAttentionPRs);
  } catch (error) {
    if (error instanceof Error) {
      displayError(error);
    } else {
      displayError(new Error('An unknown error occurred'));
    }
    process.exit(1);
  }
}

main();
