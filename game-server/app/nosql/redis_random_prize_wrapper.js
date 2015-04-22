/**
 * Created by King Lee on 2014/9/16.
 */
var redis_pools = require("../nosql/redis_pools");
var h_random_prize = 'h_random_prize';

var random_prize_wrapper = module.exports;

random_prize_wrapper.set = function(device_guid,current_card){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_random_prize,device_guid,JSON.stringify({current_card:current_card}),function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

random_prize_wrapper.get = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_random_prize,device_guid,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};
