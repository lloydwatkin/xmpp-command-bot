'use strict';

var exec = require('child_process').exec
  , debug = require('debug')('commander')

var Commander = function(config) {
   if ((typeof config !== 'object') ||
       (Object.keys(config).length === 0)) {
       throw new Error(this.NO_COMMANDS_DEFINED)
   }
   this.config = config
   this.config.help = {
        arguments: true ,
        summary: 'Returns command help information',
        description: 'help {command-name} to get detailed information'
   }
}

Commander.prototype.NO_COMMANDS_DEFINED = 'No commands defined'
Commander.prototype.COMMAND_NOT_FOUND = 'ERROR: Command not found'
Commander.prototype.HELP_COMMAND_NOT_FOUND = 'ERROR: Can not ' +
    'provide help on  unsupported command'
Commander.prototype.BAD_ARGUMENTS = 'ERROR: Arguments provided are not valid'

Commander.prototype.SUCCESS = 'SUCCESS: Process run successfully\n'
Commander.prototype.STOPPED = 'Process killed with'
Commander.prototype.ERROR = 'ERROR: Error output was generated\n'

Commander.prototype.handle = function(command, callback) {
    if (false === this._matchCommand(command))
        return callback(this.COMMAND_NOT_FOUND)
    if (false === this._hasValidArguments()) 
        return callback(this.BAD_ARGUMENTS)
    var self = this
    var execCommand = this.command
    if ('help' === this.command)
        return this._handleHelpRequest(callback)
    if (this.arguments) execCommand += ' ' + this.arguments
    exec(execCommand, this.config.options, function(error, stdout, stderr) {
        if (!self.config[self.command].reply) return callback()
        if (error) return callback(
            self.STOPPED + ' ' + error.signal
        )
        if (stderr) return callback(
            self.ERROR + stderr.toString()
        )
        callback(self.SUCCESS + stdout.toString())
    })
}

Commander.prototype._handleHelpRequest = function(callback) {
    var response = []

    if (this.arguments) {
        return this._handleDetailedHelpRequest(callback)   
    }
    Object.keys(this.config).forEach(function(key) {
        var message = key + ':\n\t- ' + this.config[key].summary
        response.push(message)
    }, this)
    var detailed = '\n\nFor detailed information try: help {command-name}'
    callback(response.join('\n') + detailed)
}

Commander.prototype._handleDetailedHelpRequest = function(callback) {
    if (false === this._matchCommand(this.arguments)) {
        return callback(this.HELP_COMMAND_NOT_FOUND)
    }
    var help = this.config[this.command].description ||
        this.config[this.command].summary
    callback(this.command + ':\n\n' + help)
}

Commander.prototype._hasValidArguments = function() {
    var args = this.config[this.command].arguments
    if (!args) return true
    switch (typeof args) {
        case 'boolean':
            return true
        case 'object':
            if (!this.arguments || !this.arguments.match(args)) {
                debug('Rejecting regex match due to bad arguments')
                return false
            }
            return true
        case 'function':
            this.arguments = args(this.arguments)
            if (!this.arguments) return false
            return true
    }
}

Commander.prototype._matchCommand = function(command) {
    this.command = null
    Object.keys(this.config).some(function(defined) {
        var matcher = new RegExp('^' + defined + '$', 'i')
        if (this.config[defined].arguments)
            matcher = new RegExp('^' + defined + ' ?(.*)', 'i')
        var matches = command.trim().match(matcher)
        if (null === matches) return false
        if (this.config[defined].arguments) {
            this.arguments = matches[1]
        }
        debug('Command matched: ' + defined)
        debug('Arguments: ' + this.arguments)
        this.command = defined
        return true
    }, this)
    var help = command.match(/^help(.*)/i)
    if (help) {
        this.command = 'help'
        return true   
    }
    
    if (!this.command) return false
    return true
}

module.exports = Commander