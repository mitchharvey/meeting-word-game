const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const shuffle = require('shuffle-array')

const NUM_WORDS = 4

let wordlist = shuffle(require('./wordlist.json'))
let currlist = wordlist.slice(0, NUM_WORDS * 3)
wordlist = wordlist.slice(NUM_WORDS * 3)


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

  socket.on('disconnect', function() {
    console.log('DSCN: ' + shortid);
  });

  socket.on('REQ list', function() {
    console.log('REQ list: ' + shortid);
    socket.emit('NEW list', currlist)
  });

  socket.on('DEL word', function(id) {
    console.log('DEL word: ' + shortid + ' ' + id)
    let num = parseInt(id.substr(4))
    let newword = wordlist.shift()
    currlist[num] = newword
    console.log('NEW word: ' + newword + ' ' + id)
    io.emit('NEW word', newword, id)
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
