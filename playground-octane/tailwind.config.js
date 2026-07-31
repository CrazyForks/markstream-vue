import baseConfig from '../tailwind.config.js'

const baseContent = Array.isArray(baseConfig.content) ? baseConfig.content : []

export default {
  ...baseConfig,
  important: '.markstream-octane-playground',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,tsrx}',
    '../packages/markstream-octane/src/**/*.{js,ts,jsx,tsx,tsrx,css}',
    ...baseContent,
  ],
}
