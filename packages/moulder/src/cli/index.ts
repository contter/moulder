import path from 'path';
import { promises as fss } from 'fs';
import * as process from 'process';
import { spawn, exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
const AdmZip = require('adm-zip');
const fse = require('fs-extra');
const { version } = require('../package.json');

const VITE_CONFIG_PATH = path.resolve(__dirname, 'vite.config.js');
const MODULE_PATH_TS = path.resolve(process.cwd(), 'src', 'index.ts');
const MODULE_PATH_JS = path.resolve(process.cwd(), 'src', 'index.js');
const TMPL_PATH = path.resolve(__dirname, 'index.tmpl.html');
const INDEX_HTML = path.resolve(__dirname, 'index.html');
const BUILD_PATH = path.resolve(__dirname, 'dist');
const ARCHIVE_PATH = path.resolve(__dirname, 'asset.zip');

const fileExists = (path: string) =>
  fss.stat(path).then(
    () => true,
    () => false
  );

let sp: any;

export const moulderRun = async () => {
  const isWindows = os.platform() === 'win32';
  const command = process.argv.slice(-1)[0] ?? 'dev';
  // TODO parse arg, run vite
  // Check if exist in index.html
  let html = await fss.readFile(TMPL_PATH, 'utf-8');
  const modulePath = await fileExists(MODULE_PATH_TS);
  html = html.replace(
    '#MODULE_PATH',
    (isWindows ? '/' : '') + (modulePath ? MODULE_PATH_TS : MODULE_PATH_JS),
  );

  await fss.writeFile(INDEX_HTML, html);

  sp = spawn('vite', [command, '-c', VITE_CONFIG_PATH], { detached: true, shell: true });

  sp.stdout.on('data', (data: any) => {
    console.log(`${data}`);
  });

  sp.stderr.on('data', (_) => {
    // (data: any)
    // console.error(`stderr: ${data}`);
  });

  const exitCode = await new Promise((resolve, _) => {
    // child.on('close', resolve);
    sp.on('close', (code: any) => {
      resolve(code);
    });
  });

  if (command === 'build' && exitCode === 0) {
    await fss.writeFile(
      path.resolve(BUILD_PATH, 'moulder.json'),
      JSON.stringify({ version })
    );

    const zip = new AdmZip();
    zip.addLocalFolder(BUILD_PATH);
    zip.writeZip(ARCHIVE_PATH);
    const destDir = path.resolve(process.cwd(), 'dist');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    // copy to process.cwd()
    // Copy to project
    // fs.writeFile(path.resolve(destDir, 'moulder.json'), JSON.stringify({ version }), (err) => {
    //   if (err) throw err;
    // });

    fse.copy(BUILD_PATH, destDir, function (err: any) {
      if (err) {
        console.error(err);
      } else {
      }
    });
    fs.copyFile(
      ARCHIVE_PATH,
      path.resolve(process.cwd(), 'asset.zip'),
      (err) => {
        if (err) throw err;
      }
    );
  }
};

moulderRun().then();

process.on('SIGTERM', () => {
  sp?.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  sp?.kill();
  process.exit(0);
});
