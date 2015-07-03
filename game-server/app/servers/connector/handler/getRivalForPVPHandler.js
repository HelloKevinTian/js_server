/**
 * Created by King Lee on 2015/1/5.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var async = require('async');
var rival_vs_json = require('../../../../config/rival_vs');
var rival_vs_title_json = require('../../../../config/rival_vs_title');

var get_rival = function(strength) {
    for (var v in rival_vs_json) {
        if (strength == rival_vs_json[v].level) {
            return rival_vs_json[v];
        }
    }
    return rival_vs_json[0];
};

var get_limit = function() {
    return [rival_vs_json[0].level, rival_vs_json[rival_vs_json.length - 1].level];
};

var get_extra_info = function(player_info_somebody, score) {
    for (var v in rival_vs_title_json) {
        if (rival_vs_title_json[v].score <= score) {
            player_info_somebody.degree_title = rival_vs_title_json[v].title;
            player_info_somebody.degree = rival_vs_title_json[v].grade;
            player_info_somebody.buff_desc = rival_vs_title_json[v].buff_desc;
            player_info_somebody.buff_data = rival_vs_title_json[v].buff_data;
            player_info_somebody.score_current = rival_vs_title_json[v].score;
        }
    }
    var degree_next = player_info_somebody.degree < rival_vs_title_json.length ? player_info_somebody.degree + 1 : rival_vs_title_json.length;
    player_info_somebody.score_next = rival_vs_title_json[degree_next - 1].score;
};

var copy_rival_info = function(player_info_somebody,strength){
    var rival_info = get_rival(strength);
    player_info_somebody.level = rival_info.level;
    player_info_somebody.name = rival_info.name;
    player_info_somebody.from = rival_info.from;
    player_info_somebody.car = rival_info.car;
    player_info_somebody.car_lv = rival_info.car_lv;
    player_info_somebody.driver = rival_info.driver;
    player_info_somebody.driver_lv = rival_info.driver_lv;
    player_info_somebody.strength = rival_info.strength;
    player_info_somebody.score = rival_info.score;
    player_info_somebody.drift = rival_info.drift;
    player_info_somebody.weight = rival_info.weight;
    player_info_somebody.attack = rival_info.attack;
    player_info_somebody.speed_cruising = rival_info.speed_cruising;
    player_info_somebody.speed_duel = rival_info.speed_duel;
    player_info_somebody.speed_boost = rival_info.speed_boost;
    player_info_somebody.accel = rival_info.accel;
    player_info_somebody.accel_duel = rival_info.accel_duel;
    player_info_somebody.accel_boost = rival_info.accel_boost;
    player_info_somebody.distance_duel = rival_info.distance_duel;
    player_info_somebody.distance_wait = rival_info.distance_wait;
    player_info_somebody.distance_boost = rival_info.distance_boost;
    player_info_somebody.distance_giveup = rival_info.distance_giveup;
    player_info_somebody.time_giveup = rival_info.time_giveup;
    player_info_somebody.time_boost = rival_info.time_boost;
    player_info_somebody.cdtime_boost = rival_info.cdtime_boost;
    player_info_somebody.evade_rate = rival_info.evade_rate;
    player_info_somebody.coin = rival_info.coin;
};

var get_robot_rival_info = function(strength_min, strength_max, player_info_array, callback, version, pvp_has_boss) {
    var max_loop_count = 100;
    var cur_loop_count = 0;
    var random_val = 0;
    var is_repeat = true;
    do {
        random_val = Math.floor(strength_min + Math.random() * (strength_max - strength_min));
        //  can not be the player have chose
        var find = false;
        for (var i = 0; i < player_info_array.length; ++i) {
            if (random_val == player_info_array[i].strength) {
                find = true;
                break;
            }
        }
        if (find) {
            ++cur_loop_count;
            continue;
        }
        is_repeat = false;
        ++cur_loop_count;
    } while (is_repeat && cur_loop_count < max_loop_count);

    var player_info_somebody = new Object();

    copy_rival_info(player_info_somebody,random_val);

    //2.6.0版本加入随机到boss的功能
    if (version === "2.6.0" && !pvp_has_boss && (Math.random() >= consts.TYPE_PVP.PVP_BOSS_WEIGHT)) {
        player_info_somebody.driver = consts.TYPE_PVP.PVP_BOSS_RACER_ID;
        pvp_has_boss = true;
    }

    player_info_somebody.is_robot = 1;

    player_info_array.push(player_info_somebody);

    get_extra_info(player_info_somebody, player_info_somebody.score);

    callback(null, player_info_array, pvp_has_boss);
};

var get_player_info = function(device_guid, strength_min, strength_max, max_count_to_be_choose, player_info_array, callback, version, pvp_has_boss) {
    var limit = get_limit();
    var limit_min = limit[0];
    var limit_max = limit[1];
    strength_min = (strength_min < limit_min ? limit_min : strength_min);
    strength_max = (strength_max > limit_max ? limit_max : strength_max);
    var random_val = 0;
    var cur_loop_count = 0;
    var max_loop_count = 100;
    var rank_pvp_wrapper = pomelo.app.get("rank_pvp_wrapper");
    rank_pvp_wrapper.get_player_by_strength(strength_min, strength_max, max_count_to_be_choose, function(reply) {
        if (reply.length >= consts.TYPE_PVP.PVP_RACER_NUM) {
            var players = reply;
            var is_repeat = true;
            do {
                //  random players
                random_val = Math.floor(Math.random() * players.length);
                var player = players[random_val];

                //  can not be myself
                if (player == device_guid) {
                    ++cur_loop_count;
                    continue;
                }
                //  can not be the player have chose
                var find = false;
                for (var i = 0; i < player_info_array.length; ++i) {
                    if (player == player_info_array[i].device_guid) {
                        find = true;
                        break;
                    }
                }
                if (find) {
                    ++cur_loop_count;
                    continue;
                }
                is_repeat = false;
                ++cur_loop_count;
            } while (is_repeat && cur_loop_count < max_loop_count);

            rank_pvp_wrapper.get_rank_info(players[random_val], players[random_val], function(reply) {
                var rank_info = {};

                if (reply) {
                    rank_info = JSON.parse(reply);
                    var player_info_somebody = new Object();
                    //  random json table
                    random_val = Math.floor(strength_min + Math.random() * (strength_max - strength_min));
                    copy_rival_info(player_info_somebody,rank_info.strength);
                    player_info_somebody.device_guid = rank_info.device_guid;
                    player_info_somebody.name = rank_info.nickname;
                    player_info_somebody.strength = rank_info.strength;
                    player_info_somebody.from = rank_info.area;
                    player_info_somebody.car = rank_info.car ? rank_info.car : 28;
                    player_info_somebody.car_lv = rank_info.car_lv;
                    player_info_somebody.driver = rank_info.racer;
                    player_info_somebody.driver_lv = rank_info.racer_lv;
                    player_info_somebody.total_win = rank_info.total_win;
                    player_info_somebody.is_robot = 0;
                    get_extra_info(player_info_somebody, rank_info.score);
                    player_info_array.push(player_info_somebody);
                    //  mask word
                    pomelo.app.get('mask_word_wrapper').analysis(player_info_somebody.name, function(nickname_new) {
                        player_info_somebody.name = nickname_new;
                        callback(null, player_info_array, pvp_has_boss);
                    });
                } else {
                    //  if rank_info is null,random from robot,usually it is impossible! just in case
                    get_robot_rival_info(strength_min, strength_max, player_info_array, callback, version, pvp_has_boss);
                }
            });
        } else {
            get_robot_rival_info(strength_min, strength_max, player_info_array, callback, version, pvp_has_boss);
        }
    });
};

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_RIVAL_FOR_PVP, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid ? msg.player_guid : msg.deviceid;
    var device_emui = msg.deviceid;
    var strength = parseInt(msg.strength);
    var random_val = Math.floor(Math.random() * 100);
    var max_count_to_be_choose = 100;
    var strength_min = strength;
    var strength_max = strength;
    var player_info_array = [];
    var pvp_has_boss = false; //本次取对手是否已经随机到boss driver为14的特殊robot（boss）每次只允许有一个boss被随机到
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    var rank_pvp_wrapper = pomelo.app.get("rank_pvp_wrapper");
    var version_fix_flag = rank_pvp_wrapper.compare_version(version);
    activity_wrapper.get(channel, version, function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_PVP == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
            }
        }
        //  calc stage
        var stage_array = activity.stage;
        var pvp_switch = activity.switch;
        if (rank_pvp_wrapper.in_black_list(device_emui)) {
            pvp_switch = 0;
        }
        var maintaining_msg = rank_pvp_wrapper.maintaining_msg();
        async.waterfall([
                function(callback) {
                    //  player 1
                    if (random_val <= 80) {
                        strength_min = strength - 120;
                        strength_max = strength + 10;
                    } else {
                        strength_min = strength + 30;
                        strength_max = strength + 130;
                    }
                    get_player_info(device_guid, strength_min, strength_max, max_count_to_be_choose, player_info_array, callback, version, pvp_has_boss);
                },
                function(player_info_array, pvp_has_boss, callback) {
                    strength_min = strength - 200;
                    strength_max = strength + 0;
                    get_player_info(device_guid, strength_min, strength_max, max_count_to_be_choose, player_info_array, callback, version, pvp_has_boss);
                },
                function(player_info_array, pvp_has_boss, callback) {
                    strength_min = strength - 200;
                    strength_max = strength + 30;
                    get_player_info(device_guid, strength_min, strength_max, max_count_to_be_choose, player_info_array, callback, version, pvp_has_boss);
                }
            ],
            function(err, player_info_array, pvp_has_boss) {
                //  get stage distance
                var max_strength = 0;
                for (var i = 0; i < player_info_array.length; ++i) {
                    if (max_strength < player_info_array[i].strength) {
                        max_strength = player_info_array[i].strength;
                    }
                }
                var stage_distance = Math.floor(strength / 6 * 100);
                random_val = Math.floor(Math.random() * stage_array.length);
                rank_pvp_wrapper.get_rank_info(device_guid, device_emui, function(reply) {
                    var rank_info = {};
                    var total_race = 0;
                    if (reply) {
                        rank_info = JSON.parse(reply);
                        total_race = rank_info.total_race;
                    }
                    next(null, {
                        code: 0,
                        msg_id: msg.msg_id,
                        flowid: msg.flowid,
                        time: Math.floor(Date.now() / 1000),
                        stage: stage_array[random_val],
                        stage_distance: stage_distance,
                        player_info_array: player_info_array,
                        pvp_switch: pvp_switch,
                        maintaining_msg: maintaining_msg,
                        version_low: version_fix_flag ? 0 : 1,
                        total_race: total_race
                    });
                });
            });
    });
});