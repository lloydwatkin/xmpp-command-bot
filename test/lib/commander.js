'use strict';

var proxyquire = require('proxyquire')

var config = {
    'with-reply': {
        command: 'with-reply-command',
        reply: true,
        summary: 'With reply summary',
        description: 'A longer description'
    },
    'blanket arguments': {
        command: 'blanket-arguments',
        arguments: true,
        summary: 'blanket arguments summary'
    },
    'regex arguments': {
        command: 'regex-arguments',
        arguments: /[a-z0-9]*/i,
        summary: 'egex arguments summary'
    },
    'function arguments': {
        command: 'function-arguments',
        arguments: function(args) {
            return args   
        },
        summary: 'function arguments summary'

    }
    }
var childProcess = {
    exec: function(command, options, callback) {
        /* error, stdout, stderr */
        callback(null, config[command].command)
    }
}
        
var Commander = proxyquire(
    '../../lib/commander', { 'child_process': childProcess }
)

describe('Commander', function() {
  
    var commander = null
    
    beforeEach(function() {
        commander = new Commander(config)
    })
    
    it('Throws error if no commands defined', function(done) {
        var commander = null
        try {
            commander = new Commander({})  
            done('Should have thrown exception')
        } catch (e) {
            e.message
                .should.equal(Commander.prototype.NO_COMMANDS_DEFINED)
            done()
        }
    })
    
    describe('Help', function() {
    
        it.skip('Should return help if asked to', function() {
            
        })
        
        it.skip('Should return detailed help if available', function() {
            
        })
        
        it.skip('Should return summary if detailed message not available', function() {
            
        })
        
        it.skip('Should return error message if command does not exist', function() {
            
        })
        
    })
    
    describe('Commands', function() {
        
        it('Should return error message if command not defined', function(done) {
            commander.handle('not found', function(message) {
                message.should.equal(commander.COMMAND_NOT_FOUND) 
                done()
            })
        })
        
        it('Should run command with return', function(done) {
            commander.handle('with-reply', function(message) {
                message.should.equal(
                    commander.SUCCESS + config['with-reply'].command
                )  
                done()
            })
        })
        
        it.skip('Should run command and return error', function() {
            
        })
        
        it.skip('Should run command without return', function() {
            
        })
        
        it.skip('Should reject command with bad arguments', function() {
            
        })
        
    })
    
})