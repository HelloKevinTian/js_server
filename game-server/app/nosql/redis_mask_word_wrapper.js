/**
 * Created by King Lee on 2015/1/13.
 */
var redis_pools = require("../nosql/redis_pools");
var async = require('async');
var h_mask_word = 'h_mask_word';
var l_mask_word_online = 'l_mask_word_online';
var json_mask_word = require('../../config/mask_word');
var redis_mask_work_wrapper = module.exports;

redis_mask_work_wrapper.init = function(){
    var count = 0;
    async.whilst(
        function () { return count < json_mask_word.length; },
        function (callback) {
            async.waterfall([
                function(callback){
                    redis_pools.execute('pool_1',function(client, release){
                        client.hset(h_mask_word,json_mask_word[count],Date.now(),function (err, reply){
                            if(err){
                                //  some thing log
                                console.error(err);
                            }
                            callback(null);
                            release();
                        });
                    });
                }
            ],
                // optional callback
                function(err){
                    if(err){
                        console.error(err);
                    }
                    ++count;
                    callback(null);
                });
        },
        function (err) {
            //  whilst end,do nothing
            if(err){
                console.error(err);
            }
        }
    );
};

redis_mask_work_wrapper.get = function(word,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_mask_word,word,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_mask_work_wrapper.get_all_online = function(cb){
    redis_pools.execute('pool_1',function(client, release){
        client.lrange(l_mask_word_online,0,-1,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};