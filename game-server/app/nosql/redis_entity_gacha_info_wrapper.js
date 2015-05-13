/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ Date 	2015-05-12
 */

var redis_pools = require("../nosql/redis_pools");
var h_entity_gacha_info = 'h_entity_gacha_info';

var entity_gacha_info = module.exports;

entity_gacha_info.set = function(item_type, used_num) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_entity_gacha_info, item_type.toString(), used_num, function(err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

entity_gacha_info.get = function(item_type, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hget(h_entity_gacha_info, item_type.toString(), function(err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

entity_gacha_info.getall = function(cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hgetall(h_entity_gacha_info, function(err, reply) {
            if (err) {
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};