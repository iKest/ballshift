import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import { string } from 'rollup-plugin-string';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/index.js',
    output: {
        file: 'public/bundle.js',
        format: 'es', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: true
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: true
        }),
        commonjs(),
        globals(),
        builtins(), // tells Rollup how to find date-fns in node_modules
        // commonjs(), // converts date-fns to ES modules
        string({
            include: ['**/*.frag', '**/*.vert']
        }),
        production &&
            terser({
                sourcemap: true,
                compress: true,
                ecma: 5
            }) // minify, but only in production
    ]
};
