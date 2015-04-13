/**
 * Created by King Lee on 2014/10/14.
 */
var redis_pools = require("../nosql/redis_pools");
var h_fly_flow = 'h_fly_flow';

var redis_fly_flow_wrapper = module.exports;

redis_fly_flow_wrapper.get = function(orderid,cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hget(h_fly_flow,orderid,function (err, reply){
            if(err){
                //  some thing log
                console.error(err);
            }
            cb(reply);
            release();
        });
    });
};
