var ipc = require('ipc');
var React = require('react');

var addNotes = require('./note').addNotes;
var matchNote = require('./note').matchNote;
var searchNotes = require('./note').searchNotes;


var noteItem = React.createClass({
  render: function() {
    var attrs = {
      onClick: this.props.onSelect,
    };
    if (this.props.selected) {
      attrs.className = "selected-note";
    }
    return React.DOM.li(attrs, this.props.filename);
  }

});


var noteList = React.createClass({
  render: function() {
    var filterText = this.props.filter;
    var notes = searchNotes(this.props.notes, filterText).map(function(note, index) {
      return noteItem({
        selected: (note === this.props.selected),
        filename: note.name,
        key: note.name,
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


var Notes = function(parentNode) {
  this.notes = [];
  this.parentNode = parentNode;
  this.component = React.renderComponent(noteListWithSearch({
    onSubmit: this.open.bind(this),
    onSearch: this.search.bind(this),
    onSelect: this.select.bind(this),
  }), this.parentNode);
  console.log(this.component);
};

Notes.prototype.add = function(notes) {
  this.notes = addNotes(this.notes, notes);
  this.component.setState({
    notes: this.notes,
  });
};

Notes.prototype.open = function(query) {
  ipc.send('open-note', query);
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
