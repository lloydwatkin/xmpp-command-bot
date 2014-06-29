xmpp-command-bot
==================

__Note: Not currently working, development in progress.__

An XMPP bot which takes messages from a chat room or a prescribed set of users and runs commands on the local server.

Build status: [![Build Status](https://travis-ci.org/lloydwatkin/xmpp-command-bot.svg?branch=master)](https://travis-ci.org/lloydwatkin/xmpp-command-bot)

# Setup

Copy `config.example.js` to `config.js` and modify as required.

## XMPP Connection

An example XMPP configuration object is as follows:

```javascript
{
    xmpp: {
        connection: {
            jid: 'bot@localhost',
            password: 'mysecretpassword'
        },
        muc: {
            room: 'chat',
            server: 'localhost',
            nick: 'commander',
            password: 'letmein'
        },
        admins: [
            'fail@localhost',
            /lloyd@[^localhost]/,
            function(stanza, context) {
                return true
            }
        ]
    }
}
```

The connection key contains details for the bot to connect to the XMPP server. These values are passed directly to the constructor of the [node-xmpp-client](http://node-xmpp.github.io/doc/nodexmppclient.html). For more connection choices please see the linked manual.

### Setting allowed users

Using the `admin` key within `xmpp` section of the configuration to set what XMPP JIDs can make requests to the chat bot. There are three methods by which you can define allowed JIDs:

- bare JID match
- regular expression match
- function match

The admin matching methods are called in order, if any of the methods provide a match then the command will be accepted.

#### Bare JID match

The bare JID of the sender is compared to the provided values.

#### Regular Expression match

The bare JID of the sender is compared to the provided value using a regular expression match.

#### Function match

The original stanza is passed to your provided function, return true or false in order tell the bot whether to accept this request.

### Connecting to a chat room

By providing details under the `muc` key. The minimum keys are '__room__', '__server__', and '__nick__' (nickname).  If the room is password protected then adding the password to the '__password__' key will allo you to connect.

## Adding commands

TBA

# Upstart script

There is an upstart script located in `contrib/xmpp-command-bot.conf`. Copy this to `/etc/init/` then run:

```
sudo service xmpp-command-bot start
```

The script is set up to run out of `/usr/share/xmpp-command-bot` and as the user `xmpp`.

# Testing 

```
npm test
```

## Debugging

```
DEBUG=* node index
```

Various values for debug can be used, currently the following are supported:

- xmpp
- commander

# Licence 

MIT
