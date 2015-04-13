/**
 * Created by King Lee on 2014/10/20.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_RACE_RANK_FOR_RUNNING_MAN, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.deviceid;
    var championship_id = util.getWeek(new Date());
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    //  get activity first
    activity_wrapper.get(channel,version,function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.RIVAL_SEOUL == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
                //  get rank info
                var rank_running_man_wrapper = pomelo.app.get('rank_running_man_wrapper');
                rank_running_man_wrapper.get_rank(championship_id,device_guid,function(reply){
                    next(null, {
                        code: 0,
                        msg_id: msg.msg_id,
                        flowid: msg.flowid,
                        rank:reply[0] != null ? parseInt(reply[0]) + 1: 0,
                        score:reply[1] != null ? parseInt(reply[1]): 0,
                        phone_number:reply[2] != null ? JSON.parse(reply[2]).phone_number: 0,
                        player_number:reply[3] != null ? reply[3]: 0,
                        normal_energy:activity.normal_energy,
                        boss_energy:activity.boss_energy,
                        rival_score:activity.rival_score,
                        rival_score_boss:activity.rival_score_boss,
                        phone_number_option:activity.phone_number_option,
                        server_msg:activity.server_msg,
                        time: Math.floor(Date.now() / 1000)
                    });
                });
            }
        }
    });
});