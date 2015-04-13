/**
 * Created by King Lee on 2014/7/21.
 */
var redis_pools = require("../nosql/redis_pools");
var pomelo = require('pomelo');
var h_statistics = 'h_statistics';

var redis_h_statistics_wrapper = module.exports;

redis_h_statistics_wrapper.set = function(key,value){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_statistics,key,value,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

redis_h_statistics_wrapper.statistics_device = function(device_guid){
    var date = new Date();
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_statistics + "_device:" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(),device_guid,device_guid,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

redis_h_statistics_wrapper.get_redis_count_statistics = function(){
    return redis_pools.get_redis_count_statistics();
};

redis_h_statistics_wrapper.reset_redis_count_statistics = function(){
    return redis_pools.reset_redis_count_statistics();
};

