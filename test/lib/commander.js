'use strict';

var proxyquire = require('proxyquire')
  , should = require('should')

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
        arguments: /^[a-z0-9]*$/i,
        summary: 'regex arguments summary'
    },
    'function arguments': {
        command: 'function-arguments',
        arguments: function() {
            return false   
        },
        summary: 'function arguments summary',
        options: { timeout: 2000 }
    },
    'passing function arguments': {
        command: 'passing-function-arguments',
        arguments: function(args) {
            args.should.equal('ok?')
            args = 'this is a string'
            return args   
        },
        reply: true,
        summary: 'function arguments summary',
        options: { timeout: 2000 }
    },
    'killed': {
        command: 'killed',
        summary: 'Killed summary',
        reply: true
    },
    'error': {
        command: 'error',
        summary: 'Will error',
        reply: true
    }
}

var childProcess = {
    exec: function(command, options, callback) {
        /* error, stdout, stderr */
        if ('killed' === command) {
            return callback({ signal: 'SIGTERM' })   
        }
        if ('error' === command) {
            return callback(null, null, config[command].command)
        }
        if (-1 !== command.indexOf('passing function arguments')) {
            return callback(null, command)
        }
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
    
        it('Should return help if asked to', function(done) {
            var commander = new Commander(config)
            commander.handle('help', function(response) {
                response.split('\n').length.should.equal(18)
                done()
            })
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

        it('Should run command with error return', function(done) {
            commander.handle('error', function(message) {
                message.should.equal(
                    commander.ERROR + config.error.command
                )  
                done()
            })
        })
        
        it('Should run command and report killed', function(done) {
            commander.handle('killed', function(message) {
                message.should.equal(
                    commander.STOPPED + ' SIGTERM'
                )  
                done()
            })
        })
        
        it('Should run command without return', function(done) {
            commander.handle('blanket arguments', function(message) {
                should.not.exist(message) 
                done()
            })
        })
        
        it('Should reject command with bad regex arguments', function(done) {
            commander.handle('regex arguments hell-o', function(message) {
                message.should.equal(commander.BAD_ARGUMENTS)
                done()
            })
        })
        
        it('Should reject command with bad function arguments', function(done) {
            commander.handle('function arguments', function(message) {
                message.should.equal(commander.BAD_ARGUMENTS)
                done()
            })
        })
        
        it('Allows functional argument matching to rewrite arguments', function(done) {
            commander.handle('passing function arguments ok?', function(message) {
                message.should.equal(
                    commander.SUCCESS +
                    'passing function arguments' +
                    ' this is a string'
                )
                done()
            })
        })
        
    })
    
})