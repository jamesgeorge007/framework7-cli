const path = require('path');
const fs = require('fs');
const copyCoreAssets = require('./core/copy-assets');
const copyVueAssets = require('./vue/copy-assets');
const copyReactAssets = require('./react/copy-assets');
const generateIndex = require('./generate-index');
const generateStyles = require('./generate-styles');
const generateScripts = require('./generate-scripts');
const generateRoutes = require('./generate-routes');
const generateWebpackConfig = require('./generate-webpack-config');
const generateManifest = require('./generate-manifest');

const cwd = process.cwd();

module.exports = (options) => {
  const { framework, bundler, type } = options;

  const toCopy = [];
  if (framework === 'core') toCopy.push(...copyCoreAssets(options));
  if (framework === 'vue') toCopy.push(...copyVueAssets(options));
  if (framework === 'react') toCopy.push(...copyReactAssets(options));

  // Copy Icons
  toCopy.push({
    from: path.resolve(__dirname, 'common', 'css', 'icons.css'),
    to: path.resolve(cwd, 'src', 'css', 'icons.css'),
  });

  // Copy Fonts
  toCopy.push(...['eot', 'ttf', 'woff', 'woff2'].map((ext) => {
    return {
      from: path.resolve(__dirname, 'common', 'material-icons-font', `MaterialIcons-Regular.${ext}`),
      to: path.resolve(cwd, 'src', 'fonts', `MaterialIcons-Regular.${ext}`),
    };
  }));
  toCopy.push(...['eot', 'ttf', 'woff', 'woff2'].map((ext) => {
    return {
      from: path.resolve(cwd, 'node_modules', 'framework7-icons', 'fonts', `Framework7Icons-Regular.${ext}`),
      to: path.resolve(cwd, 'src', 'fonts', `Framework7Icons-Regular.${ext}`),
    };
  }));

  // Copy Main Assets
  toCopy.push(...[
    {
      to: path.resolve(cwd, 'src/index.html'),
      content: generateIndex(options),
    },
    {
      to: path.resolve(cwd, 'src/css/app.css'),
      content: generateStyles(options),
    },
    {
      to: path.resolve(cwd, 'src/js/routes.js'),
      content: generateRoutes(options),
    },
    {
      to: path.resolve(cwd, 'src/js/app.js'),
      content: generateScripts(options),
    },
  ]);

  // Copy Bundlers
  if (bundler === 'webpack') {
    toCopy.push({
      from: path.resolve(__dirname, 'common', 'webpack', 'build.js'),
      to: path.resolve(cwd, 'build', 'build.js'),
    });
    toCopy.push({
      content: generateWebpackConfig(options),
      to: path.resolve(cwd, 'build', 'webpack.config.js'),
    });
    toCopy.push({
      from: path.resolve(__dirname, 'common', 'postcss.config.js'),
      to: path.resolve(cwd, 'postcss.config.js'),
    });
  }

  // Copy Web Images & Icons
  if (type.indexOf('web') >= 0 || type.indexOf('pwa') >= 0) {
    const assetsFolder = bundler === 'webpack' ? 'static' : 'assets';
    fs.readdirSync(path.resolve(__dirname, 'common', 'icons')).forEach((f) => {
      if (f.indexOf('.') === 0) return;
      toCopy.push({
        from: path.resolve(__dirname, 'common', 'icons', f),
        to: path.resolve(cwd, 'src', assetsFolder, 'icons', f),
      });
    });
  }
  if (type.indexOf('pwa') >= 0) {
    toCopy.push({
      content: generateManifest(options),
      to: path.resolve(cwd, 'src', 'manifest.json'),
    });
  }

  return toCopy;
};