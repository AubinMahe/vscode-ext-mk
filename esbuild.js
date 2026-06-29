import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const options = {
   entryPoints: ['src/extension.ts'],
   outfile: 'out/extension.js',
   bundle: true,
   platform: 'node',
   format: 'esm',
   target: 'node20',
   external: ['vscode'],
   sourcemap: !production,
   minify: production,

   define: {
      DEBUG: production ? 'false' : 'true'
   },

   logLevel: 'info'
};

async function main() {
   if (watch) {
      const ctx = await esbuild.context(options);
      await ctx.watch();
      console.log('Watching...');
   } else {
      await esbuild.build(options);
   }
}

main().catch(err => {
   console.error(err);
   process.exit(1);
});
