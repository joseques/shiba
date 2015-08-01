'use strict';

const EventEmitter =  require('events').EventEmitter;
const inherits     =  require('util').inherits;
const debug        =  require('debug')('shiba:webclient');
const debugchat    =  require('debug')('shiba:chat');

module.exports = WebClient;

function WebClient(config) {
    EventEmitter.call(this);

    // Save configuration and stuff.
    this.config = config;

    debug("Setting up connection to %s", config.WEBSERVER);
    this.socket = require('socket.io-client')(config.WEBSERVER);
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('err', this.onErr.bind(this));
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('msg', this.onMsg.bind(this));
    this.socket.on('join', this.onJoin.bind(this));
}

inherits(WebClient, EventEmitter);

WebClient.prototype.onMsg = function(msg) {
    debugchat('Msg: %s', JSON.stringify(msg));
    this.emit('msg', msg);
};

WebClient.prototype.onError = function(err) {
    console.error('webclient onError: ', err);
};

WebClient.prototype.onErr = function(err) {
    console.error('webclient onErr: ', err);
};

WebClient.prototype.onConnect = function(data) {
    debug("Web Server Connected.");

    //self.emit('webclient-connect');
    this.socket.emit('join', 'bots'); //the channel does not matter for the bots because they are broadcasted
};

//{ history: [], username: 'username', channel: 'channel' }
WebClient.prototype.onJoin = function(data) { //Ignoring the chat history
    console.log('chat joined to the channel: ', data.channel);
};

WebClient.prototype.doSay = function(line) {
    debugchat('Saying: %s', line);
    this.socket.emit('say', line, true);
};

WebClient.prototype.onDisconnect = function(data) {
    debug('Web client disconnected |', data, '|', typeof data);
    this.emit('disconnect');
};

WebClient.prototype.doMute = function(user, timespec) {
  debugchat('Muting user: %s time: %s', user, timespec);
  let line = '/mute ' + user;
  if (timespec) line = line + ' ' + timespec;
  this.socket.emit('say', line, true);
};