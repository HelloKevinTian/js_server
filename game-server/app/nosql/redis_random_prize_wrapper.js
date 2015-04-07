/**
 * Created by King Lee on 2014/9/16.
 */
var redis_pools = require("../nosql/redis_pools");
var h_random_prize = 'h_random_prize';

var random_prize_wrapper = module.exports;

random_prize_wrapper.set = function(device_guid,current_card,free_flag){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_random_prize,device_guid,JSON.stringify({current_card:current_card,free_flag:free_flag}),function (err, reply){
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

//  for statistics
/*
 4、可按日期统计“抽取满级特斯拉”的参与玩家人数
 5、可按日期统计“抽取满级特斯拉”每个玩家的参与次数
 */

random_prize_wrapper.statistics_for_participant = function(device_guid){
    //  for 4
    redis_pools.execute('pool_1',function(client, release){
        var date = new Date();
        client.hset(h_random_prize + "_statistics:" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(),device_guid,Date.now()/*useless data*/,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });

    //  for 5
    redis_pools.execute('pool_1',function(client, release) {
        var date = new Date();
        client.hget(h_random_prize + "_times_statistics" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(), device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            var times = reply ? parseInt(reply) + 1 : 1;
            redis_pools.execute('pool_1',function(client, release) {
                client.hset(h_random_prize + "_times_statistics" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(), device_guid, times, function (err, reply) {
                    if (err) {
                        //  some thing log
                        console.error(err);
                    }
                    release();
                });
            });
            release();
        });
    });
};

/*
    dump and load
 */
random_prize_wrapper.dump_load = function(){
    redis_pools.execute('pool_1',function(client, release){
        client.hgetall(h_random_prize,function (err, reply){
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
                            var award_info = JSON.parse(reply[v]);
                            award_info.free_flag = 0;
                            client.hset(h_random_prize,v ,JSON.stringify(award_info), function (err, reply) {
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