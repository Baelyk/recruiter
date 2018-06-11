// const EventEmitter = require('events')
// const emitter = new EventEmitter()
const ipc = require('electron').ipcRenderer

let elements = {
  nationName: document.querySelector('#nation-name'),
  progressBar: document.querySelector('#progress-bar'),
  recruit: {
    new: document.querySelector('#recruit-new')
  }
}
let intervalID

function progress (reset = false) {
  if (reset) {
    clearInterval(intervalID)
    intervalID = setInterval(progress, 1 * 1e3)
    elements.progressBar.value = 0
  } else if (reset === 'stop') {
    clearInterval(intervalID)
    elements.progressBar.value = 0
  } else {
    elements.progressBar.value++
  }
}
function recruitNew () {
  progress('stop')
  ipc.send('recruit-new')
}

elements.recruit.new.addEventListener('click', recruitNew)

ipc.on('telegram-sent', (nation) => {
  elements.nationName.textContent = nation[0]
  progress(true)
})

ipc.on('telegram-fail', () => {
  progress(true)
})
