'use strict';

var configFile = './config'
if ('testing' === process.env.NODE_ENV) {
    configFile = './config.example'
}
    
var config = require(configFile)
  , Xmpp = require('./lib/xmpp')

if (config.xmpp) {
    var xmpp = new Xmpp(config)
}