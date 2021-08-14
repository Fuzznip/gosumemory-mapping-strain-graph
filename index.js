let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

let progressChart = document.getElementById("progress");
let main = document.getElementById("main");
let pp = document.getElementById("pp");
let ppCurrent = document.getElementById("ppCurrent");
let starRating = document.getElementById("starRating");
let starRatingCurrent = document.getElementById("starRatingCurrent");

socket.onopen = () => {
  console.log("Successfully Connected");
};

socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!")
};

socket.onerror = error => {
  console.log("Socket Error: ", error);
};

function smooth(arr, windowSize, getter = (value) => value, setter) {
  const get = getter
  const result = []

  for (let i = 0; i < arr.length; i += 1) {
    const leftOffeset = i - windowSize
    const from = leftOffeset >= 0 ? leftOffeset : 0
    const to = i + windowSize + 1

    let count = 0
    let sum = 0
    for (let j = from; j < to && j < arr.length; j += 1) {
      sum += get(arr[j])
      count += 1
    }

    result[i] = setter ? setter(arr[i], sum / count) : sum / count
  }

  return result
}

let tempState;
let smoothOffset = 1;
let seek;
let tempStrainBase;
let fullTime;
let onepart;
socket.onmessage = event => {
  let data = JSON.parse(event.data);

  if(tempState !== data.menu.state) {
    tempState = data.menu.state;
    if(tempState === 1) {
      main.style.visibility = 'visible';
    }
    else {
      main.style.visibility = 'hidden';
    }
  }

  if(tempStrainBase != JSON.stringify(data.menu.pp.strains)) {
    tempStrainBase = JSON.stringify(data.menu.pp.strains);
    smoothed = smooth(data.menu.pp.strains, smoothOffset);
    config.data.datasets[0].data = smoothed;
    config.data.labels = smoothed;
    configSecond.data.datasets[0].data = smoothed;
    configSecond.data.labels = smoothed;
    window.myLine.update();
    window.myLineSecond.update();
  }
  if(fullTime !== data.menu.bm.time.mp3) {
    fullTime = data.menu.bm.time.mp3;
    onepart = 1110 / fullTime;
  }
  if(seek !== data.menu.bm.time.current && fullTime !== undefined && fullTime != 0) {
    seek = data.menu.bm.time.current;
    progressChart.style.width = onepart * seek + 'px';
    pp.style.left = onepart * seek - (Math.ceil(ppCurrent.clientWidth) / 2) + 'px';
    starRating.style.left = onepart * seek - (Math.ceil(starRatingCurrent.clientWidth) / 2) + 'px';
  }

  if(data.gameplay.pp.current != '') {
    let ppData = data.gameplay.pp.current;
    ppCurrent.innerHTML = Math.round(ppData) + 'pp';
  }
  else {
    ppCurrent.innerHTML = 0;
  }

  if(data.menu.bm.stats.SR != '') {
    starRatingCurrent.innerHTML = data.menu.bm.stats.SR + '★';
  }
  else {
    starRatingCurrent.innerHTML = 0;
  }
}

window.onload = function () {
  var ctx = document.getElementById('canvas').getContext('2d');
  window.myLine = new Chart(ctx, config);

  var ctxSecond = document.getElementById('canvasSecond').getContext('2d');
  window.myLineSecond = new Chart(ctxSecond, configSecond);
};

let config = {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      borderColor: '#023047ff',
      backgroundColor: '#8ecae624',
      data: [],
      fill: true,
    }]
  },
  options: {
    tooltips: { enabled: false },
    legend: {
      display: false,
    },
    elements: {
      line: {
        tension: 0.4,
        cubicInterpolationMode: 'monotone'
      },
      point: {
        radius: 0
      }
    },
    responsive: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      }
    }
  }
};

let configSecond = {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      borderColor: '#023047ff',
      backgroundColor: '#219ebca4',
      data: [],
      fill: true,
    }]
  },
  options: {
    tooltips: { enabled: false },
    legend: {
      display: false,
    },
    elements: {
      line: {
        tension: 0.4,
        cubicInterpolationMode: 'monotone'
      },
      point: {
        radius: 0
      }
    },
    responsive: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      }
    }
  }
}
