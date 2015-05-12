/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ Date 	2015-05-12
 */

var redis_pools = require("../nosql/redis_pools");
var h_entity_gacha_info = 'h_entity_gacha_info';

var entity_gacha_info = module.exports;

entity_gacha_info.set = function(time_stamp,item_type,leftnum){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_entity_gacha_info,time_stamp + "_" + item_type,leftnum,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

entity_gacha_info.get = function(time_stamp,item_type,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_entity_gacha_info,time_stamp + "_" + item_type,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};
