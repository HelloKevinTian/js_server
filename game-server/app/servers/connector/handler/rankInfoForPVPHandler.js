/**
 * Created by King Lee on 2015/1/5.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var rival_vs_title_json = require('../../../../config/rival_vs_title');
var async = require('async');

handlerMgr.handler(consts.TYPE_MSG.TYPE_RANK_INFO_FOR_PVP, function (msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid ? msg.player_guid : msg.deviceid;
    var device_emui = msg.deviceid;
    var type = msg.type;
    var expend_tracks = 0;
    var server_msg;
    var is_exist = 0;
    var championship_id = util.getWeek(new Date());
    var rank_pvp_wrapper = pomelo.app.get("rank_pvp_wrapper");
    var acitivty_switch = rank_pvp_wrapper.activity_switch(channel);
    var url = rank_pvp_wrapper.get_url();
    var total_rank_switch = rank_pvp_wrapper.total_rank_switch();
    var block_msg = rank_pvp_wrapper.block_msg();
    async.waterfall([
            function (callback) {
                switch (type) {
                    case "set":
                    {
                        var rank_info = {
                            channel: channel,
                            version: version,
                            nickname: msg.nickname,
                            device_guid: device_guid,
                            area: msg.area,
                            phone_number: msg.phone_number,
                            championship_id: championship_id,
                            car: 28,
                            car_lv: 0,
                            racer: 0,
                            racer_lv: 0,
                            strength: 280,
                            score: 0,
                            score_weekly: 0,
                            score_activity:0,
                            total_race: 0,
                            total_win: 0,
                            //  reversed , to avoid cheat
                            blocked: 0
                        };
                        rank_pvp_wrapper.set_rank_info(channel,device_guid, rank_info,function(reply){});
                        is_exist = 1;
                        callback(null, rank_info);
                        break;
                    }
                    case "get":
                    {
                        rank_pvp_wrapper.get_rank_info(device_guid, device_emui,function (rank_info) {
                            if (rank_info) {
                                is_exist = 1;
                                rank_info = JSON.parse(rank_info);
                                //  set car and drive
                                rank_info.car = msg.car;
                                rank_info.racer = msg.driver;
                            }
                            callback(null, rank_info);
                            if(rank_info){
                                rank_pvp_wrapper.set_rank_info(channel,device_guid, rank_info,function(reply){});
                            }
                        });
                        break;
                    }
                    case "update":
                    {
                        rank_pvp_wrapper.update_rank_info(device_guid,device_emui,channel, msg.area, msg.phone_number, msg.nickname,function (rank_info) {
                            if(rank_info){
                                is_exist = 1;
                            }
                            callback(null, rank_info);
                        });
                        break;
                    }
                }
            },
            function (rank_info, callback) {
                var activity_wrapper = pomelo.app.get('activity_wrapper');
                var activity = {};
                activity_wrapper.get(channel, version, function (activity_json) {
                    for (var v in activity_json) {
                        if (consts.TYPE_ACTIVITY.TYPE_PVP == parseInt(activity_json[v].type)) {
                            activity = activity_json[v];
                        }
                    }
                    expend_tracks = activity.expend_tracks;
                    server_msg = activity.server_msg;
                    var version_fix_flag = rank_pvp_wrapper.compare_version(version);
                    var pvp_switch = activity.switch;
                    if(rank_pvp_wrapper.in_black_list(device_emui)){
                        pvp_switch = 0;
                    }
                    var maintaining_msg = rank_pvp_wrapper.maintaining_msg();
                    var degree;
                    var degree_title;
                    var buff_desc;
                    var buff_data;
                    var degree_next;
                    var score_next;
                    var score_current;
                    if (rank_info) {
                        for (var v in rival_vs_title_json) {
                            if (rival_vs_title_json[v].score <= rank_info.score) {
                                degree_title = rival_vs_title_json[v].title;
                                degree = rival_vs_title_json[v].grade;
                                buff_desc = rival_vs_title_json[v].buff_desc;
                                buff_data = rival_vs_title_json[v].buff_data;
                                score_current = rival_vs_title_json[v].score;
                            }
                        }
                        degree_next = degree < rival_vs_title_json.length ? degree + 1 : rival_vs_title_json.length;
                        score_next = rival_vs_title_json[degree_next - 1].score;
                    }
                    //  mask word
                    if(rank_info){
                        if(rank_info.championship_id != championship_id){
                            rank_info.score_weekly = 0;
                            rank_info.score_activity = 0;
                            rank_info.championship_id = championship_id;
                        }
                        pomelo.app.get('mask_word_wrapper').analysis(rank_info.nickname,function(nickname_new){
                            rank_info.nickname = nickname_new;
                            next(null, {
                                code: 0,
                                msg_id: msg.msg_id,
                                flowid: msg.flowid,
                                time: Math.floor(Date.now() / 1000),
                                type: type,
                                expend_tracks: expend_tracks,
                                server_msg: server_msg,
                                block_msg:block_msg,
                                rank_info: rank_info,
                                degree: degree,
                                degree_title: degree_title,
                                buff_desc: buff_desc,
                                buff_data: buff_data,
                                score_current:score_current,
                                score_next: score_next,
                                is_exist: is_exist,
                                pvp_switch: pvp_switch,
                                maintaining_msg:maintaining_msg,
                                version_low:version_fix_flag ? 0 : 1,
                                acitivty_switch:acitivty_switch,
                                total_rank_switch:total_rank_switch,
                                url:url
                            });
                        });
                    }else{
                        next(null, {
                            code: 0,
                            msg_id: msg.msg_id,
                            flowid: msg.flowid,
                            time: Math.floor(Date.now() / 1000),
                            type: type,
                            expend_tracks: expend_tracks,
                            server_msg: server_msg,
                            block_msg:block_msg,
                            rank_info: rank_info,
                            degree: degree,
                            degree_title: degree_title,
                            buff_desc: buff_desc,
                            buff_data: buff_data,
                            score_next: score_next,
                            is_exist: is_exist,
                            pvp_switch: pvp_switch,
                            maintaining_msg:maintaining_msg,
                            version_low:version_fix_flag ? 0 : 1,
                            acitivty_switch:acitivty_switch,
                            total_rank_switch:total_rank_switch,
                            url:url
                        });
                    }
                });
                callback(null);
            }
        ],
        function (err) {
            if (err) {
                console.error(err);
            }
        });
});