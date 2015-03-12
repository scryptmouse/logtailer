/**
 * @class Tailer
 * https://github.com/scryptmouse/tailer
 *
 * Copyright (c) 2015 Alexa Grey
 * Licensed under the MIT license.
 */

'use strict';

var Tail    = require('tail').Tail
  , Line    = require('./line')
  , colors  = require('colors')
  , sprintf = require('sprintf')
  , touch   = require('touch')
  , path    = require('path')
  , _       = require('lodash')
;

/**
 * @method constructor
 * @param {String[]} [argv=process.argv]
 */
function Tailer(argv) {
  if (!(this instanceof Tailer)) {
    return new Tailer(argv);
  }

  argv = argv || process.argv;

  var filename = argv[2];

  if (filename) {
    this.filename = path.resolve(process.cwd(), filename);
  }
}

module.exports = Tailer;

Tailer.prototype.start = function Tailer$start() {
  if (!this.filename) {
    throw new Error('ERR! requires a filename');
  }

  this.tail = new Tail(this.filename, '\n', {}, true);

  this.log('Watching %s\n'.underline.yellow, this.filename);

  this.tail.on('line', this.onLine);
  this.tail.on('error', this.onTailError);

  setTimeout(this.touchFile.bind(this), 500);
};

/**
 * @private
 * @return {void}
 */
Tailer.prototype.log = function() {
  console.log.apply(console, arguments);
};

/**
 * @private
 * @param {String} data
 * @return {void}
 */
Tailer.prototype.onLine = function Tailer$onLine(data) {
  var line = new Line(data);

  line.messages.forEach(function(msg) {
    console.log(msg);
  });
};

/**
 * @private
 * @param {Error} err
 * @return {void}
 */
Tailer.prototype.onTailError = function Tailer$onTailError(err) {
  console.warn('PROBLEM READING %s', err);
};

/**
 * @private
 * @return {void}
 */
Tailer.prototype.touchFile = function Tailer$touchFile(err) {
  touch.sync(this.filename);
};
