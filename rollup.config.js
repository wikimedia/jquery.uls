import pkg from './package.json';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

export default [
	{
		input: 'src/index.js',
		output: {
			name: 'UniversalLanguageSelector',
			file: pkg.main,
			format: 'iife',
			sourcemap: true,
			globals: {
				jQuery: '$'
			}
		},
		external: [ 'jQuery' ],
		plugins: [
			json(),
			resolve(),
			commonjs(),
			babel( {
				exclude: 'node_modules/**'
			} ),
			esbuild( {
				sourceMap: true,
				minify: true
			} ),
			postcss( {
				extensions: [ '.css' ],
				extract: 'styles/jquery.uls.css',
				minimize: true
			} ),
			copy( {
				targets: [
					{ src: 'examples/**/*', dest: 'dist/examples' },
					{ src: 'images/**/*', dest: 'dist/images' },
					{ src: '*.md', dest: 'dist' },
					{ src: '*-LICENSE', dest: 'dist' },
					{ src: 'CREDITS', dest: 'dist' }
				]
			} )
		]
	}
];
