/**
 * @class Tailer.Formatter
 */
'use strict';

var Utility = require('./utility')
  , lazy    = require('lazy-property')
  , colors  = require('colors')
  , indent  = require('indent')
  , sprintf = require('sprintf')
  , util    = require('util')
  , wrap    = require('wordwrap')(40)
  , wrap2   = require('wordwrap')(70)
  , _       = require('lodash')
;

var DURATION_FORMAT = '%7.2fms'
  , TYPE_FORMAT     = '%-8s'
  , PREFIX_FORMAT   = Utility.bracketWrap('%(type)s %(duration)s')
  , REQ_ID_FORMAT   = Utility.bracketWrap('%(req_info)s')
;

/**
 * @method constructor
 * @param {Tailer.Line} line
 */
function Formatter(line) {
  this.line = line;
}

module.exports = Formatter;

Formatter.prototype.isType = function Formatter$isType(type) {
  return this.line.type === type;
};

Formatter.prototype.get = function() {
  return _.reduce(arguments, function(obj, property) {
    obj[property] = this[property];

    return obj;
  }, {}, this);
};

/**
 * @property {Object} parsed
 * @readonly
 * @private
 */
Object.defineProperty(Formatter.prototype, 'parsed', {
  enumerable: false,
  get: function() {
    return this.line.parsed;
  }
});

lazy(Formatter.prototype, 'format', function() {
  return this.parsed.format;
});

lazy(Formatter.prototype, 'duration', function() {
  return sprintf(DURATION_FORMAT, this.line.duration).grey;
});

function textOrNewline(s) {
  return s || '\n';
}

lazy(Formatter.prototype, 'message', function() {
  /*
  var wrapped_lines = wrap(this.parsed.message || '').split('\n')
    , first_line    = _.first(wrapped_lines)
    , rest_lines    = indent(wrap2(_.rest(wrapped_lines).map(textOrNewline).join(' ')), 2)
    , rewrapped     = [first_line, rest_lines].join('\n')
  ;
  */

  return indent(this.parsed.message || '', 2).yellow;
});

lazy(Formatter.prototype, 'method', function() {
  return this.isType('request') ? this.parsed.method.bold : '';
});

lazy(Formatter.prototype, 'other_params', function() {
  return formatObj(_.omit(this.parsed, 'duration', 'request_id', 'message'));
});

lazy(Formatter.prototype, 'path', function() {
  return focusValue(this.parsed.path);
});

lazy(Formatter.prototype, 'prefix', function() {
  var prefix = sprintf(PREFIX_FORMAT, this.get('duration', 'type'));

  if (this.line.isJSON) {
    prefix += sprintf(REQ_ID_FORMAT, this.get('req_info'));
  }

  return prefix;
});

lazy(Formatter.prototype, 'req_info', function() {
  return (this.line.request_id || _.uniqueId('non-request ')).cyan.dim;
});

lazy(Formatter.prototype, 'request_params', function() {
  return formatObj(this.parsed.params);
});

lazy(Formatter.prototype, 'solr_params', function() {
  return formatObj(this.parsed.parameters);
});

lazy(Formatter.prototype, 'sql', function() {
  return this.isType('sql') ? focusValue(this.parsed.sql) : '';
});

lazy(Formatter.prototype, 'status_code', function() {
  var status = this.parsed.status >>> 0;

  if (status >= 200 && status < 300) {
    return status.toString().green;
  } else if (status >= 300 && status < 400) {
    return status.toString().magenta;
  } else if (status > 0) {
    return status.toString().red;
  } else {
    return status.toString().white.bgRed;
  }
});

lazy(Formatter.prototype, 'type', function() {
  return sprintf(TYPE_FORMAT, this.line.type.toUpperCase()).magenta;
});

/**
 * @static
 * @private
 * @param {String} text
 * @return {String}
 */
function focusValue(text) {
  return text.cyan;
}

/**
 * @static
 * @private
 * @param {Object} obj
 * @return {String}
 */
function formatObj(obj) {
  var formatted = util.inspect(obj, { colors: true });

  if (!!~formatted.indexOf('\n')) {
    formatted = '\n' + indent(formatted, 2);
  }

  return formatted.dim;
}
