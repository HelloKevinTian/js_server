/**
 * Created by King Lee on 2015/1/13.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_UPDATE_PHONE_FOR_RANDOM_PRIZE_THE_THIRD_PHASE, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid;
    var phone_number = msg.phone_number;
    var random_prize_the_third_phase_wrapper = pomelo.app.get('random_prize_the_third_phase_wrapper');
    random_prize_the_third_phase_wrapper.update_phone(device_guid,phone_number);
    next(null, {
        code: 0,
        msg_id : msg.msg_id,
        flowid : msg.flowid,
        time:Math.floor(Date.now()/1000)
    });
});