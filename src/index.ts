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
    const destinationPath = getInput('destination_path') || '/'

    // Package the repository contents into a tar.gz archive
    console.log('Packaging repository contents...')
    await createTarGzArchive('.', 'archive.tar.gz')

    // Create WebDAV client
    const client = createClient(webdavUrl, {
      username,
      password
    })

    // Upload the archive
    const archivePath = path.join(destinationPath, 'archive.tar.gz')
    console.log(`Uploading to ${archivePath}...`)
    await client.putFileContents(
      archivePath,
      fs.createReadStream('archive.tar.gz')
    )

    console.log('Upload completed successfully.')
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    } else {
      setFailed('An unknown error occurred')
    }
  }
}

run()
