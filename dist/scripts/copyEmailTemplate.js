"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const srcDir = path_1.default.join(__dirname, '../config/emailTemplates');
const destDir = path_1.default.join(__dirname, '../../dist/config/emailTemplates');
fs_1.default.mkdirSync(destDir, { recursive: true });
const files = fs_1.default.readdirSync(srcDir);
console.log(files, 'files to copy', srcDir);
files.forEach(file => {
    const srcFile = path_1.default.join(srcDir, file);
    const destFile = path_1.default.join(destDir, file);
    fs_1.default.copyFileSync(srcFile, destFile);
    console.log(`Copied ${file} to dist/config/emailTemplates/`);
});
