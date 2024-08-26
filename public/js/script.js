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

const renderBusData = (buses) => {
  const tableBody = document.querySelector('#bus tbody')
  tableBody.textContent = ''
  buses.forEach((bus) => {
    const row = document.createElement('tr')

    const nextDepartureDateTimeUTC = new Date(`${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`)

    row.innerHTML = `
<td>${bus.busNumber}</td>
<td>${bus.startPoint} - ${bus.endPoint}</td>
<td>${formatDate(nextDepartureDateTimeUTC)}</td> 
<td>${formatTime(nextDepartureDateTimeUTC)}</td>
`

    tableBody.append(row)
  })
}

const init = async () => {
  const buses = await fetchBusData()
  renderBusData(buses)
}

init()
