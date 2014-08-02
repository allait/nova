var $ = require('jquery/dist/jquery'); // jshint ignore:line
var ipc = require('ipc');

var Editor = require('./editor');
var Notes = require('./notelist');

$(function() {
  var editor = new Editor(document.getElementById('note'));
  var notes = new Notes(document.getElementById('notelist'));

  ipc.on('open-note', function(resp) {
    console.log(resp);
    if (resp.status === 'ok') {
      editor.edit(resp.data);
    }
  });

  ipc.on('notes-list', function(resp) {
    notes.add(resp);
  });

});
