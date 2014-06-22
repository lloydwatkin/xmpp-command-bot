'use strict';

var proxyquire = require('proxyquire')
  , Events = require('events').EventEmitter
require('should')

var Xmpp = proxyquire('../../lib/xmpp', { 'node-xmpp-client': Events })

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
})