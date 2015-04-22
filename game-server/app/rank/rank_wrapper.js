/**
 * Created by King Lee on 2014/8/11.
 */
var redis_rank_wrapper = require('../nosql/redis_rank_wrapper');

var rank_wrapper = function() {

};

rank_wrapper.prototype.add_rank_info = function(championship_id,device_guid,race_time,rank_info,cb){
    redis_rank_wrapper.add_rank_info(championship_id,device_guid,race_time,rank_info,cb);
};

rank_wrapper.prototype.get_rank = function(championship_id,device_guid,db){
    redis_rank_wrapper.get_rank(championship_id,device_guid,db);
};

module.exports = rank_wrapper;