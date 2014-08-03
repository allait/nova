var fs = require('fs');
var path = require('path');

var Gaze = require('gaze').Gaze;

var app = require('app');
var ipc = require('ipc');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var Note = require('./app/note').Note;

// Keep a global reference of the window object to avoid GC
var mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

var mainDir = path.join(process.env['HOME'], '/Documents/notes/');

ipc.on('open-note', function(event, filename) {
  var notePath = path.resolve(path.join(mainDir, filename + '.md'));
  console.log("Opening " + notePath);
  fs.readFile(notePath, function(err, data) {
    console.log(err, data);
    if (!err) {
      event.sender.send('open-note', {status: "ok", data: data.toString('utf-8')});
    }
  });
});

var notes = new Gaze('*.md', {cwd: mainDir});
console.log(notes);

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

  // var appIcon = new Tray('');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: true,
    "min-width": 200,
    "min-height": 200,
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  notes.watched(function(err, watched) {
    var notes = watched[mainDir].map(function(note) {
      return new Note(path.basename(note, '.md'), note);
    });
    mainWindow.webContents.on('did-finish-load', function() {
      mainWindow.webContents.send('notes-list', notes);

      notes.forEach(function(note) {
        fs.readFile(note.path, function(err, data) {
          if (!err) {
            note.text = data.toString('utf-8');
            note.firstline = note.text.substr(0, 100).replace('\n', '');
            mainWindow.webContents.send('read-note', {status: "ok", note: note});
          }
        });
      });

    });
  });

  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
