/**
 * `editor` type prompt
 */

var util = require('util');
var ExternalEditor = require('external-editor');
var BasePrompt = require('enquirer-prompt');
var log = require('log-utils');

/**
 * Constructor
 */

function Prompt() {
  return BasePrompt.apply(this, arguments);
}

/**
 * Inherit `BasePrompt`
 */

util.inherits(Prompt, BasePrompt);

/**
 * Start the prompt session
 * @param  {Function} `cb` Callback when prompt is finished
 * @return {Object} Returns the `Prompt` instance
 */

Prompt.prototype.ask = function(cb) {
  this.callback = cb;
  var self = this;

  this.ui.once('line', function(e) {
    self.onSubmit({value: self.startExternalEditor(e)});
  });

  this.ui.on('keypress', this.render.bind(this, null));
  this.ui.on('error', this.onError.bind(this));

  // Prevents default from being printed on terminal (can look weird with multiple lines)
  this.currentText = this.question.default;
  this.question.default = null;

  // Init
  this.render();
  return this;
};

/**
 * Render the prompt to terminal
 */

Prompt.prototype.render = function(error) {
  var append = '';
  var message = this.message;

  if (this.status === 'answered') {
    message += log.dim('Received');
  } else {
    message += log.dim('Press <enter> to launch your preferred editor.');
  }

  if (error) {
    append = log.red('>> ') + error;
  }

  this.ui.render(message, append);
};

/**
 * Launch $EDITOR on user press enter
 */

Prompt.prototype.startExternalEditor = function() {
  this.currentText = ExternalEditor.edit(this.currentText);
  return this.currentText;
};

Prompt.prototype.onSubmit = function(state) {
  this.answer = state.value;
  this.status = 'answered';
  this.render();
  this.ui.write();
  this.callback(this.answer);
};

Prompt.prototype.onError = function(state) {
  this.render(state.isValid);
};

/**
 * Module exports
 */

module.exports = Prompt;
