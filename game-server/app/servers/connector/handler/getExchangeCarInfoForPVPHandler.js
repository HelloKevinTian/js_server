/**
 * Created by King Lee on 2015/3/5.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var rival_vs_exchange_car_json = require('../../../../config/rival_vs_exchange_car');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_EXCHANGE_CAR_INFO_FOR_PVP, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    next(null, {
        code: 0,
        msg_id: msg.msg_id,
        flowid: msg.flowid,
        exchange_car_info:rival_vs_exchange_car_json,
        time: Math.floor(Date.now() / 1000)
    });
});