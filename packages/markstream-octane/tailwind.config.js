import baseConfig from '../../tailwind.config.js'

export default {
  ...baseConfig,
  important: '.markstream-octane',
  // Avoid emitting global `.container` rules in the packaged CSS.
  corePlugins: {
    container: false,
  },
  content: [
    './src/**/*.{ts,tsrx}',
    './src/**/*.css',
  ],
}
