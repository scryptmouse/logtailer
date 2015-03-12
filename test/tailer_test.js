'use strict';

var Tailer  = require('../lib/tailer.js')
  , fs      = require('fs')
  , _       = require('lodash')
;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var LINE_COUNT = fs.readFileSync(__filename, 'utf8').split('\n').length - 1;

exports['initialization'] = {
  setUp: function(done) {
    // setup here
    done();
  },

  'no filename': function(test) {
    test.expect(1);

    test.throws(function() {
      var tailer = new Tailer([]);

      tailer.start();
    }, 'throws with no filename');

    test.done();
  },

  'calls correctly': function(test) {
    var call_count  = 0
      , log_count   = 0
      , err_count   = 0
      , tailer      = new Tailer([null, null, __filename])
      , counted     = null
    ;

    test.expect(3);

    counted = _.after(LINE_COUNT, function() {
      test.equal(err_count, 0, 'should have never called an error');
      test.equal(log_count, 1, 'should have called log once');
      test.equal(call_count, LINE_COUNT, 'should have called for each line');
      tailer.tail.unwatch();
      test.done();
    });

    tailer.log = function() {
      log_count += 1;
    };

    tailer.onLine = function(data) {
      call_count += 1;
      counted();
    };

    tailer.onTailError = function(err) {
      err_count += 1;
    };

    tailer.start();
  },

  'on an unknown file': function(test) {
    var tailer = new Tailer([null, null, __dirname + '/nonexistent.js']);

    test.expect(1);

    test.throws(function() {
      tailer.start();
    }, 'cannot find the file');

    test.done();
  }
};
