/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ Date 	2015-04-03
 */

var redis_pools = require("../nosql/redis_pools");
var h_special_prize_flag = 'h_special_prize_flag';

var special_prize_flag = module.exports;

special_prize_flag.set = function(device_guid,count_index){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_special_prize_flag,device_guid,count_index,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

special_prize_flag.get = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_special_prize_flag,device_guid,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};
