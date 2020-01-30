const socket = io()
/* Events */
// Receive new word list
socket.on('NEW list', function(list) {
  insertWords(list)
})

// Receive new word
socket.on('NEW word', function(word, id) {
  insertWord(word, id)
})

// Receive new score
socket.on('NEW score', function(score, id) {
  insertScore(score, id)
})

/* Change DOM in response to events */
// Insert words into page
function insertWords(list) {
  const numPerCol = list.length / 3
  for (const word in list) {
    let li
    if (word < numPerCol) {
      li = $("#list1")
    } else if (word < numPerCol * 2) {
      li = $("#list2")
    } else {
      li = $("#list3")
    }
    li.append(`<li class="word" id="word${word}">${list[word]}</li>`)
  }

  // Setup Listener
  $(".word").on('click', function() {
    const id = this.id
    delWord(id)
  })
}

// Replace word at location
function insertWord(word, id) {
  console.log("NEW word: " + word + ' ' + id)
  // Cannot pass to callback functions, so store next word as an attribute.
  $("#"+id).attr("next", word)
  $("#"+id).fadeTo(750, 0, function(word) {
    $(this).text($(this).attr("next"))
    $(this).fadeTo(750, 1)
  })
}

// Replace score at location
function insertScore(score, id) {
  console.log("NEW score: " + score + ' ' + id)
}

// Request new word list
function loadList() {
  socket.emit('REQ list')
}

// Request word is removed
function delWord(id) {
  socket.emit('DEL word', id)
}

$(document).ready(() => {
  loadList()
})