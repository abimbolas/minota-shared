/* eslint no-console: off */
const fs = require('fs-extra-promise');

function readConfigFrom(path) {
  try {
    const config = JSON.parse(fs.readFileSync(`${path}/minota.json`, 'utf8'));
    console.log(`Using config in ${path}/minota.json.`);
    return config;
  } catch (error) {
    console.log(`minota.json not found at '${path}'.`);
    return false;
  }
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

module.exports = readConfigFrom('.')
  || readConfigFrom('~')
  || console.log('Using default config.')
  || defaultConfig;
