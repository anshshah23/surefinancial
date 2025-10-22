/**
 * Next.js custom webpack configuration to avoid resolving native `canvas`
 * which pdfjs-dist optionally requires. Mark `canvas` external on the server
 * (so webpack won't try to bundle it) and provide a client-side fallback.
 */
module.exports = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Treat 'canvas' as external on the server bundle so webpack won't try to resolve it
      config.externals = Array.isArray(config.externals) ? config.externals.concat(['canvas']) : ['canvas'];
      // Alias canvas to a local shim to satisfy any runtime require calls in server code
      config.resolve = config.resolve || {};
      config.resolve.alias = Object.assign({}, config.resolve.alias, {
        canvas: require('path').resolve(__dirname, 'src/shims/canvas-shim.js'),
      });
    } else {
      // For client bundle, provide a harmless fallback so bundling does not fail
      config.resolve = config.resolve || {};
      config.resolve.fallback = Object.assign({}, config.resolve.fallback, { canvas: false });
    }

    return config;
  },
};
