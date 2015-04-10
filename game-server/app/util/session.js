/**
 * Created by King Lee on 2014/5/16.
 * this session just for http protocol,is a replacement of pomelo ' session.
 */
var events = require('events');
var util = require('util');

/**
 * construct function
 * @param user
 */
var session = function(){
    events.EventEmitter.call(this);
    this.settings = {};
    this.uid = null;
};

util.inherits(session, events.EventEmitter);

/**
 * Bind the session with the the uid.
 *
 * @param {Number} uid User id
 * @api public
 */
session.prototype.bind = function(uid){
    this.uid = uid;
    this.emit('bind',uid);
};

/**
 * Unbind the session with the the uid.
 *
 * @param {Number} uid User id
 * @api private
 */
session.prototype.unbind = function(uid){
    this.uid = null;
    this.emit('unbind',uid);
};

/**
 * Set value for the session.
 *
 * @param {String} key session key
 * @param {Object} value session value
 * @api public
 */
session.prototype.set = function(key, value) {
    this.settings[key] = value;
};

/**
 * Get value from the session.
 *
 * @param {String} key session key
 * @return {Object} value associated with session key
 * @api public
 */
session.prototype.get = function(key) {
    return this.settings[key];
};

module.exports = session;