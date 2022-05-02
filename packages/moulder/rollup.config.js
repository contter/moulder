import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
// import external from 'rollup-plugin-peer-deps-external'
import commonjs from '@rollup/plugin-commonjs'
import path from "path";
import copy from "rollup-plugin-copy";

const PRODUCTION = process.env.NODE_ENV === 'production';
const LIBRARY_NAME = 'moulder';

export default [
  {
    // input: 'src/index.ts',
    input: {
      index: path.resolve(__dirname, 'src/index.ts'),
      cli: path.resolve(__dirname, 'src/cli/index.ts')
    },
    output: [
      {
        dir: path.resolve(__dirname, 'dist'),
        entryFileNames: `[name].cjs.js`,
        chunkFileNames: 'chunks/dep-[hash].cjs.js',
        exports: 'named',
        format: 'cjs',
        externalLiveBindings: false,
        freeze: false
      },
      {
        dir: path.resolve(__dirname, 'dist'),
        entryFileNames: `[name].esm.js`,
        chunkFileNames: 'chunks/dep-[hash].esm.js',
        exports: 'named',
        format: 'es',
        externalLiveBindings: false,
        freeze: false
      },
    ],
    plugins: [
      nodeResolve(),
      // external(),
      commonjs({
        extensions: ['.js'],
        // Optional peer deps of ws. Native deps that are mostly for performance.
        // Since ws is not that perf critical for us, just ignore these deps.
        ignore: ['bufferutil', 'utf-8-validate']
      }),
      typescript(),
      copy({
        targets: [
          { src: 'index.tmpl.html', dest: 'dist/' },
          { src: 'vite.config.js', dest: 'dist/' },
          { src: 'tailwind.config.js', dest: 'dist/' },
          { src: 'index.css', dest: 'dist/' }
        ]
      }),
      PRODUCTION && terser({
        mangle: {
          reserved: ['{{{MOULDER_IS_EDITOR}}}']
        }
      }),
    ]
  },
  {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: [
      {
        name: LIBRARY_NAME,
        file: `dist/${LIBRARY_NAME}.umd.js`, // UMD
        format: 'umd',
        // exports: 'auto',
        inlineDynamicImports: true,
        globals: {}
      }
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: false
      }),
      // external(),
      commonjs({
        extensions: ['.js'],
        // Optional peer deps of ws. Native deps that are mostly for performance.
        // Since ws is not that perf critical for us, just ignore these deps.
        ignore: ['bufferutil', 'utf-8-validate']
      }),
      typescript(),
      copy({
        targets: [
          { src: 'index.tmpl.html', dest: 'dist/' },
          { src: 'vite.config.js', dest: 'dist/' },
          { src: 'tailwind.config.js', dest: 'dist/' },
          { src: 'index.css', dest: 'dist/' }
        ]
      }),
      PRODUCTION && terser({
        mangle: {
          reserved: ['{{{MOULDER_IS_EDITOR}}}']
        }
      }),
    ]
  }
];
