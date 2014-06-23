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

Commander.prototype.SUCCESS = 'SUCCESS: Process run successfully\n'

Commander.prototype.handle = function(command, callback) {
    if (false === this._matchCommand(command))
        return callback(this.COMMAND_NOT_FOUND)
    var self = this
    var execCommand = this.command
    if (this.arguments) execCommand += ' ' + this.arguments
    exec(execCommand, this.config.options, function(error, stdout, stderr) {
        if (!self.config[self.command].reply) return callback()
        if (error) return callback(
            'Process killed with ' + error.signal
        )
        if (stderr) return callback(
            'ERROR: Error output was generated\n' + stderr.toString()
        )
        callback(self.SUCCESS + stdout.toString())
    })
}

Commander.prototype._matchCommand = function(command) {
    this.command = null
    Object.keys(this.config).some(function(defined) {
        var matcher = new RegExp('^' + defined + '$', 'i')
        if (this.config[defined].arguments)
            matcher = new RegExp('^' + defined + ' .*', 'i')
        if (null === command.trim().match(matcher)) return false
        this.command = defined
    }, this)
    if (!this.command) return false
    
}

module.exports = Commander