module.exports = {
  module: {
    rules: [
      {
        test: /\.glsl$|\.frag$|\.vert$/i,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'glslify-loader'
          }
        ],
      },
    ],
  },
  
};