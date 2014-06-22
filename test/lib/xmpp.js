'use strict';

var proxyquire = require('proxyquire')
  , Events = require('events').EventEmitter
  , ltx = require('node-xmpp-core').ltx

require('should')

Events.prototype.send = function(stanza) {
    this.emit('send', stanza.root())
}

var Xmpp = proxyquire('../../lib/xmpp', { 'node-xmpp-client': Events })

/*jshint -W030 */
describe('Xmpp', function() {
  
    describe('Connecting', function() {
      
        it('Throws exception when can not connect', function(done) {
            var xmpp = null
            try {
                xmpp = new Xmpp({ xmpp: { connection: {} } })
                xmpp.getClient().emit('error', 'could not connect')
            } catch (e) {
                e.message.should.equal(xmpp.COULD_NOT_CONNECT)
                done()
            }
        })
        
        it('Uses a different error after connecting', function(done) {
            var xmpp = null
            try {
                xmpp = new Xmpp({ xmpp: { connection: {} } })
                xmpp.getClient().emit('online')
                xmpp.getClient().emit('error', 'could not connect')
            } catch (e) {
                e.message.should.equal(xmpp.SERVER_WENT_AWAY)
                done()
            }
        })
        
    })
    
    describe('Joining MUC', function() {
        
        var joinError = ltx.parse('<presence ' +
           'from="chat@localhost" ' +
           'id="273hs51g" ' +
           'to="hag66@shakespeare.lit/pda" ' +
           'type="error">' +
           '<error by="coven@chat.shakespeare.lit" type="modify">' +
            '<jid-malformed xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>' +
            '</error></presence>') 

        var botLeave = ltx.parse('<presence ' +
           'from="chat@localhost" ' +
           'id="273hs51g" ' +
           'to="hag66@shakespeare.lit/pda" ' +
           'type="unavailable"/>') 
        
        it('Errors if no room provided', function(done) {
            var xmpp = null
            try {
                xmpp = new Xmpp({
                    xmpp: {
                        connection: {},
                        muc: {
                            server: 'localhost',
                            nick: 'commander'
                        }
                    }
                })
                xmpp.getClient().emit('online')
            } catch (e) {
                e.message.should.equal(xmpp.MUC_MISSING_ROOM)
                done()
            }
        })
        
        it('Errors if no server provided', function(done) {
            var xmpp = null
            try {
                xmpp = new Xmpp({
                    xmpp: {
                        connection: {},
                        muc: {
                            room: 'test',
                            nick: 'commander'
                        }
                    }
                })
                xmpp.getClient().emit('online')
            } catch (e) {
                e.message.should.equal(xmpp.MUC_MISSING_SERVER)
                done()
            }
        })
        
        it('Errors if no nick provided', function(done) {
            var xmpp = null
            try {
                xmpp = new Xmpp({
                    xmpp: {
                        connection: {},
                        muc: {
                            room: 'test',
                            server: 'localhost'
                        }
                    }
                })
                xmpp.getClient().emit('online')
            } catch (e) {
                e.message.should.equal(xmpp.MUC_MISSING_NICK)
                done()
            }
        })
        
        it('Attempts to join a MUC', function(done) {
            var xmpp = new Xmpp({
                xmpp: {
                    connection: {},
                    muc: {
                        room: 'chat',
                        server: 'localhost',
                        nick: 'commander'
                    }
                }
            })
            xmpp.getClient().on('send', function(stanza) {
                stanza.is('presence').should.be.true
                stanza.attrs.to
                    .should.equal('chat@localhost/commander')
                 done()
            })
            xmpp.getClient().emit('online')
        })
        
        it('Attempts to join MUC with password', function(done) {
            var xmpp = new Xmpp({
                xmpp: {
                    connection: {},
                    muc: {
                        room: 'chat',
                        server: 'localhost',
                        nick: 'commander',
                        password: 'letmein'
                    }
                }
            })
            xmpp.getClient().on('send', function(stanza) {
                stanza.is('presence').should.be.true
                stanza.attrs.to
                    .should.equal('chat@localhost/commander')
                stanza.getChild('x', xmpp.NS_MUC)
                    .getChildText('password')
                    .should.equal('letmein')
                 done()
            })
            xmpp.getClient().emit('online')
        })
        
        it('Handles unsuccessful join', function(done) {
            var xmpp = new Xmpp({
                xmpp: {
                    connection: {},
                    muc: {
                        room: 'chat',
                        server: 'localhost',
                        nick: 'commander',
                        password: 'letmein'
                    }
                }
            })
            var sendError = function() {
                try {
                    xmpp.getClient().emit('stanza', joinError)
                } catch (e) {
                    e.message.should.containEql(xmpp.MUC_JOIN_FAIL)
                    e.message.should.containEql('jid-malformed')
                    done()
                }
            }
            xmpp.getClient().on('send', function(stanza) {
                stanza.is('presence').should.be.true
                stanza.attrs.to
                    .should.equal('chat@localhost/commander')
                stanza.getChild('x', xmpp.NS_MUC)
                    .getChildText('password')
                    .should.equal('letmein')
                sendError()
            })
            xmpp.getClient().emit('online')
        })
        
        it('Ignores messages from other rooms', function(done) {
            var xmpp = new Xmpp({
                xmpp: {
                    connection: {},
                    muc: {
                        room: 'chat',
                        server: 'localhost',
                        nick: 'commander',
                        password: 'letmein'
                    }
                }
            })
            var sendError = function() {
                try {
                    joinError.attrs.from = 'chat@domain'
                    xmpp.getClient().emit('stanza', joinError)
                    done()
                } catch (e) {
                    e.message.should.containEql(xmpp.MUC_JOIN_FAIL)
                    e.message.should.containEql('jid-malformed')
                    done('Should not have thrown exception')
                }
            }
            xmpp.getClient().on('send', function(stanza) {
                stanza.is('presence').should.be.true
                stanza.attrs.to
                    .should.equal('chat@localhost/commander')
                stanza.getChild('x', xmpp.NS_MUC)
                    .getChildText('password')
                    .should.equal('letmein')
                sendError()
            })
            xmpp.getClient().emit('online')
        })
        
        
        it('Errors when bot leaves room', function(done) {
            var xmpp = new Xmpp({
                xmpp: {
                    connection: {},
                    muc: {
                        room: 'chat',
                        server: 'localhost',
                        nick: 'commander',
                        password: 'letmein'
                    }
                }
            })
            var sendError = function() {
                try {
                    xmpp.getClient().emit('stanza', botLeave)
                } catch (e) {
                    e.message.should.containEql(xmpp.MUC_BOT_LEFT)
                    done()
                }
            }
            xmpp.getClient().on('send', function(stanza) {
                stanza.is('presence').should.be.true
                stanza.attrs.to
                    .should.equal('chat@localhost/commander')
                stanza.getChild('x', xmpp.NS_MUC)
                    .getChildText('password')
                    .should.equal('letmein')
                sendError()
            })
            xmpp.getClient().emit('online')
        })
        
    })
})