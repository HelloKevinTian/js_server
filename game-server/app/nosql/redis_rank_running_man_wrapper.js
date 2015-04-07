/**
 * Created by King Lee on 2014/10/17.
 */
var async = require('async');
var redis_pools = require("../nosql/redis_pools");
var z_rank_running_man = 'z_rank_running_man';
var z_level_running_man = 'z_level_running_man';
var h_rank_running_man = 'h_rank_running_man';
var h_award_running_man = 'h_award_running_man';

var redis_rank_running_man_wrapper = module.exports;

redis_rank_running_man_wrapper.add_rank_info = function(championship_id,device_guid,is_add_score,finally_score,rank_info,cb){
    if(0){
        redis_rank_running_man_wrapper.get_rank_time(championship_id,device_guid,function(reply){
            redis_pools.execute('pool_1',function(client, release) {
                if (reply) {
                    if("true" == is_add_score){
                        finally_score = finally_score + parseInt(reply);
                    }
                    else{
                        finally_score = reply;
                    }
                }
                else{
                    finally_score = 0;
                }
                client.zadd(z_rank_running_man + ":" + championship_id, finally_score, device_guid, function (err, reply) {
                    if (err) {
                        //  some thing log
                        console.error(err);
                    }
                    cb(reply);
                    release();
                });
            });
        });
    }
    else{
        redis_rank_running_man_wrapper.get_rank_time(championship_id,device_guid,function(reply){
            if("true" == is_add_score){
                redis_pools.execute('pool_1',function(client, release) {
                    if (reply) {
                        finally_score = finally_score + parseInt(reply);
                    }
                    client.zadd(z_rank_running_man + ":" + championship_id, finally_score, device_guid, function (err, reply) {
                        if (err) {
                            //  some thing log
                            console.error(err);
                        }
                        cb(reply);
                        release();
                    });
                });
            }
            else{
                cb(reply);
            }
        });
    }

    redis_pools.execute('pool_1',function(client, release) {
        client.hset(h_rank_running_man + ":" + championship_id, device_guid, JSON.stringify(rank_info), function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });

    //  for statistics
    /*
     1、可按日期统计“首尔撕牌大战”的参与玩家人数
     2、可按日期统计“首尔撕牌大战”每个玩家的参与次数
     3、“首尔撕牌大战”积分排行榜
     */
    var date = new Date();
    //  for 1
    redis_pools.execute('pool_1',function(client, release) {
        client.hset(h_rank_running_man + "_statistics:" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(), device_guid, Date.now()/*useless data*/, function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });

    redis_pools.execute('pool_1',function(client, release) {
        client.zincrby(z_rank_running_man + "_statistics:" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(), 1,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });

    //  for 2
    redis_pools.execute('pool_1',function(client, release) {
        client.hget(h_rank_running_man + "_times_statistics" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(), device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            var times = reply ? parseInt(reply) + 1 : 1;
            redis_pools.execute('pool_1',function(client, release) {
                client.hset(h_rank_running_man + "_times_statistics" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(), device_guid, times, function (err, reply) {
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

redis_rank_running_man_wrapper.get_all_rank_info = function(championship_id,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.hgetall(h_rank_running_man + ":" + championship_id,function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_rank_running_man_wrapper.update_rank_info = function(championship_id,device_guid,rank_info,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.hset(h_rank_running_man + ":" + championship_id, device_guid, JSON.stringify(rank_info), function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_rank_running_man_wrapper.get_rank_time = function(championship_id,device_guid,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.zscore(z_rank_running_man + ":" + championship_id,device_guid,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_rank_running_man_wrapper.get_rank = function(championship_id,device_guid,cb){
    async.parallel([
            function(callback){
                redis_pools.execute('pool_1',function(client, release){
                    client.zrevrank(z_rank_running_man + ":" + championship_id,device_guid,function (err, reply){
                        if(err){
                            //  some thing log
                            console.error(err);
                        }
                        callback(null, reply);
                        release();
                    });
                });
            },
            function(callback){
                redis_pools.execute('pool_1',function(client, release){
                    client.zscore(z_rank_running_man + ":" + championship_id,device_guid,function (err, reply){
                        if(err){
                            //  some thing log
                            console.error(err);
                        }
                        callback(null, reply);
                        release();
                    });
                });
            },
            function(callback){
                redis_pools.execute('pool_1',function(client, release) {
                    client.hget(h_rank_running_man + ":" + championship_id,device_guid, function (err, reply) {
                        if (err) {
                            //  some thing log
                            console.error(err);
                        }
                        callback(null, reply);
                        release();
                    });
                });
            },
            function(callback){
                redis_pools.execute('pool_1',function(client, release){
                    client.zcount(z_rank_running_man + ":" + championship_id,'-inf','+inf',function (err, reply){
                        if(err){
                            //  some thing log
                            console.error(err);
                        }
                        callback(null, reply);
                        release();
                    });
                });
            }
        ],
        // optional callback
        function(err, results){
            // the results array will equal ['rank','score','phone_number',rank_total_count]
            cb(results);
        });
};

redis_rank_running_man_wrapper.increase_level = function(championship_id,device_guid,increase_level_num){
    redis_rank_running_man_wrapper.get_level(championship_id,device_guid,function(reply){
        //  level start from 1
        if(!reply){
            ++increase_level_num;
        }
        redis_pools.execute('pool_1',function(client, release) {
            client.zincrby(z_level_running_man + ":" + championship_id, increase_level_num,device_guid, function (err, reply) {
                if (err) {
                    //  some thing log
                    console.error(err);
                }
                release();
            });
        });
    });
};

redis_rank_running_man_wrapper.get_level = function(championship_id,device_guid,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.zscore(z_level_running_man + ":" + championship_id,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_rank_running_man_wrapper.set_award = function(device_guid,award_info){
    redis_pools.execute('pool_1',function(client, release) {
        client.hset(h_award_running_man,device_guid, JSON.stringify(award_info),function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

redis_rank_running_man_wrapper.get_award = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.hget(h_award_running_man,device_guid,function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_rank_running_man_wrapper.del_award = function(device_guid){
    redis_pools.execute('pool_1',function(client, release) {
        client.hdel(h_award_running_man,device_guid,function (err, reply) {
            if (err) {
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};