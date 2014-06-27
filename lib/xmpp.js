'use strict';

var Client = require('node-xmpp-client')
  , JID = require('node-xmpp-core').JID
  , debug = require('debug')('xmpp')
  , ltx = require('node-xmpp-core').ltx
  , Commander = require('./commander')

var Xmpp = function(config) {
    this.config = config
    this.initialize()
}

Xmpp.prototype.COULD_NOT_CONNECT = 'Could not connect'
Xmpp.prototype.SERVER_WENT_AWAY = 'XMPP server went away'

Xmpp.prototype.MUC_MISSING_ROOM = 'Missing MUC "room" config'
Xmpp.prototype.MUC_MISSING_SERVER = 'Missing MUC "server" config'
Xmpp.prototype.MUC_MISSING_NICK = 'Missing MUC "nick" config'
Xmpp.prototype.MUC_BOT_LEFT = 'Bot has left the MUC'
Xmpp.prototype.MUC_JOIN_FAIL = 'Failed to join chat room'

Xmpp.prototype.PERMISSION_DENIED = 'You do not have ' +
    'permission to run commands'

Xmpp.prototype.NS_MUC = 'http://jabber.org/protocol/muc'
Xmpp.prototype.NS_MUC_USER = 'http://jabber.org/protocol/muc#user'

Xmpp.prototype.getClient = function() {
    return this.client
}

Xmpp.prototype.getCommander = function() {
    return this.commander
}

Xmpp.prototype.initialize = function() {
    this.client = new Client(this.config.xmpp.connection)
    this.commander = new Commander(this.config.commands)
    this.online = false
    var self = this
    this.client.on('online', function() {
        self.online = true
        debug('XMPP connection established')
        if (self.config.xmpp.muc) self._joinRoom()
        self._sendPresence()
    })

    this.client.on('error', function(error) {
        var message = self.online ? 
            self.SERVER_WENT_AWAY : self.COULD_NOT_CONNECT
        debug(message)
        debug(error)
        throw new Error(message)
    })

    this.client.on('stanza', function(stanza) {
        switch (stanza.getName()) {
            case 'chat':
                self._handleChat(stanza)
                break
            case 'presence':
                self._handlePresence(stanza)
                break
        }
    })
}

Xmpp.prototype._joinRoom = function() {
    if (!this.config.xmpp.muc.room)
        throw new Error(this.MUC_MISSING_ROOM)
    if (!this.config.xmpp.muc.server)
        throw new Error(this.MUC_MISSING_SERVER)
    if (!this.config.xmpp.muc.nick)
        throw new Error(this.MUC_MISSING_NICK)
    var to = this.config.xmpp.muc.room + '@' +
        this.config.xmpp.muc.server + '/' +
        this.config.xmpp.muc.nick
    var stanza = new ltx.Element('presence', { to: to })
    if (this.config.xmpp.muc.password) {
        stanza.c('x', { xmlns: this.NS_MUC })
            .c('password')
            .t(this.config.xmpp.muc.password)
    }
    this.client.send(stanza)   
}

Xmpp.prototype._isChatRoom = function(from) {
    if (!this.config.xmpp.muc) return false
    var room = this.config.xmpp.muc.room +
        '@' +
        this.config.xmpp.muc.server
    return (room === from.bare().toString())
}

Xmpp.prototype._handlePresence = function(stanza) {
    if (stanza.attrs.type === 'subscribe')
        return this._handlePresenceSubscription(stanza)
    if (false === this._isChatRoom(new JID(stanza.attrs.from))) return
    var x = stanza.getChild('x', this.NS_MUC_USER)
    if (x) {
        var status = x.getChild('status')
        if (status && status.attrs.code && status.attrs.code === '110') {
            debug('Sucessfully joined MUC')
            return
        }
    }
    if (stanza.attrs.type === 'unavailable') {
        debug('Bot has left the room')
        throw new Error(this.MUC_BOT_LEFT)
    }
    if (stanza.attrs.type === 'error') {
        debug('Error joining muc')
        var error = stanza.getChild('error').children[0].getName()
        throw new Error(this.MUC_JOIN_FAIL + ' "' + error + '"')
    }
}

Xmpp.prototype._handleChat = function(stanza) {
    var self = this
      , from = new JID(stanza.attrs.from)
      , body = stanza.getChildText('body').trim()
      , type = 'chat'
    if (true === this._isChatRoom(from)) {
        var regex = new RegExp(
            '^' + this.config.xmpp.muc.nick + ': (.*)',
            'i'
        )
        var match = body.match(regex)
        if (!match) return /* Message is not for us */
        body = match[1]
        if ('groupchat' === stanza.attrs.type) {
            type = stanza.attrs.type
            from = from.bare()
        }
    } else if (false === this._checkIsAllowed(from, stanza)) {
        return
    }
    this.commander.handle(body, function(message) {
        if (!message) return /* No response expected */
        var attrs = stanza.root().attrs
        attrs.type = type
        delete attrs.from
        attrs.to = from
        var response = new ltx.Element('chat', attrs)
        response.c('body').t(message)
        self.client.send(response)
    })
}

Xmpp.prototype._checkIsAllowed = function(from, stanza) {
    
    var allowedUser = false
    this.config.xmpp.admins.forEach(function(admin) {
        switch (typeof admin) {
            case 'string':
                if (from.bare().toString() === admin)
                    allowedUser = true
                break
            case 'object':
                if (from.bare().toString().match(admin))
                    allowedUser = true
                break
            case 'function':
                if (true === admin(stanza, this))
                    allowedUser = true
                break
        }
    }, this)
    if (true === allowedUser) return true
    var attrs = stanza.root().attrs
    var toJid = (stanza.root().attrs.to || '').toString()
    var fromJid = stanza.root().attrs.from.toString()
    if (toJid) attrs.from = toJid
    attrs.to = fromJid
    var denied = new ltx.Element('chat', attrs)
    denied.c('body').t(this.PERMISSION_DENIED)
    this.client.send(denied)
    return false
}

Xmpp.prototype._handlePresenceSubscription = function(stanza) {
    var to = new JID(stanza.attrs.from)
    var outgoing = new ltx.Element(
        'presence',
        { to: to.bare().toString(), type: 'subscribed' }
    )
    this.client.send(outgoing)
}    

Xmpp.prototype._sendPresence = function() {
    var stanza = new ltx.Element('presence').c('show').t('chat')
    this.client.send(stanza)
}

Xmpp.prototype.send = function() {
    
}

module.exports = Xmpp