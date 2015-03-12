/**
 * @class Tailer.Line
 */
'use strict';

var Utility   = require('./utility')
  , Formatter = require('./formatter')
  , lazy      = require('lazy-property')
  , colors    = require('colors')
  , sprintf   = require('sprintf')
  , util      = require('util')
  , _         = require('lodash')
;

var TYPES = ['sql', 'solr', 'request'];

/**
 * @method constructor
 * @param {String} line
 */
function Line(line) {
  if (!(this instanceof Line)) {
    return new Line(line);
  }

  this.original = line;
  this.messages = [];

  this.formatted = new Formatter(this);

  try {
    this.parsed = JSON.parse(line);
    this.isJSON = true;
  } catch(err) {
    this.type       = 'raw';
    this.parsed     = {};
    this.parseError = err;
    this.isJSON     = false;
  }

  this._generateMessages();
}

module.exports = Line;

lazy(Line.prototype, 'duration', function() {
  return this.parsed.duration || 0.0;
});

lazy(Line.prototype, 'prefix', function() {
  return this.formatted.prefix;
});

/**
 * @property {String} request_id
 * @readonly
 */
lazy(Line.prototype, 'request_id', function() {
  return this.isJSON && this.parsed.request_id;
});

/**
 * @property {String[]} tags
 * @readonly
 */
lazy(Line.prototype, 'tags', function() {
  return this.isJSON ? _.toArray(this.parsed.tags) : [];
});

/**
 * @property {String} type
 * @readonly
 */
lazy(Line.prototype, 'type', function() {
  return _.find(TYPES, function(type) {
    return _.includes(this.tags, type);
  }, this) || 'log';
});

var SQL_FORMAT  = '%(sql)s'
  , REQ_FORMAT  = '%(method)s %(path)s %(status_code)s ' + '(format: %(format)s)'.dim
  , PAR_FORMAT  = 'params: %(request_params)s'
  , SLR_FORMAT  = 'path: %(path)s parameters: %(solr_params)s'
  , MSG_FORMAT  = '\n%(message)s'
  , OBJ_FORMAT  = 'params: %(other_params)s'
;

Line.prototype._generateMessages = function Line$_generateMessages() {
  switch (this.type) {
    case 'sql':
      this._addMessage(SQL_FORMAT, { sql: this.formatted.sql });
      break;
    case 'request':
      this._addMessage(REQ_FORMAT, this.formatted.get('format', 'path', 'method', 'status_code'));

      if (!_.isEmpty(this.parsed.params)) {
        this._addMessage(PAR_FORMAT, this.formatted.get('request_params'));
      }

      break;
    case 'solr':
      this._addMessage(SLR_FORMAT, this.formatted.get('path', 'solr_params'));
      break;
    case 'raw':
      this._addMessage(MSG_FORMAT, { message: this.original });
      break;
    default:
      if (this.parsed.message) {
        this._addMessage(MSG_FORMAT, this.formatted.get('message'));
      }

      this._addMessage(OBJ_FORMAT, this.formatted.get('other_params'));
  }
};

Line.prototype._addMessage = function Line$_addMessage(format, params) {
  var full_format = '%(prefix)s ' + format;

  _.defaults(params, {
    prefix: this.prefix
  });

  this.messages.push(sprintf(full_format, params));
};

Line.prototype.toString = function Line$toString() {
  return this.messages.join('\n');
};
