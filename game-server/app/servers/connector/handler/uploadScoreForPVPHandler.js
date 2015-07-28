/**
 * Created by King Lee on 2015/1/6.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var rival_vs_title_json = require('../../../../config/rival_vs_title');

var log4js = require('log4js');
var log_json = require('../../../../config/log.json');
log4js.configure(log_json);
var datelogger = log4js.getLogger('date_logger');

handlerMgr.handler(consts.TYPE_MSG.TYPE_UPLOAD_SCORE_FOR_PVP, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid ? msg.player_guid : msg.deviceid;
    var device_emui = msg.deviceid;
    var total_race = msg.total_race;
    var championship_id = util.getWeek(new Date());
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    var rank_pvp_wrapper = pomelo.app.get("rank_pvp_wrapper");
    activity_wrapper.get(channel, version, function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_PVP == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
            }
        }
        var pvp_switch = activity.switch;
        if (rank_pvp_wrapper.in_black_list(device_emui)) {
            pvp_switch = 0;
        }
        var maintaining_msg = rank_pvp_wrapper.maintaining_msg();
        rank_pvp_wrapper.get_rank_info(device_guid, device_emui, function(rank_info) {
            if (rank_info) {
                rank_info = JSON.parse(rank_info);
                rank_info.version = version;
                rank_info.channel = channel;
            }
            datelogger.debug("##111 msg24: " + JSON.stringify(msg));
            datelogger.debug("##222 old rank: " + JSON.stringify(rank_info));
            //  calc score and money
            var my_rank = msg.my_rank;
            var rivals = msg.rivals;
            var score_add = 0;
            var money_add = 0;
            var buffer_data = 1;
            for (var v in rivals) {
                if (rivals[v].rank > my_rank) {
                    score_add += Math.floor(rivals[v].strength / 10);
                    money_add += Math.floor(rivals[v].strength / 3);
                }
            }
            rank_info.car = msg.car;
            rank_info.car_lv = msg.car_lv;
            rank_info.racer = msg.racer;
            rank_info.racer_lv = msg.racer_lv;
            rank_info.strength = msg.strength;
            //  emergency treatment by 2015/2/2
            if (!rank_info.upload_last_time) {
                rank_info.upload_last_time = Date.now();
            } else {
                var cur_time = Date.now();
                var interval_time = cur_time - rank_info.upload_last_time;
                if (interval_time < 45 * 1000) {
                    //  if the time is too short, do return any data,and record this
                    rank_pvp_wrapper.record_cheat_info(device_guid, rank_info);
                    return;
                } else {
                    rank_info.upload_last_time = cur_time;
                }
            }
            //  score is provide by client, which is the final result(include all loser's score).
            if (msg.version === "2.6.0" && msg.car.toString() === consts.TYPE_PVP.PVP_DOUBLE_SCORE_CAR.toString()) { //2.6.0新加：如果当前车id是42，那么所得积分加倍
                score_add *= 2;
            }
            rank_info.score += score_add;
            if (rank_info.championship_id == championship_id) {
                rank_info.score_weekly += score_add;
            } else {
                rank_info.score_weekly = score_add;
                rank_info.championship_id = championship_id;
            }
            //  update 2015/3/11 set score_activity's value is score_weekly
            if (rank_pvp_wrapper.in_activity(channel)) {
                //  version compatibility, 2.3.0 have not the value of score_activity
                if (!rank_info.score_activity) {
                    rank_info.score_activity = 0;
                }
                rank_info.score_activity += score_add;
            } else {
                rank_info.score_activity = 0;
            }

            // ------做华为排行时注释掉了，暂未发现之前其作用--------
            // else {
            //     rank_info.score_activity = rank_info.score_weekly;
            // }
            //--------------------------------------------------------

            //  calc degree
            var old_degree = rank_info.degree ? rank_info.degree : 1;
            var degree = old_degree;
            for (var v in rival_vs_title_json) {
                if (rival_vs_title_json[v].score <= rank_info.score) {
                    degree = rival_vs_title_json[v].grade;
                    buffer_data = rival_vs_title_json[v].buff_data;
                }
            }
            money_add = Math.floor(money_add * (buffer_data + 100) / 100);
            if (total_race == rank_info.total_race) {
                //  to be continue ...
            }
            rank_info.total_race += 1;
            if ("true" == msg.win_flag) {
                rank_info.total_win += 1;
            }
            // log pvp rank
            datelogger.debug("##333 new rank: " + JSON.stringify(rank_info));
            //  save it
            rank_pvp_wrapper.set_rank_info(channel, device_guid, rank_info, function(reply) {});
            //  update score/score weekly rank
            rank_pvp_wrapper.update_score_rank(channel, device_guid, championship_id, rank_info);
            //  update strength rank
            if (rank_info.car_lv != 0) {
                rank_pvp_wrapper.update_strength_rank(device_guid, rank_info.strength);
            }
            next(null, {
                code: 0,
                msg_id: msg.msg_id,
                flowid: msg.flowid,
                time: Math.floor(Date.now() / 1000),
                score: rank_info.score,
                money: money_add,
                pvp_switch: pvp_switch,
                maintaining_msg: maintaining_msg
            });
        });
    });
});