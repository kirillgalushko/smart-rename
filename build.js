import { build } from 'esbuild';
import { exec } from 'child_process';
import { promisify } from 'util';
import { rimraf } from 'rimraf';

const execAsync = promisify(exec);

const distPath = './dist';

async function clearDistFolder() {
  await rimraf(distPath);
  console.log('Output folder cleaned.');
}

async function buildJavaScript() {
  await build({
    entryPoints: ['./src/index.ts'],
    outfile: distPath + '/index.js',
    bundle: true,
    platform: 'node',
    target: 'es2022',
    sourcemap: true,
    format: 'esm',
    minify: false,
    logLevel: 'info',
    external: ['*.test.ts', '*/tests'],
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
    },
  });
  console.log('JavaScript build completed.');
}

async function generateTypeDeclarations() {
  await execAsync('tsc --emitDeclarationOnly --outDir ./dist');
  console.log('TypeScript declarations generated.');
}

async function buildLibrary() {
  try {
    console.log('Starting build...');
    await clearDistFolder();
    await buildJavaScript();
    await generateTypeDeclarations();
    console.log('Build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildLibrary();
