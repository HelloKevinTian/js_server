/**
 * Created by King Lee on 2014/12/12.
 */
var redis_sign_in_wrapper = require('../nosql/redis_sign_in_wrapper');

var sign_in_wrapper = function() {

};

sign_in_wrapper.prototype.set = function(device_guid,sign_total){
    redis_sign_in_wrapper.set(device_guid,sign_total);
};

sign_in_wrapper.prototype.get = function(device_guid,cb){
    redis_sign_in_wrapper.get(device_guid,cb);
};

module.exports = sign_in_wrapper;