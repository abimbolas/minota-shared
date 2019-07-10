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
      console.log(`Using config in ${path.resolve(cwd, './minota.json').replace(/\\/g, '/')}.`);
      break;
    } catch (error) {
      console.log(`minota.json not found at '${path.resolve(cwd)}'.`);
      prevCwd = cwd;
      cwd = path.resolve(cwd, '..');
    }
  }
  if (config) {
    const foundPath = cwd.replace(/\\/g, '/').split('/');
    const currentPath = path.resolve(configPath).replace(/\\/g, '/').split('/');
    const parentsLength = currentPath.length - foundPath.length;
    return {
      config,
      path: cwd.replace(/\\/g, '/'),
      breadcrumbs: parentsLength ? currentPath.slice(-parentsLength).join('/') : '',
    };
  }
  return {};
}

function searchConfig() {
  const searches = [
    function firstSearch() {
      return readConfigRecursiveFrom('.');
    },
    function secondSearch() {
      const homepath = os.homedir().replace(/\\/g, '/');
      const config = readConfigFrom(homepath);
      if (config) {
        return {
          config,
          path: homepath,
        };
      }
      return {};
    },
  ];
  let result = {};
  for (let i = 0; i < searches.length; i += 1) {
    result = searches[i]();
    if (result.config) {
      break;
    }
  }
  return result.config ? result : {};
}

const defaultConfig = {
  storage: {
    url: 'file://.minota'
  },
};

// Read config from current directory.
// If not present, read from user's home directory.
// If not preset, use default config
module.exports = {
  readFrom: readConfigFrom,
  search: searchConfig,
  read() {
    return readConfigRecursiveFrom('.').config
      || readConfigFrom(os.homedir())
      || console.log('Using default config.')
      || defaultConfig;
  },
  default: defaultConfig,
};
