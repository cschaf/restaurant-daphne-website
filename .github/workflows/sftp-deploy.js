const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const HOST = process.argv[2];
const USER = process.argv[3];
const PASS = process.argv[4];

if (!HOST || !USER || !PASS) {
  console.log('Usage: node sftp-deploy.js <host> <username> <password>');
  process.exit(1);
}

const EXCLUDE_DIRS = ['.git', '.github', '.idea', 'node_modules'];
const EXCLUDE_FILES = ['.gitignore', 'package.json', 'package-lock.json', 'test-sftp.js', 'sftp-deploy.js', 'CLAUDE.md'];

function shouldExclude(itemPath) {
  const name = path.basename(itemPath);
  if (EXCLUDE_DIRS.includes(name)) return true;
  if (EXCLUDE_FILES.includes(name)) return true;
  return false;
}

async function uploadDirectory(mkdir, fastPut, localPath, remotePath) {
  const items = fs.readdirSync(localPath);

  for (const item of items) {
    if (shouldExclude(item)) {
      console.log(`  Skipping: ${item}`);
      continue;
    }

    const localItemPath = path.join(localPath, item);
    const remoteItemPath = remotePath === '/'
      ? `/${item}`
      : `${remotePath}/${item}`;

    const stat = fs.statSync(localItemPath);

    if (stat.isDirectory()) {
      console.log(`  Creating directory: ${remoteItemPath}`);
      try {
        await mkdir(remoteItemPath);
      } catch (e) {
        // Directory might already exist
      }

      await uploadDirectory(mkdir, fastPut, localItemPath, remoteItemPath);
    } else {
      console.log(`  Uploading: ${localItemPath} -> ${remoteItemPath}`);
      await fastPut(localItemPath, remoteItemPath);
    }
  }
}

const conn = new Client();

conn.on('ready', () => {
  console.log(`Connected to ${HOST}. Starting upload to /\n`);

  conn.sftp(async (err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    const mkdir = promisify(sftp.mkdir.bind(sftp));
    const fastPut = promisify(sftp.fastPut.bind(sftp));

    try {
      await uploadDirectory(mkdir, fastPut, '.', '/');
      console.log('\nDeploy complete!');
      conn.end();
    } catch (e) {
      console.error('Upload error:', e);
      conn.end();
      process.exit(1);
    }
  });
});

conn.on('error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

conn.on('end', () => {
  process.exit(0);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  password: PASS,
  readyTimeout: 30000
});
