var React = require('react');


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
    var notes = this.props.notes.map(function(note, index) {
      if (note.filename.search(filterText) >= 0) {
        return noteItem({
          selected: (note.filename === this.props.selected),
          filename: note.filename,
          key:note.filename,
          onSelect: this.props.onSelect.bind(null, note),
        });
      }
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
    this.props.onSelect(searchValue);
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
    this.props.onSelect(note.filename);
  },

  getInitialState: function() {
    return {
      selected: null,
      search: '',
      filter: '',
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
        onSelect: this.props.onSelect,
      }),
      noteList({
        notes: this.props.notes,
        filter: this.state.filter,
        onSelect: this.select,
        selected: this.state.selected,
      })
    );
  }
});


var Notes = function(element, callback) {
  this.parent = element;
  this.callback = callback;
};

Notes.prototype.list = function(notes) {
  React.renderComponent(noteListWithSearch({notes: notes, onSelect: this.callback}), this.parent);
};

module.exports = Notes;
