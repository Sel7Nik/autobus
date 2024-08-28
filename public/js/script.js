const fetchBusData = async () => {
  try {
    const res = await fetch('/next-departure')
    if (!res.ok) {
      throw new Error('HTTP error! Status: ${res.status')
    }
    const buses = res.json()
    return buses
  } catch (error) {
    console.error(`Error fetching bus data: ${error}`)
  }
}

fetchBusData()

const formatDate = (date) => date.toISOString().split('T')[0]

const formatTime = (date) => date.toTimeString().split(' ')[0].slice(0, 5)

const getTimeremainingSeconds = (departureTime) => {
  const now = new Date()
  const timeDifference = departureTime - now
  return Math.floor(timeDifference / 1000)
}

const renderBusData = (buses) => {
  const tableBody = document.querySelector('#bus tbody')
  tableBody.textContent = ''
  buses.forEach((bus) => {
    const row = document.createElement('tr')

    const nextDepartureDateTimeUTC = new Date(`${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`)

    const remainingSeconds = getTimeremainingSeconds(nextDepartureDateTimeUTC)

    const remainingTimeText = remainingSeconds < 60 ? 'Отправляется' : bus.nextDeparture.remaining

    row.innerHTML = `
<td>${bus.busNumber}</td>
<td>${bus.startPoint} - ${bus.endPoint}</td>
<td>${formatDate(nextDepartureDateTimeUTC)}</td> 
<td>${formatTime(nextDepartureDateTimeUTC)}</td>
<td>${remainingTimeText}</td>
`

    tableBody.append(row)
  })
}

const initWebSocket = () => {
  const ws = new WebSocket('ws://' + `${location.host}`)

  ws.addEventListener('open', () => {
    console.log('WebSocket connection')
  })

  ws.addEventListener('message', (event) => {
    const buses = JSON.parse(event.data)
    renderBusData(buses)
  })

  ws.addEventListener('error', (error) => {
    console.log(`WebSocket error: ${error}`)
  })
  ws.addEventListener('close', (error) => {
    console.log('WebSocket connection close')
  })
}

const updateTime = () => {
  const currentTimeElement = document.getElementById('current-time')
  const now = new Date()
  currentTimeElement.textContent = now.toTimeString().split(' ')[0]

  setTimeout(updateTime, 1000)
}

const init = async () => {
  const buses = await fetchBusData()
  renderBusData(buses)
  initWebSocket()
  updateTime()
}

init()
