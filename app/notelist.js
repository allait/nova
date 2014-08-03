var ipc = require('ipc');
var React = require('react/addons');

var addNotes = require('./note').addNotes;
var matchNote = require('./note').matchNote;
var searchNotes = require('./note').searchNotes;


var noteItem = React.createClass({
  render: function() {
    var attrs = {
      onClick: this.props.onSelect,
      className: React.addons.classSet({
        "note": true,
        "selected-note": this.props.selected,
      }),
    };
    return React.DOM.li(
      attrs,
      this.props.note.name,
      React.DOM.span({className: "first-line"}, this.props.note.firstline)
    );
  }

});


var noteList = React.createClass({
  render: function() {
    var filterText = this.props.filter;
    var notes = searchNotes(this.props.notes, filterText).map(function(note, index) {
      return noteItem({
        selected: (note === this.props.selected),
        note: note,
        key: note.path,
        onSelect: this.props.onSelect.bind(null, note),
      });
    }, this);
    return React.DOM.ul({id: "notes"}, notes);
  }
});


var searchField = React.createClass({
  handleChange: function() {
    this.props.onUserInput(this.refs.searchInput.getDOMNode().value);
  },

  handleSubmit: function() {
    var searchValue = this.refs.searchInput.getDOMNode().value;
    this.props.onSubmit(searchValue);
    return false;
  },

  render: function() {
    return React.DOM.form({onSubmit: this.handleSubmit}, React.DOM.input({
      type: "text",
      id: "nav",
      value: this.props.search,
      ref: "searchInput",
      onChange: this.handleChange
    }));
  }
});


var noteListWithSearch = React.createClass({
  getInitialState: function() {
    return {
      selected: null,
      search: '',
      filter: '',
      notes: [],
    };
  },

  render: function() {
    return React.DOM.div(
      null,
      searchField({
        search: this.state.search,
        onUserInput: this.props.onSearch,
        onSubmit: this.props.onSubmit,
      }),
      noteList({
        notes: this.state.notes,
        filter: this.state.filter,
        onSelect: this.props.onSelect,
        selected: this.state.selected,
      })
    );
  }
});


var Notes = function(parentNode, editor) {
  this.notes = [];
  this.editor = editor;
  this.parentNode = parentNode;
  this.component = React.renderComponent(noteListWithSearch({
    onSubmit: this.open.bind(this),
    onSearch: this.search.bind(this),
    onSelect: this.select.bind(this),
  }), this.parentNode);
};

Notes.prototype.add = function(notes) {
  this.notes = addNotes(this.notes, notes);
  this.component.setState({
    notes: this.notes,
  });
};

Notes.prototype.open = function(query) {
  // XXX This could use a note object as an argument and send a full
  // path to the server, but what happens when we want to create
  // a new note? Do Note objects have any use for `path` at all
  // or should it be resolved on server side only?
  // Maybe replace `path` with `key` that is a safe unique representation
  // of note name + subfolder used for opening existing notes.
  var note = matchNote(this.notes, query, true);
  if (note) {
    this.editor.edit(note.text);
  } else {
    ipc.send('open-note', query);
  }
};

Notes.prototype.search = function(query) {
  var selected = matchNote(this.notes, query);
  if (selected) {
    this.open(selected.name);
  }
  this.component.setState({
    search: query,
    filter: query,
    selected: selected,
  });
};

Notes.prototype.select = function(note) {
  this.component.setState({
    selected: note,
    search: note.name,
  });
  this.open(note.name);
};


module.exports = Notes;
