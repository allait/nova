var _ = require('underscore');

var Note = function(name, path) {
  this.name = name;
  this.path = path;
  this.firstline = null;
  this.text = null;
};

var matchNote = function(notes, query) {
  return _.find(notes, function(note) {
    return (note.name.indexOf(query) === 0);
  });
};

var searchNotes = function(notes, query) {
  return _.filter(notes, function(note) {
    return (note.name.search(query) >= 0);
  });
};

var addNotes = function(oldNotes, newNotes) {
  return _.union(oldNotes, (_.isArray(newNotes)) ? newNotes : [newNotes]);
};

module.exports = {
  Note: Note,
  searchNotes: searchNotes,
  addNotes: addNotes,
  matchNote: matchNote,
};
