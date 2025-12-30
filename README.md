# WebDAV Upload Action

English | [中文](README_CN.md)

A GitHub Action that packages your repository contents and uploads them to a WebDAV server. Supports uploading to multiple destination paths simultaneously.

## Features

- 📦 Automatically packages repository contents into a compressed tar.gz archive
- ☁️ Uploads to WebDAV servers with authentication
- 📁 Supports multiple destination paths in a single action run

## Inputs

| Input               | Required | Description                                                               |
| ------------------- | -------- | ------------------------------------------------------------------------- |
| `webdav_url`        | ✅       | WebDAV server URL (e.g., `https://example.com/webdav/`)                   |
| `username`          | ✅       | WebDAV server username                                                    |
| `password`          | ✅       | WebDAV server password                                                    |
| `destination_paths` | ❌       | Comma-separated list of destination paths on WebDAV server (default: `/`) |

## Usage

### Basic Usage

```yaml
- name: Upload to WebDAV
  uses: JavanShen/webdav-upload-action@v1
  with:
    webdav_url: ${{ secrets.WEBDAV_URL }}
    username: ${{ secrets.WEBDAV_USERNAME }}
    password: ${{ secrets.WEBDAV_PASSWORD }}
```

### Upload to Multiple Paths

```yaml
- name: Upload to multiple WebDAV paths
  uses: JavanShen/webdav-upload-action@v1
  with:
    webdav_url: ${{ secrets.WEBDAV_URL }}
    username: ${{ secrets.WEBDAV_USERNAME }}
    password: ${{ secrets.WEBDAV_PASSWORD }}
    destination_paths: '/backup,/archive,/releases'
```

## Setup

### 1. Prepare Your WebDAV Server

Ensure your WebDAV server supports:

- Basic authentication
- File upload operations
- Directory creation (optional, action will attempt to create directories)

### 2. Configure GitHub Secrets

Add the following secrets to your repository (Settings → Secrets and variables → Actions):

- `WEBDAV_URL`: Your WebDAV server URL
- `WEBDAV_USERNAME`: WebDAV server username
- `WEBDAV_PASSWORD`: WebDAV server password

### 3. Use in Your Workflow

Reference this action in your `.github/workflows/*.yml` file as shown in the examples above.

## What Gets Packaged

The action creates a `archive.tar.gz` file containing your repository contents, excluding:

- `archive.tar.gz` (the output file itself)
- `node_modules/` directory
- `.git/` directory
- `dist/` directory
- `.github/` directory

## File Structure After Upload

After successful upload, your WebDAV server will contain:

```
/your-path/
  └── archive.tar.gz (compressed repository contents)
```

For multiple paths, the same archive will be uploaded to each specified location.
