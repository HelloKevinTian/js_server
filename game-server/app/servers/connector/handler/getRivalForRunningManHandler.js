/**
 * Created by King Lee on 2014/10/17.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var rival_seoul_json = require('../../../../config/rival_seoul');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_RIVAL_FOR_RUNNING_MAN, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.deviceid;
    var boss_res = msg.boss_res;
    var boss_id = msg.boss_id;
    var championship_id = util.getWeek(new Date());
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    activity_wrapper.get(channel,version,function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.RIVAL_SEOUL == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
            }
        }
        var rank_running_man_wrapper = pomelo.app.get('rank_running_man_wrapper');
        rank_running_man_wrapper.get_level(championship_id,device_guid,function(level){
            var boss_info;
            var rivals = activity.rivals;
            if(null == level){
                //  come cross boss at first time
                level = 1;
                if("0" != boss_id) {
                    boss_info = rank_running_man_wrapper.get_rival_seoul_boss(activity,level,-1);
                    //  use client data
                    boss_info.bossid_real = boss_id;
                    boss_info.res_real = boss_res;
                }
            }
            else{
                //  get boss info from client
                level = parseInt(level);
                if("0" != boss_id){
                    boss_info = rank_running_man_wrapper.composs_rival_seoul_boss(activity,level,boss_id,boss_res);
                }
            }
            if(boss_info){
                rivals = rivals - 1;
            }
            var rival_seoul_array = rank_running_man_wrapper.get_rival_seoul(activity,level,rivals);
            var boss_info_next;
            var boss_come_cross_random_value = Math.floor(Math.random()*100);
            if(boss_come_cross_random_value <= activity.boss_rate * 100){
                //  level plus 1 to avoid  boss_info and boss_info_next use the same memory
                boss_info_next = rank_running_man_wrapper.get_rival_seoul_boss(activity,level + 1,boss_info?boss_info.level:-1);
            }
            next(null, {
                code: 0,
                msg_id : msg.msg_id,
                flowid : msg.flowid,
                time:Math.floor(Date.now()/1000),
                rival_list:rival_seoul_array,
                boss_info:boss_info,
                boss_id:boss_info_next?boss_info_next.bossid_real_next:0,
                boss_res:boss_info_next?boss_info_next.res_real_next:"",
                level:level > rival_seoul_json.length ? rival_seoul_json.length:level
            });
        });
    });
});