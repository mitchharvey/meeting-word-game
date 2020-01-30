const socket = io()
/* Events */
// Receive new word list
socket.on('NEW list', function (list) {
  insertWords(list)
})

// Receive new word
socket.on('NEW word', function (word, id) {
  insertWord(word, id)
})

// Receive new score
socket.on('NEW scores', function (scores) {
  insertScores(scores)
})

socket.on('NEW name', function (name, id) {
  insertName(name, id)
})

/* Change DOM in response to events */
// Insert words into page
function insertWords (list) {
  // Clear current wordlists
  $('.wordslist').empty()
  const numPerCol = list.length / 3
  for (const word in list) {
    if (list[word] === null) {
      continue
    }

    // Add to correct list
    const listNum = Math.floor(word / numPerCol)
    const li = $('#list' + listNum)
    li.append(`<div class="word" id="word${word}">${list[word]}</div>`)
  }

  // Setup Listener
  $('.word').on('click', function () {
    if ($(this).attr('disabled')) {
      return false
    }
    const id = this.id
    delWord(id)
  })
}

// Replace word at location
function insertWord (word, id) {
  console.log('NEW word: ' + word + ' ' + id)
  if (word === null) {
    $('#' + id).fadeOut()
    return
  }
  const div = $('#' + id)
  // Cannot pass to callback functions, so store next word as an attribute.
  div.attr('disabled', true)
  div.attr('next', word)
  div.fadeTo(750, 0, function () {
    $(this).text($(this).attr('next'))
    $(this).fadeTo(750, 1, function () {
      $(this).removeAttr('disabled')
    })
  })
}

// Replace score at location
function insertScores (scores) {
  console.log('NEW scores: ' + scores)
  for (const num in scores) {
    $('#score' + num).text(scores[num])
  }

  // Get max score
  const max = Math.max(...scores)

  $('.score').each(function () {
    console.log($(this).text(), max+"", $(this).text() == max+"")
    if ($(this).text() == max+"") {
      $(this).addClass("winning")
      $(this).siblings(".name").addClass("winning")
    } else {
      $(this).removeClass("winning")
      $(this).siblings(".name").removeClass("winning")
    }
  })
}

// Replace name
function insertName (name, id) {
  console.log('NEW name: ' + name + ' ' + id)
  $('#' + id).val(name)
}

// Request new word list
function loadList () {
  socket.emit('REQ list')
}

// Request word is removed
function delWord (id) {
  socket.emit('DEL word', id)
}

$(document).ready(() => {
  $('.name input').change(function () {
    const id = $(this).attr('id')
    const val = $(this).val()
    console.log('REQ name', val, id)
    socket.emit('REQ name', val, id)
  })
})
