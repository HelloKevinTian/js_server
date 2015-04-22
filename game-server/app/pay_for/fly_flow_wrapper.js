/**
 * Created by King Lee on 2014/10/14.
 */
var redis_fly_flow_wrapper = require('../nosql/redis_fly_flow_wrapper');

var fly_flow_wrapper = function() {

};

fly_flow_wrapper.prototype.get = function(orderid,cb){
    redis_fly_flow_wrapper.get(orderid,cb);
};

module.exports = fly_flow_wrapper;