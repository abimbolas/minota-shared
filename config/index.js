/* eslint no-console: off */
const fs = require('fs-extra-promise');
const os = require('os');
const path = require('path');

function readConfigFrom(configPath) {
  try {
    const config = JSON.parse(fs.readFileSync(`${configPath}/minota.json`, 'utf8'));
    console.log(`Using config in ${configPath}/minota.json.`);
    return config;
  } catch (error) {
    console.log(`minota.json not found at '${configPath}'.`);
    return false;
  }
}

function readConfigRecursiveFrom(configPath) {
  let config;
  let cwd = path.resolve(configPath);
  let prevCwd;
  // While we are not at top-level directory
  while (cwd !== prevCwd) {
    // try to load minota.json config
    try {
      config = JSON.parse(fs.readFileSync(path.resolve(cwd, './minota.json'), 'utf-8'));
      console.log(`Using config in ${path.resolve(cwd, './minota.json')}.`);
      break;
    } catch (error) {
      console.log(`minota.json not found at '${path.resolve(cwd)}'.`);
      prevCwd = cwd;
      cwd = path.resolve(cwd, '..');
    }
  }
  return config;
}

function readAncestorsFrom(currentPath = '.') {
  let cwd = path.resolve(currentPath);
  let prevCwd;
  const topicPath = [];
  while (cwd !== prevCwd) {
    try {
      fs.statSync(path.resolve(cwd, './minota.json'));
      break;
    } catch (error) {
      prevCwd = cwd;
      cwd = path.resolve(cwd, '..');
      topicPath.unshift(prevCwd
        .replace(cwd, '')
        .replace(/^\\/, '')
        .replace(/^\\/, '')
        .replace(/^\//, ''));
    }
  }
  return topicPath;
}

const defaultConfig = {
  storage: {
    type: 'file',
    file: {
      path: '.minota',
    },
  },
};

// Read config from current directory.
// If not present, read from user's home directory.
// If not preset, use default config
module.exports = {
  readFrom: readConfigFrom,
  readAncestors: readAncestorsFrom,
  read() {
    return readConfigRecursiveFrom('.')
      || readConfigFrom(os.homedir())
      || console.log('Using default config.')
      || defaultConfig;
  },
  default: defaultConfig,
};
