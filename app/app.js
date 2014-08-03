var $ = require('jquery/dist/jquery'); // jshint ignore:line
var ipc = require('ipc');

var Editor = require('./editor');
var Notes = require('./notelist');

$(function() {
  var editor = new Editor(document.getElementById('note'));
  var notes = new Notes(document.getElementById('notelist'), editor);

  ipc.on('open-note', function(resp) {
    console.log(resp);
    if (resp.status === 'ok') {
      editor.edit(resp.data);
    }
    // XXX add new note (or add note text to existing one) to the notelist
  });

  ipc.on('notes-list', function(resp) {
    notes.add(resp);
  });
});
