module.exports = {
  presets: [
    ['@babel/preset-env', {
      "targets": {
        "chrome": "80"
      },
      "useBuiltIns": 'entry'
    }],
    ['@babel/preset-react'],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-proposal-nullish-coalescing-operator"],
    ["@babel/plugin-proposal-optional-chaining"],
    ["@babel/plugin-transform-regenerator"]
  ]
}