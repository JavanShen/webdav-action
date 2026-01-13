# WebDAV 上传 Action

[English](README.md) | 中文

一个 GitHub Action，用于将仓库内容打包并上传到 WebDAV 服务器。支持同时上传到多个目标路径。

## 功能特性

- 📦 自动将仓库内容打包成压缩的 tar.gz 归档文件
- ☁️ 支持身份验证的 WebDAV 服务器上传
- 📁 支持在单次运行中上传到多个目标路径

## 输入参数

| 参数                | 必需 | 描述                                                    |
| ------------------- | ---- | ------------------------------------------------------- |
| `webdav_url`        | ✅   | WebDAV 服务器 URL (例如: `https://example.com/webdav/`) |
| `username`          | ✅   | WebDAV 服务器用户名                                     |
| `password`          | ✅   | WebDAV 服务器密码                                       |
| `destination_paths` | ❌   | WebDAV 服务器上的目标路径列表，用逗号分隔 (默认: `/`)   |
| `archive_name`      | ❌   | 归档文件的自定义名称 (不含扩展名, 默认: `archive`)      |
| `include_timestamp` | ❌   | 是否在文件名中包含时间戳 (true/false, 默认: `false`)    |

## 使用方法

### 基本用法

```yaml
- name: 上传到 WebDAV
  uses: JavanShen/webdav-upload-action@v1
  with:
    webdav_url: ${{ secrets.WEBDAV_URL }}
    username: ${{ secrets.WEBDAV_USERNAME }}
    password: ${{ secrets.WEBDAV_PASSWORD }}
```

### 上传到多个路径

```yaml
- name: 上传到多个 WebDAV 路径
  uses: JavanShen/webdav-upload-action@v1
  with:
    webdav_url: ${{ secrets.WEBDAV_URL }}
    username: ${{ secrets.WEBDAV_USERNAME }}
    password: ${{ secrets.WEBDAV_PASSWORD }}
    destination_paths: '/backup,/archive,/releases'
```

## 设置步骤

### 1. 准备您的 WebDAV 服务器

确保您的 WebDAV 服务器支持：

- 基本身份验证
- 文件上传操作
- 目录创建 (可选，Action 会尝试创建目录)

### 2. 配置 GitHub Secrets

在您的仓库中添加以下密钥 (Settings → Secrets and variables → Actions)：

- `WEBDAV_URL`: 您的 WebDAV 服务器 URL
- `WEBDAV_USERNAME`: WebDAV 服务器用户名
- `WEBDAV_PASSWORD`: WebDAV 服务器密码

### 3. 在 Workflow 中使用

如上面的示例所示，在您的 `.github/workflows/*.yml` 文件中引用此 Action。

## 打包内容

Action 会创建一个 tar.gz 文件 (如果指定了自定义名称)，包含您的仓库内容，但排除以下内容：

- `archive.tar.gz` (输出文件本身)
- `node_modules/` 目录
- `.git/` 目录
- `dist/` 目录
- `.github/` 目录

## 上传后的文件结构

上传成功后，您的 WebDAV 服务器将包含：

```
/your-path/
  └── archive.tar.gz (压缩的仓库内容)
```

对于多个路径，相同的归档文件将被上传到每个指定的位置。
