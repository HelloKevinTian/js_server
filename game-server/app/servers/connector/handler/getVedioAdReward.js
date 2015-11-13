/**
 * Created by Kevin on 2015/10/27.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var util = require('../../../util/util');
var redis_pools = require("../../../nosql/redis_pools");

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_VEDIO_AD_REWARD, function(msg, session, next) {
    var idn = msg.idn.toString();
    redis_pools.execute('pool_1', function(client, release) {
        client.hget('h_vedio_ad_reward', idn, function(err, reply) {
            if (err) {
                console.error(err);
            }
            release();
            next(null, {
                code: 0,
                msg_id: msg.msg_id,
                flowid: msg.flowid,
                result: JSON.parse(reply),
                time: Math.floor(Date.now() / 1000)
            });
        });
    });
});