var ipc = require('ipc');
var React = require('react');
var addNotes = require('./note').add;
var searchNotes = require('./note').search;

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
        selected: (note.filename === this.props.selected),
        filename: note.filename,
        key:note.filename,
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
  select: function (note) {
    this.setState({
      selected: note.filename,
      search: note.filename,
    });
    this.props.open(note.filename);
  },

  getInitialState: function() {
    return {
      selected: null,
      search: '',
      filter: '',
      notes: [],
    };
  },

  handleUserInput: function(search) {
    this.setState({
      search: search,
      filter: search,
      selected: search,
    });
  },

  render: function() {
    return React.DOM.div(
      null,
      searchField({
        search: this.state.search,
        onUserInput: this.handleUserInput,
        onSubmit: this.props.open,
      }),
      noteList({
        notes: this.state.notes,
        filter: this.state.filter,
        onSelect: this.select,
        selected: this.state.selected,
      })
    );
  }
});


var Notes = function(parentNode) {
  this.notes = [];
  this.parentNode = parentNode;
  this.component = React.renderComponent(noteListWithSearch({open: this.open}), this.parentNode);
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

module.exports = Notes;
