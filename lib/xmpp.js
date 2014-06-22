'use strict';

var Client = require('node-xmpp-client')
  , JID = require('node-xmpp-core').JID
  , debug = require('debug')('xmpp')

var Xmpp = function(config) {
    this.config = config
    this.initialize()
}

Xmpp.prototype.COULD_NOT_CONNECT = 'Could not connect'
Xmpp.prototype.SERVER_WENT_AWAY = 'XMPP server went away'

Xmpp.prototype.getClient = function() {
    return this.client
}

Xmpp.prototype.initialize = function() {
    this.client = new Client(this.config.xmpp.connection)
    this.online = false
    var self = this
    this.client.on('online', function() {
        self.online = true
        debug('XMPP connection established'.green)
    })

    this.client.on('error', function(error) {
        var message = self.online ? 
            self.SERVER_WENT_AWAY : self.COULD_NOT_CONNECT
        debug(message)
        debug(error)
        throw new Error(message)
    })

    this.client.on('stanza', function(stanza) {
        if (true === stanza.is('chat')) {
            self._handleChat(stanza)
        }
    })
}

Xmpp.prototype._isChatRoom = function(from) {
    return (this.config.xmpp.chat.room === from.bare().toString())
}

Xmpp.prototype._handleChat = function(stanza) {
    var from = new JID(stanza.attrs.from)
    var body = stanza.getChildText('body').trim()
    if (true === this._isChatRoom(from)) {
        var regex = new RegExp(
            '/^' + this.config.xmpp.chat.nick + ': (.*)/',
            'i'
        )
        var match = body.match(regex)
        if (!match) return /* Message is not for us */
        body = match[1]
        from = new JID(from.toBareJID())
    }  
}

Xmpp.prototype.send = function() {
    
}

module.exports = Xmpp