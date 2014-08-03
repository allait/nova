var fs = require('fs');
var path = require('path');

var Gaze = require('gaze').Gaze;
var Q = require('q');

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

var dirWatcher = new Gaze('*.md', {cwd: mainDir});
var notesQ = Q.ninvoke(dirWatcher, "watched").then(function(watched) {
  return Q.all(watched[mainDir].map(function(file) {
    return Q.nfcall(fs.readFile, file).then(function (data) {
      var note = new Note(path.basename(file, '.md'), file);
      note.text = data.toString('utf-8');
      note.firstline = note.text.substr(0, 100).replace('\n', '');
      return note;
    });
  }));
}, function(reason) {
  console.log(reason);
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

  // var appIcon = new Tray('');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 400,
    height: 600,
    frame: true,
    "min-width": 200,
    "min-height": 200,
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // mainWindow.openDevTools();
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
    notesQ.then(function (notes) {
      mainWindow.webContents.send('notes-list', notes);
    });
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
