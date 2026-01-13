import Table from 'cli-table3';
import chalk from 'chalk';
import { PRStats, PRInfo } from './github.js';

export function displayStats(stats: PRStats, needsAttentionPRs: PRInfo[]): void {
  console.log('\n' + chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('  Home Assistant Frontend - PR Statistics'));
  console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');

  const table = new Table({
    head: [
      chalk.white.bold('Metric'),
      chalk.white.bold('Count'),
    ],
    style: {
      head: [],
      border: ['gray'],
    },
    wordWrap: true,
  });

  // GitHub URLs for each filter
  const baseUrl = 'https://github.com/home-assistant/frontend/pulls';
  const allOpenUrl = baseUrl;
  const nonDraftUrl = `${baseUrl}?q=is%3Apr+is%3Aopen+draft%3Afalse`;
  const draftUrl = `${baseUrl}?q=is%3Apr+is%3Aopen+draft%3Atrue`;
  const filteredUrl = `${baseUrl}?q=is%3Apr+is%3Aopen+draft%3Afalse+-label%3A%22wait+for+backend%22+-label%3A%22Needs+UX%22`;

  table.push(
    [
      chalk.cyan('Total Open + Draft PRs'),
      chalk.cyan.bold(stats.totalOpenAndDraft.toString()),
    ],
    [
      chalk.green('Open PRs (non-draft)'),
      chalk.green.bold(stats.openOnly.toString()),
    ],
    [
      chalk.yellow('Draft PRs'),
      chalk.yellow.bold(stats.draftOnly.toString()),
    ],
    [
      chalk.magenta('Open PRs (filtered)'),
      chalk.magenta.bold(stats.filteredOpen.toString()),
    ]
  );

  console.log(table.toString());

  console.log('\n' + chalk.gray('Filtered PRs exclude:'));
  console.log(chalk.gray('  • Draft PRs'));
  console.log(chalk.gray('  • PRs with "wait for backend" label'));
  console.log(chalk.gray('  • PRs with "Needs UX" label'));
  console.log(chalk.gray('  • PRs with changes requested'));
  console.log('\n' + chalk.gray('Note: GitHub filter link excludes labels but not review state'));

  console.log('\n' + chalk.gray.bold('Quick Links:'));
  console.log(chalk.gray('  All: ') + chalk.blue(allOpenUrl));
  console.log(chalk.gray('  Non-draft: ') + chalk.blue(nonDraftUrl));
  console.log(chalk.gray('  Draft: ') + chalk.blue(draftUrl));
  console.log(chalk.gray('  Filtered: ') + chalk.blue(filteredUrl));

  console.log('\n' + chalk.cyan.bold('═'.repeat(60)) + '\n');

  // Display PRs that need attention (no reviewers, no assignees)
  if (needsAttentionPRs.length > 0) {
    console.log(chalk.yellow.bold('PRs Needing Attention'));
    console.log(chalk.gray('(No reviewers, no assignees, ready for review)\n'));

    needsAttentionPRs.forEach((pr) => {
      console.log(`  ${chalk.cyan(`#${pr.number}`)} - ${pr.title}`);
      console.log(`      ${chalk.blue(pr.url)}\n`);
    });

    console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');
  } else {
    console.log(chalk.green('No PRs needing attention! All filtered PRs have reviewers or assignees.\n'));
    console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');
  }
}

export function displayLoading(): void {
  console.log(chalk.gray('\nFetching PR data from GitHub...'));
  console.log(chalk.gray('This may take a moment...\n'));
}

export function displayError(error: Error): void {
  console.log('\n' + chalk.red.bold('Error: ') + error.message + '\n');
}
