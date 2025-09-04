const { exec } = require('child_process');
const path = require('path');

// electron-builder expects the script to export a default function that returns a Promise.
module.exports = function() {
  return new Promise((resolve, reject) => {
    console.log('Running beforeBuild script to install backend dependencies...');
    const backendDir = path.join(__dirname, '../pos-backend');

    const child = exec('npm install', { cwd: backendDir });

    // Pipe stdout and stderr to the main process to see the output
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('close', (code) => {
      if (code === 0) {
        console.log('\nBackend dependencies installed successfully.');
        resolve();
      } else {
        console.error(`\nFailed to install backend dependencies. The process exited with code ${code}`);
        reject(new Error('Failed to install backend dependencies.'));
      }
    });
  });
};