import express from 'express'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __filename = url.fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const port = 3000

const app = express()

const loadBuses = async () => {
  const data = await readFile(path.join(__dirname, 'buses.json'), 'utf-8')
  console.log('data: ', data)
}
loadBuses()
app.get('/next-departure', async (req, res) => {
  try {
  } catch (error) {
    res.send('error : ', error)
  }
})

app.listen(port, () => {
  console.log('Server is running on port' + port)
})
