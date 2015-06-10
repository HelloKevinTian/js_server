/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ 2015-06-09   
 */
var redis_pools = require("../nosql/redis_pools");
var h_charge_feedback = 'h_charge_feedback';

var charge_feedback_wrapper = module.exports;

charge_feedback_wrapper.set = function(key,value){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_charge_feedback,key,value,function (err, reply){
            if(err){
                console.error(err);
            }
            release();
        });
    });
};

charge_feedback_wrapper.get = function(key,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_charge_feedback,key,function (err, reply){
            if(err){
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};