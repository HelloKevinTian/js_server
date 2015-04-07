/**
 * Created by King Lee on 2014/8/5.
 */
var redis_pools = require("../nosql/redis_pools");
var h_notice = 'h_notice';

var redis_notice_wrapper = module.exports;

redis_notice_wrapper.init_notice = function(channel,version,notice){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_notice,channel + ':' + version,function (err, reply){
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
                    client.hset(h_notice,channel + ':' + version,JSON.stringify(notice),function (err, reply){
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

redis_notice_wrapper.add_notice = function(channel,varsion,notice){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_notice,channel + ':' + varsion,JSON.stringify(notice),function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

redis_notice_wrapper.get_notice = function(channel,version,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_notice,channel + ':' + version,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_notice_wrapper.get_all_notice = function(cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hgetall(h_notice,function (err, reply){
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
redis_notice_wrapper.dump_load = function(){
    redis_pools.execute('pool_1',function(client, release){
        client.hgetall(h_notice,function (err, reply){
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
                            client.hset(h_notice,v ,reply[v], function (err, reply) {
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