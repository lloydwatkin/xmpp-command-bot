'use strict';

var xmpp = require('node-xmpp-server').C2SServer

var runTests = function() {

    console.log('running tests')
    require('../index')
    
}

var c2s = new xmpp({
    port: 5555,
    domain: 'localhost'
})

c2s.on('connect', function(client) {
    c2s.on('register', function(opts, cb) {
        cb(true)
    })
    client.on('authenticate', function(opts, cb) {
        cb(null, opts)
    })
})
runTests()

