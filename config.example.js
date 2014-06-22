module.exports = {
    
    xmpp: {
        connection: {
            jid: 'lloyd@localhost',
            password: 'password',
            port: 5555
        }
    },
    
    commands: {
        'uptime': {
            command: 'uptime',
            reply: true,
            description: 'Find uptime of server'
        },
        'ls': {
            command: 'ls',
            arguments: true,
            reply: true,
            description: 'Get a directory listing'
        },
        'test': {
            command: 'npm test',
            reply: false,
            description: 'Run the tests'
        }   
    }
    
}