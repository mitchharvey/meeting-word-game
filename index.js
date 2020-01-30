const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const shuffle = require('shuffle-array')

const NUM_PLAYERS = 3
const NUM_WORDS = 4

let wordlist = shuffle(require('./wordlist.json'))
let currlist = wordlist.slice(0, NUM_WORDS * NUM_PLAYERS)
wordlist = wordlist.slice(NUM_WORDS * NUM_PLAYERS)
let scores = new Array(NUM_PLAYERS).fill(0)
let names = new Array(NUM_PLAYERS).fill("")


// Add JS sources
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, '/node_modules/socket.io-client/dist')))
app.use('/js', express.static(path.join(__dirname, '/js')))

// Add CSS sources
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootswatch/dist/lux')))
app.use('/css', express.static(path.join(__dirname, '/css')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'))
})

io.on('connection', function(socket) {
  const shortid = socket.id.substr(0,3)
  console.log('CONN: ' + shortid)

  // Give client initial info
  socket.emit('NEW list', currlist)
  socket.emit('NEW scores', scores)
  for (const num in names) {
    socket.emit('NEW name', names[num], "name"+num)
  }

  socket.on('disconnect', function() {
    console.log('DSCN: ' + shortid);
  });

  socket.on('REQ list', function() {
    console.log('REQ list: ' + shortid);
    socket.emit('NEW list', currlist)
  });

  socket.on('DEL word', function(id) {
    // Get new word and send out
    console.log('DEL word: ' + shortid + ' ' + id)
    let num = parseInt(id.substr(4))
    let newword = wordlist.shift()
    currlist[num] = newword
    console.log('NEW word: ' + newword + ' ' + id)
    io.emit('NEW word', newword, id)

    // Increase score
    let playerNum = Math.floor(num / NUM_WORDS)
    scores[playerNum]++
    console.log('INC score: ' + playerNum + ' ' + scores[playerNum])
    io.emit('NEW scores', scores)
  })

  socket.on('REQ name', function (name, id) {
    console.log('REQ name: ' + shortid + ' ' + name + ' ' + id)
    let num = parseInt(id.substr(4))
    names[num] = name
    socket.broadcast.emit('NEW name', name, id)
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
