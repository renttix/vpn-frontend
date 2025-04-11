const fs = require('fs');
const path = require('path');

// Paths to remove
const pathsToRemove = [
  path.join(__dirname, 'src', 'app', 'api', 'auth', 'auth0'),
  path.join(__dirname, 'src', 'app', 'api', 'auth', '[...auth0]'),
  path.join(__dirname, 'src', 'app', 'api', 'auth-new')
];

// Function to remove a directory recursively
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call
        removeDir(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`Removed: ${dirPath}`);
  } else {
    console.log(`Directory does not exist: ${dirPath}`);
  }
}

// Remove each path
pathsToRemove.forEach(dirPath => {
  try {
    removeDir(dirPath);
  } catch (err) {
    console.error(`Error removing ${dirPath}:`, err);
  }
});

console.log('Cleanup completed');
