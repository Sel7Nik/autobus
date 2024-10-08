import express from 'express'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __filename = url.fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const PORT = 3000
const TIMEZONE = 'UTC'

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

const loadBuses = async () => {
  const data = await readFile(path.join(__dirname, 'buses.json'), 'utf-8')
  return JSON.parse(data)
}

const getNextDeparture = (firstDepartureTime, frequencyMinutes) => {
  // получение текущего времени в формате utf-8
  const now = DateTime.now().setZone(TIMEZONE)
  // текущее время в формате отдельно часы и минуты
  const [hours, minutes] = firstDepartureTime.split(':').map((n) => parseInt(n))
  // const [hours, minutes] = firstDepartureTime.split(':').map(Number)
  // получаем время первого отправления
  let departure = DateTime.now().set({ hours, minutes, seconds: 0 }).setZone(TIMEZONE)

  // Время окончания дня
  const endOfDay = DateTime.now().set({ hours: 23, minutes: 59, seconds: 59 }).setZone(TIMEZONE)

  if (departure > endOfDay) {
    departure = departure.startOf('day').plus({ days: 1 }).set({ hours, minutes })
  }

  while (now > departure) {
    departure = departure.plus({ minutes: frequencyMinutes })
    if (departure > endOfDay) {
      departure = departure.startOf('day').plus({ days: 1 }).set({ hours, minutes })
    }
  }
  return departure
}

const sendUpdateData = async () => {
  // получаем список всех расписаний
  const buses = await loadBuses()

  const updatedBuses = buses.map((bus) => {
    const nextDeparture = getNextDeparture(bus.firstDepartureTime, bus.frequencyMinutes)
    return {
      ...bus,
      nextDeparture: {
        date: nextDeparture.toFormat('yyyy-MM-dd'),
        time: nextDeparture.toFormat('HH:mm'),
      },
    }
  })

  return updatedBuses
}

const sortBuses = (buses) =>
  [...buses].sort(
    (a, b) =>
      // DateTime.fromISO(`${a.nextDeparture.date}T${a.nextDeparture.time}Z`) -
      // DateTime.fromISO(`${b.nextDeparture.date}T${b.nextDeparture.time}Z`)
      new Date(`${a.nextDeparture.date}T${a.nextDeparture.time}Z`) -
      new Date(`${b.nextDeparture.date}T${b.nextDeparture.time}Z`)
  )

app.get('/next-departure', async (req, res) => {
  try {
    const updatedBuses = await sendUpdateData()
    const sortedBuses = sortBuses(updatedBuses)

    res.json(sortedBuses)
  } catch (error) {
    res.send('error : ', error)
  }
})

app.listen(PORT, () => {
  console.log('Server is running on port http://localhost:' + PORT)
})
