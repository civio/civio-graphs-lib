import * as meta from "./package.json";

const config = {
  input: "src/index.js",
  external: Object.keys(meta.dependencies || {}),
  output: {
    file: `dist/${meta.name}.js`,
    name: meta.name,
    format: "umd",
    indent: false,
    extend: true,
    globals: Object.assign({}, ...Object.keys(meta.dependencies || {}))
  },
  plugins: []
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.name}.min.js`
    }
  }
];