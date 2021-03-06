/**
 * Created by King Lee on 2014/6/19.
 */
var redis_pools = require("../nosql/redis_pools");
var h_activity = 'h_activity';

var redis_activity_wrapper = module.exports;

redis_activity_wrapper.init_activity = function(channel,version,activity){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_activity,channel + ':' + version,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            //  have the key, do nothing
            if(reply){
                release();
                return;
            }
            else{
                redis_pools.execute('pool_1',function(client, release){
                    client.hset(h_activity,channel + ':' + version,JSON.stringify(activity),function (err, reply){
                        if(err){
                            //  some thing log
                            console.error(err);
                        }
                        release();
                    });
                });
            }
            release();
        });
    });
};

redis_activity_wrapper.add_activity = function(channel,varsion,activity){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_activity,channel + ':' + varsion,JSON.stringify(activity),function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

redis_activity_wrapper.get_activity = function(channel,version,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_activity,channel + ':' + version,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

/*
 dump and load
 */
redis_activity_wrapper.dump_load = function(){
    redis_pools.execute('pool_1',function(client, release){
        client.hgetall(h_activity,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            var redis_json = require('../../config/redis');
            for(var w in redis_json){
                if(w == "pool_dump_load"){
                    var client = require("redis").createClient(redis_json[w].port,redis_json[w].hostname);
                    if(reply){
                        for(var v in reply){
                            client.hset(h_activity,v ,reply[v], function (err, reply) {
                                if(err){
                                    console.error(err);
                                }
                            });
                        }
                    }
                }
            }
            release();
        });
    });
};