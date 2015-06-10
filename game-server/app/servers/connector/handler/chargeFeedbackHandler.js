/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ 2015-06-09     
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var charge_feedback_wrapper = require("../../../nosql/redis_charge_feedback_wrapper");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_SET_CHARGE_FEEDBACK_INFO, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var phone_num = msg.phone_num;
    var player_guid = msg.player_guid;

    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');

    activity_wrapper.get(channel,version,function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_CHARGE_FEEDBACK == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
                break;
            }
        }

        var start_time_date = new Date(activity.startTime);
        var end_time_date = new Date(activity.endTime);

        var start_time_stamp = start_time_date.getTime();
        var end_time_stamp = end_time_date.getTime();
        var now_stamp = Date.now();

        if (now_stamp >= start_time_stamp && now_stamp <= end_time_stamp){
            var key = player_guid.toString() + "@" + activity.startTime;
            var value = phone_num.toString();
            charge_feedback_wrapper.set(key,value);

            next(null, {
                result: 0
            });
        } else {
            next(null, {
                result: 1
            });
        }
    });

});