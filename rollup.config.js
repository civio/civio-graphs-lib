export default {
  input: 'src/index.js',
  external: ['d3'],
  output: {
    file: 'dist/civio-graphs-lib.js',
    name: 'civio-graphs-lib',
    format: 'umd',
    indent: false,
    extend: true,
    globals: {
      d3: 'd3'
    }
  },
  plugins: []
};