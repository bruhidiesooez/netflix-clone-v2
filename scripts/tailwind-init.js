const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const cfgPath = path.join(root, 'tailwind.config.js')
const postcssPath = path.join(root, 'postcss.config.js')
const globalsPath = path.join(root, 'styles', 'globals.css')

function writeIfNotExists(p, content) {
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, content)
    console.log('created', p)
  } else {
    console.log('exists', p)
  }
}

writeIfNotExists(cfgPath, `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: [\n    \"./pages/**/*.{js,ts,jsx,tsx}\",\n    \"./components/**/*.{js,ts,jsx,tsx}\"\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n`)

writeIfNotExists(postcssPath, `module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n`)

writeIfNotExists(globalsPath, `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`)

console.log('done')
