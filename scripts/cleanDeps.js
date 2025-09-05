const { execSync } = require('child_process');
const path = require('path');

function cleanupDependencies() {
  const backendPath = path.join(__dirname, '../pos-backend');
  
  try {
    // Clean install production dependencies
    console.log('Installing production dependencies...');
    execSync('npm ci --production --no-package-lock', {
      cwd: backendPath,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('Dependencies cleanup completed successfully');
  } catch (error) {
    console.error('Error during dependencies cleanup:', error);
    process.exit(1);
  }
}

cleanupDependencies();
