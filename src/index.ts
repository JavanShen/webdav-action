import { getInput, setFailed } from '@actions/core'
import { createClient } from 'webdav'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

async function run(): Promise<void> {
  try {
    const webdavUrl = getInput('webdav_url', { required: true })
    const username = getInput('username', { required: true })
    const password = getInput('password', { required: true })
    const destinationPath = getInput('destination_path') || '/'

    // Package the repository contents into a tar.gz archive
    console.log('Packaging repository contents...')
    execSync(
      'tar -czf archive.tar.gz . --exclude=archive.tar.gz --exclude=node_modules --exclude=.git',
      { stdio: 'inherit' }
    )

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
