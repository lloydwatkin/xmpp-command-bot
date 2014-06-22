'use strict';

var config = require('./config')
  , Xmpp = require('./lib/xmpp')
require('colours')

if (config.xmpp) {
    var xmpp = new Xmpp(config)
}