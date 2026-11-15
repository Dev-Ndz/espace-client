import 'reflect-metadata';
import { createInterface } from 'node:readline';
import { NestFactory } from '@nestjs/core';
import { PasswordHasher } from '@nestjs/authentication';
import { EmailTakenError, UsersService } from '../users/users.service.js';
import { CliModule } from './cli.module.js';
import { validateNewAccount } from './new-account.js';

/**
 * Reads a line from the terminal without echoing it (raw mode, so it works the same in Windows
 * Terminal and on Linux). Ctrl+C aborts.
 */
function readHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stderr } = process;
    let typed = '';
    const finish = (): void => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off('data', onData);
      stderr.write('\n');
    };
    const onData = (chunk: Buffer): void => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\r' || char === '\n') {
          finish();
          resolve(typed);
          return;
        }
        if (char === '\u0003') {
          finish();
          reject(new Error('Aborted.'));
          return;
        }
        if (char === '\u007f' || char === '\b') {
          typed = [...typed].slice(0, -1).join('');
        } else if (char >= ' ') {
          typed += char;
        }
      }
    };
    stderr.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

/**
 * Without a terminal (piped input, scripts), the two passwords are the first two stdin lines.
 * The prompts still go to stderr, and reading stops after the second line instead of waiting
 * for the end of the input.
 */
async function readPipedLines(): Promise<string[]> {
  const lines: string[] = [];
  const prompts = ['Password: ', 'Confirm password: '];
  const reader = createInterface({ input: process.stdin });
  process.stderr.write(prompts[0] ?? '');
  for await (const line of reader) {
    lines.push(line);
    if (lines.length === prompts.length) {
      break;
    }
    process.stderr.write(prompts[lines.length] ?? '');
  }
  reader.close();
  process.stderr.write('\n');
  return lines;
}

async function readPasswords(): Promise<{ password: string; confirmation: string }> {
  if (process.stdin.isTTY) {
    const password = await readHidden('Password: ');
    const confirmation = await readHidden('Confirm password: ');
    return { password, confirmation };
  }
  const [password = '', confirmation = ''] = await readPipedLines();
  return { password, confirmation };
}

async function main(): Promise<number> {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: user:create <email>');
    return 1;
  }
  const { password, confirmation } = await readPasswords();
  const problems = validateNewAccount({ email, password, confirmation });
  if (problems.length > 0) {
    problems.forEach((problem) => console.error(problem));
    return 1;
  }

  const app = await NestFactory.createApplicationContext(CliModule, { logger: ['error'] });
  try {
    const passwordHash = await app.get(PasswordHasher).hash(password);
    const user = await app.get(UsersService).create(email, passwordHash);
    console.log(`User created: ${user.email}`);
    return 0;
  } catch (error) {
    if (error instanceof EmailTakenError) {
      console.error('An account already exists for this email.');
      return 1;
    }
    throw error;
  } finally {
    await app.close();
  }
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
