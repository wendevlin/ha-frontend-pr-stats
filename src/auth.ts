import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { Octokit } from '@octokit/rest';

const CONFIG_DIR = join(homedir(), '.config', 'ha-frontend-pr-stats');
const TOKEN_FILE = join(CONFIG_DIR, 'token');

async function promptForToken(): Promise<string> {
  console.log(chalk.cyan.bold('\n=== GitHub Authentication Required ===\n'));
  console.log('To use this tool, you need a GitHub Personal Access Token.');
  console.log('This allows higher API rate limits (5000/hour vs 60/hour).\n');

  console.log(chalk.yellow('Steps to create a token:'));
  console.log('1. Click this link to create a token with the required scopes:');
  console.log(chalk.blue.underline('   https://github.com/settings/tokens/new?scopes=repo&description=HA+Frontend+PR+Stats'));
  console.log('2. Click "Generate token" at the bottom of the page');
  console.log('3. Copy the token (it starts with "ghp_")\n');

  console.log(chalk.green('Paste your GitHub token here:'));

  // Read token from stdin
  const input = await new Promise<string>((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });

  return input;
}

function saveToken(token: string): void {
  // Create config directory if it doesn't exist
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  // Save token to file
  writeFileSync(TOKEN_FILE, token, { encoding: 'utf-8' });

  // Set file permissions to 0600 (read/write for owner only)
  chmodSync(TOKEN_FILE, 0o600);
}

function loadToken(): string | null {
  if (!existsSync(TOKEN_FILE)) {
    return null;
  }

  try {
    return readFileSync(TOKEN_FILE, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    return false;
  }
}

export async function getAuthenticatedOctokit(): Promise<Octokit> {
  let token = loadToken();

  // If no token exists, prompt for one
  if (!token) {
    token = await promptForToken();

    // Validate the token
    console.log(chalk.gray('\nValidating token...'));
    const isValid = await validateToken(token);

    if (!isValid) {
      console.log(chalk.red('Invalid token. Please try again.\n'));
      process.exit(1);
    }

    // Save the token
    saveToken(token);
    console.log(chalk.green('Token saved successfully!\n'));
  } else {
    // Validate existing token
    const isValid = await validateToken(token);

    if (!isValid) {
      console.log(chalk.red('Saved token is invalid or expired.'));
      console.log(chalk.yellow('Please provide a new token.\n'));

      token = await promptForToken();

      console.log(chalk.gray('\nValidating token...'));
      const isNewValid = await validateToken(token);

      if (!isNewValid) {
        console.log(chalk.red('Invalid token. Please try again.\n'));
        process.exit(1);
      }

      saveToken(token);
      console.log(chalk.green('Token saved successfully!\n'));
    }
  }

  return new Octokit({ auth: token });
}
