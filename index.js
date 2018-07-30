/**
 * `editor` type prompt
 */

var util = require('util');
var ExternalEditor = require('external-editor');
var Prompt = require('prompt-base');
var red = require('ansi-red');
var dim = require('ansi-dim');

/**
 * Constructor
 */

function Editor(/*question, answers, rl*/) {
  return Prompt.apply(this, arguments);
}

/**
 * Inherit `Prompt`
 */

util.inherits(Editor, Prompt);

/**
 * Start the prompt session
 * @param  {Function} `cb` Callback when prompt is finished
 * @return {Object} Returns the `Editor` instance
 */

Editor.prototype.ask = function(cb) {
  this.callback = cb;

  this.ui.once('line', this.onSubmit.bind(this));
  this.ui.on('keypress', this.render.bind(this, null));
  this.on('error', this.onError.bind(this));

  // Prevents default from being printed on terminal (can look weird with multiple lines)
  this.currentText = this.question.default;
  this.question.default = null;
  this.render();
  return this;
};

/**
 * Render the prompt to terminal
 */

Editor.prototype.render = function(error) {
  var append = '';
  var message = this.message;

  if (this.status === 'answered') {
    message += dim('Received');
  } else {
    message += dim('Press <enter> to launch your preferred editor.');
  }

  if (error) {
    append = red('>> ') + error;
  }

  this.ui.render(message, append);
};

/**
 * Launch $EDITOR when the user presses `enter`
 */

Editor.prototype.startExternalEditor = function() {
  this.currentText = ExternalEditor.edit(this.currentText);
  return this.currentText;
};

/**
 * When the answer is submitted (user presses `enter` key), re-render
 * and pass answer to callback.
 * @param {Object} `event`
 */

Editor.prototype.onSubmit = function(event) {
  this.answer = this.startExternalEditor(event);
  this.submitAnswer(this.answer);
};

/**
 * Handle error events
 * @param {Object} `event`
 */

Editor.prototype.onError = function(event) {
  this.render(event.isValid);
};

/**
 * Module exports
 */

module.exports = Editor;
