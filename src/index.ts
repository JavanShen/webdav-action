import { getInput, setFailed } from '@actions/core'
import { createClient } from 'webdav'
import * as fs from 'fs'
import * as path from 'path'
import archiver from 'archiver'

async function createTarGzArchive(
  sourceDir: string,
  outputFile: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFile)
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 6 }
    })

    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} bytes`)
      resolve()
    })

    archive.on('error', (err: Error) => {
      reject(err)
    })

    archive.pipe(output)

    // Add all files from source directory, excluding certain patterns
    archive.glob('**/*', {
      cwd: sourceDir,
      ignore: [
        'archive.tar.gz',
        'node_modules/**',
        '.git/**',
        'dist/**',
        '.github/**'
      ]
    })

    archive.finalize()
  })
}

async function run(): Promise<void> {
  try {
    const webdavUrl = getInput('webdav_url', { required: true })
    const username = getInput('username', { required: true })
    const password = getInput('password', { required: true })
    const destinationPathsInput = getInput('destination_paths') || '/'

    console.log(`WebDAV URL: ${webdavUrl}`)
    console.log(`Destination paths input: ${destinationPathsInput}`)

    // Parse destination paths (comma-separated)
    const destinationPaths = destinationPathsInput
      .split(',')
      .map(p => p.trim().replace(/^\/+/, '/').replace(/\/+$/, '') || '/')
      .filter(path => path.length > 0)

    console.log(`Parsed destination paths: ${JSON.stringify(destinationPaths)}`)

    // Package the repository contents into a tar.gz archive
    console.log('Packaging repository contents...')
    await createTarGzArchive('.', 'archive.tar.gz')

    // Create WebDAV client
    const client = createClient(webdavUrl, {
      username,
      password
    })

    // Upload the archive to each destination path
    for (const destPath of destinationPaths) {
      try {
        // Ensure the destination directory exists
        console.log(`Ensuring directory exists: ${destPath}`)
        await client.createDirectory(destPath, { recursive: true })

        const archivePath = path.join(destPath, 'archive.tar.gz')
        console.log(`Uploading to ${archivePath}...`)
        await client.putFileContents(
          archivePath,
          fs.createReadStream('archive.tar.gz')
        )
        console.log(`Successfully uploaded to ${archivePath}`)
      } catch (dirError) {
        console.warn(
          `Warning: Could not create directory ${destPath}:`,
          dirError instanceof Error ? dirError.message : dirError
        )
        // Try uploading anyway in case directory already exists
        const archivePath = path.join(destPath, 'archive.tar.gz')
        console.log(`Attempting upload to ${archivePath}...`)
        await client.putFileContents(
          archivePath,
          fs.createReadStream('archive.tar.gz')
        )
        console.log(`Successfully uploaded to ${archivePath}`)
      }
    }

    console.log(
      `Upload completed successfully to ${destinationPaths.length} path(s).`
    )
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    } else {
      setFailed('An unknown error occurred')
    }
  }
}

run()
