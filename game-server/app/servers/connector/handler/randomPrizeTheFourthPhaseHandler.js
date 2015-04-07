/**
 * Created by King Lee on 2015/3/6.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var rival_vs_exchange_car_json = require('../../../../config/rival_vs_exchange_car');

handlerMgr.handler(consts.TYPE_MSG.TYPE_RANDOM_PRIZE_THE_FOURTH_PHASE, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid;
    var count = msg.gacha_times;
    var random_prize_the_fourth_phase_wrapper = pomelo.app.get('random_prize_the_fourth_phase_wrapper');
    var gacha_result = [];
    var max_number_per_time = 10;
    for(var i = 0; i < count; ++i){
        var gacha_array = new Array();
        for(var j = 0; j < max_number_per_time; ++j){
            var prize = random_prize_the_fourth_phase_wrapper.random();
            if(!prize){
                continue;
            }
            gacha_array.push(prize);
        }
        gacha_result.push(gacha_array);
    }
    next(null, {
        code: 0,
        msg_id : msg.msg_id,
        flowid : msg.flowid,
        time:Math.floor(Date.now()/1000),
        gacha_result : gacha_result,
        exchange_car_info:rival_vs_exchange_car_json
    });
});