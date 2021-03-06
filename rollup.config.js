import { terser } from 'rollup-plugin-terser'
import * as meta from './package.json'

const config = {
  input: 'src/js/index.js',
  external: Object.keys(meta.dependencies || {}),
  output: {
    file: `dist/${meta.name}.js`,
    name: meta.name,
    format: 'umd',
    indent: false,
    extend: true,
    banner: `// ${meta.name} v${
      meta.version
    } Copyright ${new Date().getFullYear()} ${meta.author.name}`,
    globals: Object.assign({}, ...Object.keys(meta.dependencies || {})) //.filter(key => /^d3-/.test(key)).map(key => ({[key]: 'd3'})))
  },
  plugins: []
}

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.name}.min.js`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
]
