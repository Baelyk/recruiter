// const EventEmitter = require('events')
const {parseString} = require('xml2js')
const request = require('request')

// https://www.nationstates.net/cgi-bin/api.cgi?a=sendTG&client=(Client Key)&tgid=(TGID)&key=(Secret Key)&to=(nation_name)

function cleanNames (name) {
  if (Array.isArray(name)) {
    return name.map(name => {
      return name.replace(/ /g, '_').toLowerCase()
    })
  } else {
    return name.replace(/ /g, '_').toLowerCase()
  }
}

function telegram (id, secretKey, clientKey, recipient, emitter, type) {
  let url, nation
  recipient = cleanNames(recipient)
  if (!Array.isArray(recipient)) {
    recipient = [recipient]
  }
  nation = recipient.shift()
  url = `https://www.nationstates.net/cgi-bin/api.cgi?a=sendTG&client=${clientKey}&tgid=${id}&key=${secretKey}&to=${nation}`
  const options = {
    url: url,
    headers: {
      'User-Agent': 'Babylatia'
    }
  }
  request(options, (error, response, body) => {
    if (error) {
      console.log('- ERROR -----')
      console.error(error)
      console.log('---')
      console.log(response)
      console.log('-------------')
    }
    if (response.statusCode !== 200) {
      console.log(response)
      console.log('---')
      console.log(body)
      recipient.unshift(nation)
      emitter.emit('telegram-fail', nation, response.statusCode, response.statusMessage)
    } else {
      emitter.emit('telegram-sent', nation, response.statusCode, response.statusMessage)
    }
    console.log(`[${response.statusCode}] ${nation}: ${response.statusMessage}`)
    if (Array.isArray(recipient) && recipient.length > 0) setTimeout(telegram, 180 * 1000, id, secretKey, clientKey, recipient, emitter, type)
  })
}

function solicitRecipients (type) {
  let url
  if (type === 'wa') {
    url = `https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members`
  } else {
    url = `https://www.nationstates.net/cgi-bin/api.cgi?q=newnations`
  }
  const options = {
    url: url,
    headers: {
      'User-Agent': 'Babylatia'
    }
  }
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error, response, body)
      } else {
        parseString(body, (error, result) => {
          if (error) console.error(error)
          if (type === 'wa') {
            resolve(result['WA']['MEMBERS'][0].split(','))
          } else {
            resolve(result['WORLD']['NEWNATIONS'][0].split(','))
          }
        })
      }
    })
  })
}

// telegram('19355305', 'ef2d9cddd956', '7ee8e374', ['Babylatia', 'ask_and_the_answer'])

module.exports.telegram = telegram
module.exports.solicitRecipients = solicitRecipients
