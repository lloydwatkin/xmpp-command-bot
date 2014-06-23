'use strict';

var exec = require('child_process').exec

var Commander = function(config) {
   if ((typeof config !== 'object') ||
       (Object.keys(config).length === 0)) {
       throw new Error(this.NO_COMMANDS_DEFINED)
   }
   this.config = config
}

Commander.prototype.NO_COMMANDS_DEFINED = 'No commands defined'
Commander.prototype.COMMAND_NOT_FOUND = 'ERROR: Command not found'
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

Commander.prototype._hasValidArguments = function() {
    var args = this.config[this.command].arguments
    if (!args) return true
    switch (typeof args) {
        case 'boolean':
            return true
        case 'object':
            if (!this.arguments || !this.arguments.match(args)) {
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
        this.command = defined
        return true
    }, this)
    if (!this.command) return false
    return true
}

module.exports = Commander