xmpp-command-bot
==================

__Note: Not currently working, development in progress.__

An XMPP bot which takes messages from a chat room or a prescribed set of users and runs commands on the local server.

Build status: [![Build Status](https://travis-ci.org/lloydwatkin/xmpp-command-bot.svg?branch=master)](https://travis-ci.org/lloydwatkin/xmpp-command-bot)

# Setup

Copy `config.example.js` to `config.js` and modify as required.

## XMPP Connection

TBA

## Setting allowed users

TBA

## Connecting to a chat room

TBA

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
