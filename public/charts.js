const status = document.getElementById('status')
const showPrev = document.getElementById('showPrev')
const showCpm = document.getElementById('showCpm')
const updateDelayed = () => {
  setTimeout(() => update(), 10)
}
const seriesAll = (data, max, realType) => [
  {
    type: 'spline',
    color: '#ff0000',
    name: `TPS`,
    data: data.tps.slice(Math.max(data.tps.length - max, 0)),
  },
  {
    type: 'spline',
    color: 'rgba(170, 32, 32, 0.4)',
    name: `TPS (previous ${realType})`,
    data: data.tps.length < (max * 2) ? [] : data.tps.slice(-(max*2)).slice(0, max).map(arr => [arr[0] + (max * 60 * 1000), arr[1]]),
  },
  {
    type: 'spline',
    color: '#00ff00',
    name: `Players Online`,
    data: data.players.slice(Math.max(data.players.length - max, 0)),
  },
  {
    type: 'spline',
    color: 'rgba(32, 170, 32, 0.4)',
    name: `Players Online (previous ${realType})`,
    data: data.players.length < (max * 2) ? [] : data.players.slice(-(max*2)).slice(0, max).map(arr => [arr[0] + (max * 60 * 1000), arr[1]]),
  },
  {
    type: 'spline',
    color: '#70d49e',
    name: `Players in queue`,
    data: data.playersInQueue.slice(Math.max(data.playersInQueue.length - max, 0)),
  },
  {
    type: 'spline',
    color: 'rgba(42, 142, 88, 0.4)',
    name: `Players in queue (previous ${realType})`,
    data: data.playersInQueue.length < (max * 2) ? [] : data.playersInQueue.slice(-(max*2)).slice(0, max).map(arr => [arr[0] + (max * 60 * 1000), arr[1]]),
  },
  {
    type: 'spline',
    color: '#a6f0ff',
    name: `Total players`,
    data: data.playersInQueue.map((value, index) => [ value[0], data.players[index] + value[1] ]).slice(Math.max(data.playersInQueue.length - max, 0)),
  },
]
const cpmSeries = (data, max, realType) => [{
  type: 'spline',
  color: '#ffff00',
  name: `Chats per minute`,
  data: data.cpm.slice(Math.max(data.cpm.length - max, 0)),
}]
const cpmPrevSeries = (data, max, realType) => [{
  type: 'spline',
  color: 'rgba(170, 170, 32, 0.4)',
  name: `Chats per minute (previous ${realType})`,
  data: data.cpm.length < (max * 2) ? [] : data.cpm.slice(-(max*2)).slice(0, max).map(arr => [arr[0] + (max * 60 * 1000), arr[1]]),
}]
const seriesNoPrev = (data, max, realType) => [
  {
    type: 'spline',
    color: '#ff0000',
    name: `TPS`,
    data: data.tps.slice(Math.max(data.tps.length - max, 0)),
  },
  {
    type: 'spline',
    color: '#00ff00',
    name: `Online players in server`,
    data: data.players.slice(Math.max(data.players.length - max, 0)),
  },
  {
    type: 'spline',
    color: '#70d49e',
    name: `Players in queue`,
    data: data.playersInQueue.slice(Math.max(data.playersInQueue.length - max, 0)),
  },
  {
    type: 'spline',
    color: '#a6f0ff',
    name: `Total players`,
    data: data.playersInQueue.map((value, index, arr) => [ value[0], value[1] + (data.players[data.players.length - (arr.length - index)] || [0, 0])[1] ]).slice(Math.max(data.playersInQueue.length - max, 0)),
  },
]
const update = async () => {
  status.textContent = 'updating data...'
  let max = 1440
  const typeArr = location.href.split('#')
  const type = typeArr.length < 2 ? '24h' : typeArr[1]
  let realType = null
  if (type === 'all' || type === '2d' || type === '48h') {
    max = 2880
    realType = '2d'
  } else if (type === '1d' || type === '24h') {
    max = 1440
    realType = '24h'
  } else if (type === '12h') {
    max = 720
    realType = '12h'
  } else if (type === '6h') {
    max = 360
    realType = '6h'
  } else if (type === '4h') {
    max = 240
    realType = '4h'
  } else if (type === '3h') {
    max = 180
    realType = '3h'
  } else if (type === '2h') {
    max = 120
    realType = '2h'
  } else if (type === '1h') {
    max = 60
    realType = '1h'
  } else {
    max = 1440
    realType = '24h'
  }
  const origin = location.origin
  const data = await fetch(`${origin}/api/data.json`).then(res => res.json())
  let selectedSeries = null
  if (showPrev.checked) { // show previous thing
    selectedSeries = seriesAll(data, max, realType)
    if (showCpm.checked) {
      selectedSeries = selectedSeries.concat(cpmSeries(data, max, realType), cpmPrevSeries(data, max, realType))
    }
  } else { // do not show previous thing
    selectedSeries = seriesNoPrev(data, max, realType)
    if (showCpm.checked) {
      selectedSeries = selectedSeries.concat(cpmSeries(data, max, realType))
    }
  }
  const seemsDown = data.tps[data.tps.length-1][0] < (Date.now() - 180000)
  if (seemsDown) {
    status.textContent = `the server seems down. (last received tps: ${data.tps[data.tps.length-1][1]} and ${data.players[data.players.length-1][1]} players online)`
  } else {
    status.textContent = `tps: ${data.tps[data.tps.length-1][1]}, players in queue: ${data.playersInQueue[data.playersInQueue.length-1][1]} (showing last ${realType} entries [${max}])`
  }
  Highcharts.chart('container', {
    chart: {
      zoomType: 'x',
      backgroundColor: '#0e0e0e',
    },
    title: {
      text: '',
    },
    subtitle: {
      text: '',
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        text: ''
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 0
        },
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 3
          }
        },
      }
    },

    series: selectedSeries.concat(),
    time: { useUTC: false },
  });
}

update()
setInterval(() => update(), 60000);
