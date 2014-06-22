'use strict';

var config = require('./config')
  , Client = require('node-xmpp-client')
  , JID = require('node-xmpp-core').JID
require('colours')

var client = new Client(config.connection)
var online = false
client.on('online', function() {
    online = true
    console.log('XMPP connection established'.green)
})

client.on('stanza', function(stanza) {
    console.log('Incoming stanza: ', stanza.toString())
})

client.on('error', function() {
    var error = online ? 'XMPP server went away'.red : 'Could not connect'.red
    console.log(error)
    process.exit(1)
})

var handleChat = function(stanza) {
    var from = new JID(stanza.attrs.from)
    var body = stanza.getChildText('body').trim()
    if (true === isChatRoom(from)) {
        var match = body.match(new RegExp('/^' + config.chat.nick + ': (.*)/', 'i'))
        if (!match) return /* Message is not for us */
        body = match[1]
        from = new JID(from.toBareJID())
    }
}

client.on('stanza', function(stanza) {
    if (true === stanza.is('chat')) {
        handleChat(stanza)
    }
})