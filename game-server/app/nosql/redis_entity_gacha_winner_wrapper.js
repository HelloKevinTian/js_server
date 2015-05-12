/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ Date 	2015-05-12
 */

var redis_pools = require("../nosql/redis_pools");
var z_entity_gacha_winner = 'z_entity_gacha_winner';

var entity_gacha_winner = module.exports;

entity_gacha_winner.set = function(device_guid, value) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_entity_gacha_winner, device_guid, value, function(err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });

    // redis_pools.execute('pool_1', function(client, release) {
    //     client.zadd(z_entity_gacha_winner, time_stamp, phone_num + "_" + item_type, function(err, reply) {
    //         if (err) {
    //             //  some thing log
    //             console.error(err);
    //         }
    //         release();
    //     });
    // });
};

entity_gacha_winner.get = function(device_guid, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hget(h_entity_gacha_winner, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });

    // //只取前三个最新中奖玩家跑马显示
    // redis_pools.execute('pool_1', function(){
    //     client.zrevrange(z_entity_gacha_winner,0,2,function (err, reply) {
    //         if (err) {
    //             //  some thing log
    //             console.error(err);
    //         }
    //         for(var i = 0; i < reply.length; ++i){
    //             var winner = new Object();
    //             winner.phone_num_last_four = reply[i++].substr(7,4);
    //             winner.win_time_stamp = reply[i];
    //             win_info.push(winner);
    //         }
    //         cb(win_info);
    //         release();
    //     });
    // })
};

entity_gacha_winner.get_vals = function(cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hvals(h_entity_gacha_winner, function(err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};