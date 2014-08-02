var CodeMirror = require('codemirror/lib/codemirror');

require('codemirror/addon/mode/overlay');
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/gfm/gfm');

var Editor = function(element, settings) {
  this.editor = CodeMirror(element, {
    mode: 'gfm',
    lineWrapping: true,
    matchBrackets: true,
    // foldGutter: true,
    // gutters: ["CodeMirror-foldgutter"],
  });
};

Editor.prototype.edit = function(text) {
  var doc = new CodeMirror.Doc(text, "gfm");
  this.editor.swapDoc(doc);
};

module.exports = Editor;
