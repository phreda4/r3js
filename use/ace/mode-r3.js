define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var ForthHighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
      'start': [ { include: '#forth' } ],
      '#comment':
       [ { token: 'comment',
           regex: /(?:^|\s)(\|.*$)/,
           comment: 'comments for r3' }
          ],

      '#forth':
       [
         { include: '#comment' },
         { include: '#string' },
         { include: '#include' },
         { include: '#variable' },
         { include: '#def' },
         { include: '#dir' },
         { include: '#keyword' },
         { include: '#word' },
         { include: '#$nro' },
         { include: '#%nro' },
         { include: '#nro' },
       ],
      '#string':
       [ { token: 'string.double',
           regex: /((^|\s)".*")/,
           caseInsensitive: true}],
      '#include':
       [ { token: 'markup.underline.link',
           regex: /(^\^.*$)/,
           caseInsensitive: true}],
      '#variable':
       [ { token: 'variable.other',
           regex: /(#[^\s]+)/,
           caseInsensitive: true}],
      '#def':
       [ { token: 'storage.type',
           regex: /((:|#)[^\s]+)/,
           caseInsensitive: true}],
      '#dir':
       [ { token: 'entity.name.function',
           regex: /('[^\s]+)/,
           caseInsensitive: true}],
      '#nro':
       [ { token: 'constant.numeric',
           regex: /(?:\s)([0-9,a-f]+)/,
           caseInsensitive: true}],
      '#$nro':
       [ { token: 'constant.numeric.$',
           regex: /(?:\s)(\$[0-9,a-f]+)/,
           caseInsensitive: true}],
      '#keyword':
       [ { token: 'keyword',
           regex: /(?:^|\s)([\(\)\[\]]|drop|dup|and|swap|0\?|1\?|<<|>>|!|;)/,
           caseInsensitive: true}],
      '#word':
       [ { token: 'markup.bold',
           regex: /(?:\s)([^\s]+)/,
           caseInsensitive: true}]
       };

    this.normalizeRules();
};

ForthHighlightRules.metaData = { fileTypes: [ 'r3' ],
      foldingStartMarker: '/\\\\|\\{\\s*$',
      foldingStopMarker: '\\\\/|^\\s*\\}',
      keyEquivalent: '^~F',
      name: 'Forth',
      scopeName: 'source.forth' };


oop.inherits(ForthHighlightRules, TextHighlightRules);

exports.ForthHighlightRules = ForthHighlightRules;
});