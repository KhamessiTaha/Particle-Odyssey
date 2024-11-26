module.exports = {
    webpack: (config) => {
      config.module.rules.push({
        test: /\.js$/,
        use: ["source-map-loader"],
        exclude: [/node_modules\/@mediapipe/]
      });
      return config;
    }
  };