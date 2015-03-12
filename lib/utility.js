/**
 * @class Tailer.Utility
 */

'use strict';

var lazy    = require('lazy-property')
  , colors  = require('colors')
  , sprintf = require('sprintf')
  , util    = require('util')
  , _       = require('lodash')
;

var Utility = module.exports = {};

var LBRACKET = Utility.LBRACKET = '['.dim
  , RBRACKET = Utility.RBRACKET = ']'.dim
;

/**
 * @param {String} s
 * @return {String}
 */
Utility.bracketWrap = function Utility_bracketWrap(s) {
  return LBRACKET + s + RBRACKET;
};
