import fs from 'fs';
import path from 'path';


const srcDir = path.join(__dirname, '../config/emailTemplates');
const destDir = path.join(__dirname, '../../dist/config/emailTemplates');

fs.mkdirSync(destDir, { recursive: true });
const files = fs.readdirSync(srcDir);
console.log(files, 'files to copy', srcDir);
files.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file} to dist/config/emailTemplates/`);
});
