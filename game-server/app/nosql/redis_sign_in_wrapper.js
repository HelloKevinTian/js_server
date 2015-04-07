/**
 * Created by King Lee on 2014/12/12.
 */
var redis_pools = require("../nosql/redis_pools");
var h_sign_in = 'h_sign_in';

var sign_in_wrapper = module.exports;

sign_in_wrapper.set = function(device_guid,sign_total){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_sign_in,device_guid,JSON.stringify({last_sign_time:Date.now(),sign_total:sign_total}),function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

sign_in_wrapper.get = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_sign_in,device_guid,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};