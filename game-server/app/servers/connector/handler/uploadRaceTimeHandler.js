/**
 * Created by King Lee on 2014/8/11.
 */

var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_UPLOAD_RACE_TIME, function(msg, session, next) {
    var race_time = msg.race_time;
    var device_guid = msg.deviceid;
    var date_now = new Date();
    var championship_id = msg.championship_id;
    var rank_info = {
        channel:msg.channel,
        version:msg.version,
        car:msg.car,
        car_level:msg.car_level,
        driver:msg.driver,
        driver_level:msg.driver_level,
        phone_number:msg.phone_number,
        championship_id:championship_id,
        date:{year:date_now.getFullYear(),month:date_now.getMonth() + 1,date:date_now.getDate(),local_time:date_now.toLocaleTimeString()}
    };
    pomelo.app.get('statistics_wrapper').requestsRankInAllInc();
    pomelo.app.get('statistics_wrapper').requestsRankPerDayInc();
    var rank_wrapper = pomelo.app.get('rank_wrapper');
    rank_wrapper.add_rank_info(championship_id,device_guid,race_time,rank_info,function(reply){
        rank_wrapper.get_rank(championship_id,device_guid,function(reply){
            next(null, {
                code: 0,
                msg_id: msg.msg_id,
                flowid: msg.flowid,
                championship_id:championship_id,
                rank:reply[0] != null ? parseInt(reply[0]) + 1: reply[0],
                score:reply[1] != null ? parseInt(reply[1]): reply[1],
                time: Math.floor(Date.now() / 1000)
            });
        });
    });
});
