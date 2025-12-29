"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const webdav_1 = require("webdav");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
async function run() {
    try {
        const webdavUrl = (0, core_1.getInput)('webdav_url', { required: true });
        const username = (0, core_1.getInput)('username', { required: true });
        const password = (0, core_1.getInput)('password', { required: true });
        const destinationPath = (0, core_1.getInput)('destination_path') || '/';
        // Package the repository contents into a tar.gz archive
        console.log('Packaging repository contents...');
        (0, child_process_1.execSync)('tar -czf archive.tar.gz . --exclude=archive.tar.gz --exclude=node_modules --exclude=.git', { stdio: 'inherit' });
        // Create WebDAV client
        const client = (0, webdav_1.createClient)(webdavUrl, {
            username,
            password
        });
        // Upload the archive
        const archivePath = path.join(destinationPath, 'archive.tar.gz');
        console.log(`Uploading to ${archivePath}...`);
        await client.putFileContents(archivePath, fs.createReadStream('archive.tar.gz'));
        console.log('Upload completed successfully.');
    }
    catch (error) {
        if (error instanceof Error) {
            (0, core_1.setFailed)(error.message);
        }
        else {
            (0, core_1.setFailed)('An unknown error occurred');
        }
    }
}
run();
