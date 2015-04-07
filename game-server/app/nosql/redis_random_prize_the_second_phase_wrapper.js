
var redis_pools = require("../nosql/redis_pools");
var h_random_prize_the_second_phase = 'h_random_prize_the_second_phase';

var random_prize_the_second_phase_wrapper = module.exports;

random_prize_the_second_phase_wrapper.set = function(device_guid,free_flag){
    var date = new Date();
    var date_string = "_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_random_prize_the_second_phase,device_guid + date_string,free_flag,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            release();
        });
    });
};

random_prize_the_second_phase_wrapper.get = function(device_guid,cb){
    var date = new Date();
    var date_string = "_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_random_prize_the_second_phase,device_guid + date_string,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};
