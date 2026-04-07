const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const HOST = process.argv[2];
const USER = process.argv[3];
const PASS = process.argv[4];

if (!HOST || !USER || !PASS) {
  console.log('Usage: node sftp-deploy.js <host> <username> <password>');
  process.exit(1);
}

const conn = new Client();

const EXCLUDE_DIRS = ['.git', '.github', '.idea', 'node_modules'];
const EXCLUDE_FILES = ['.gitignore', 'package.json', 'package-lock.json', 'test-sftp.js', 'sftp-deploy.js'];

function shouldExclude(itemPath) {
  const name = path.basename(itemPath);
  if (EXCLUDE_DIRS.includes(name)) return true;
  if (EXCLUDE_FILES.includes(name)) return true;
  return false;
}

function uploadDirectory(sftp, localPath, remotePath) {
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
        sftp.mkdir(remoteItemPath);
      } catch (e) {
        // Directory might already exist
      }

      uploadDirectory(sftp, localItemPath, remoteItemPath);
    } else {
      console.log(`  Uploading: ${localItemPath} -> ${remoteItemPath}`);
      sftp.fastPut(localItemPath, remoteItemPath);
    }
  }
}

conn.on('ready', () => {
  console.log(`Connected to ${HOST}. Starting upload to /\n`);

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    try {
      uploadDirectory(sftp, '.', '/');
      console.log('\nDeploy complete!');

      // Cleanup old tar.gz files from failed deployments
      console.log('\nCleaning up temporary files...');
      sftp.readdir('/', (err, list) => {
        if (err || !list) {
          console.log('Cleanup skipped (could not read directory)');
          process.exit(0);
          return;
        }

        const tarFiles = list.filter(item => item.filename.endsWith('.tar.gz'));

        if (tarFiles.length === 0) {
          console.log('No temp files to clean up.');
          process.exit(0);
          return;
        }

        let deleted = 0;
        for (const item of tarFiles) {
          sftp.unlink(`/${item.filename}`, (err) => {
            if (err) {
              console.log(`  Failed to delete: ${item.filename}`);
            } else {
              console.log(`  Deleted: ${item.filename}`);
            }
            deleted++;
            if (deleted === tarFiles.length) {
              process.exit(0);
            }
          });
        }
      });
    } catch (e) {
      console.error('Upload error:', e);
      process.exit(1);
    }
  });
});

conn.on('error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  password: PASS,
  readyTimeout: 30000
});
