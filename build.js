import { build } from 'esbuild';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildJavaScript() {
  await build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    bundle: true,
    platform: 'node',
    target: 'es2022',
    sourcemap: true,
    format: 'esm',
    minify: false,
    logLevel: 'info',
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
    await buildJavaScript();
    await generateTypeDeclarations();
    console.log('Build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildLibrary();
