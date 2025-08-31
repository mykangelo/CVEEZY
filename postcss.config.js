export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {
      flexbox: 'no-2009',
      grid: 'autoplace',
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'Chrome >= 60',
        'Safari >= 12',
        'iOS >= 12',
        'Android >= 7',
        'Edge >= 79'
      ]
    }
  }
}
