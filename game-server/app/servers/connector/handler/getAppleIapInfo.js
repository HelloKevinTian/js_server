/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ 2016/1/13
 * @ 苹果支付验证
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var util = require('../../../util/util');
var redis_pools = require("../../../nosql/redis_pools");

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_APPLE_IAP_INFO, function(msg, session, next) {
    var Extraparam1 = msg.Extraparam1.toString();
    redis_pools.execute('pool_1', function(client, release) {
        client.hget('h_apple_iap', Extraparam1, function(err, reply) {
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