/**
 * Created by King Lee on 2014/7/14.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var mission_json = require('../../../../config/mission');
var login_bonus_json = require('../../../../config/login_bonus');
var pomelo = require('pomelo');

var mission_string_2_type = function(mission_string){
    var type = consts.TYPE_MISSION.MISSION_TYPE_GEM;
    if(mission_string == "GEM"){
        type = consts.TYPE_MISSION.MISSION_TYPE_GEM;
    }else if(mission_string == "EASY"){
        type = consts.TYPE_MISSION.MISSION_TYPE_EASY;
    }else if(mission_string == "NORMAL"){
        type = consts.TYPE_MISSION.MISSION_TYPE_NORMAL;
    }else if(mission_string == "HARD"){
        type = consts.TYPE_MISSION.MISSION_TYPE_HARD;
    }else if(mission_string == "EVENT"){
        type = consts.TYPE_MISSION.MISSION_TYPE_EVENT;
    }
    return type;
};

//  for protocol adaptive,do not change
//  for mission
var cur_version_major = 1;
var cur_version_minor = 2;
var cur_version_fix = 8;

//  for week mission
var cur_version_major_4_week_mission = 2;
var cur_version_minor_4_week_mission = 2;
var cur_version_fix_4_week_mission = 0;

var cur_version_major_4_sign_in = 2;
var cur_version_minor_4_sign_in = 2;
var cur_version_fix_4_sign_in = 0;

var get_version_major = function(version){
    var version_array = version.split('.');
    if(3 != version_array.length){
        return cur_version_major;
    }
    return parseInt(version_array[0]);
};

var get_version_minor = function(version){
    var version_array = version.split('.');
    if(3 != version_array.length){
        return cur_version_minor;
    }
    return parseInt(version_array[1]);
};

var get_version_fix = function(version){
    var version_array = version.split('.');
    if(3 != version_array.length){
        return cur_version_fix;
    }
    return parseInt(version_array[2]);
};

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_ACTIVITY, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var type = msg.activity_type;

    //  record sign days
    if(1 == type){
        pomelo.app.get('statistics_wrapper').requestsSignInAllInc();
        pomelo.app.get('statistics_wrapper').requestsSignPerDayInc();
    }
    var version_major = get_version_major(version);
    var version_minor = get_version_minor(version);
    var version_fix = get_version_fix(version);
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    activity_wrapper.get(channel,version,function(activity_json){
        for(var v in activity_json){
            if(type == parseInt(activity_json[v].type)){
                activity = activity_json[v];
            }
        }
        //  for mission
        if(consts.TYPE_ACTIVITY.TYPE_TASK == type){
            if(version_major*100 + version_minor*10 + version_fix >= cur_version_major*100 + cur_version_minor*10 + cur_version_fix){
                var missions = activity.missions;
                activity.missions = [];
                for(var i = 0; i < missions.length; ++i){
                    //  random mission
                    var mission = missions[i].mission;
                    var mission_info = mission.split(',');
                    var mission_rank = mission_info[0];
                    var mission_type = mission_info[1];
                    var mission_rank_array = mission_rank.split('|');
                    var mission_rank_to_be_random = [];
                    for(var j = 0; j < mission_rank_array.length; ++j){
                        for(var v in mission_json){
                            if((mission_json.length -1) == parseInt(v)){
                                continue;
                            }
                            if(parseInt(mission_rank_array[j]) == mission_json[v].rank){
                                mission_rank_to_be_random.push(mission_json[v]);
                            }
                        }
                    }
                    var mission_type_array = mission_type.split('|');
                    var mission_type_to_be_random = [];
                    for(var j = 0; j < mission_type_array.length; ++j){
                        for(var v in mission_rank_to_be_random){
                            if(mission_type_array[j] == mission_string_2_type(mission_rank_to_be_random[v].mission_type)){
                                mission_type_to_be_random.push(mission_rank_to_be_random[v]);
                            }
                        }
                    }
                    //  check the mission which to be random is similar, if so, random again
                    var random_mission_index = Math.floor(Math.random()*mission_type_to_be_random.length);
                    var similar = true;
                    while(similar){
                        var find = false;
                        for(var v = 0; v < activity.missions.length; ++v){
                            if(activity.missions[v].mission_type == mission_type_to_be_random[random_mission_index].mission_type &&
                                activity.missions[v].condition_type == mission_type_to_be_random[random_mission_index].condition_type &&
                                activity.missions[v].data == mission_type_to_be_random[random_mission_index].data){
                                find = true;
                                random_mission_index = Math.floor(Math.random()*mission_type_to_be_random.length);
                                break;
                            }
                        }
                        if(find){
                            similar = true;
                        }else{
                            similar = false;
                            break;
                        }
                    }
                    activity.missions.push(mission_type_to_be_random[random_mission_index]);
                }
                //  add week mission
                if(version_major*100 + version_minor*10 + version_fix >= cur_version_major_4_week_mission*100 + cur_version_minor_4_week_mission*10 + cur_version_fix_4_week_mission)
                {
                    activity.missions.push(mission_json[mission_json.length -1]);
                }
            }
        }
        //  for random prize
        else if(consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE == type){
            pomelo.app.get('random_prize_wrapper').get(msg.player_guid,function(reply){
                if(null != reply){
                    var current_card = JSON.parse(reply).current_card;
                    var free_flag = JSON.parse(reply).free_flag;
                    //  if the free_flag is 1, that means is the first to single random prize
                    activity.is_first = free_flag?free_flag:0;
                    activity.current_card = current_card;
                }else{
                    activity.current_card = 0;
                    activity.is_first = 1;
                }
                next(null, {
                    code: 0,
                    msg_id : msg.msg_id,
                    flowid : msg.flowid,
                    user_data : msg.user_data,
                    time:Math.floor(Date.now()/1000),
                    activity:activity
                });
            });
        }
        //  for the second phase random prize
        else if(consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_SECOND_PHASE == type){
            pomelo.app.get('random_prize_the_second_phase_wrapper').get(msg.player_guid,function(reply){
                if(null != reply){
                    var free_flag = JSON.parse(reply);
                    //  if the free_flag is 1, that means is the first to single random prize
                    activity.is_first = free_flag?free_flag:0;
                }else{
                    activity.is_first = 1;
                }
                next(null, {
                    code: 0,
                    msg_id : msg.msg_id,
                    flowid : msg.flowid,
                    user_data : msg.user_data,
                    time:Math.floor(Date.now()/1000),
                    activity:activity
                });
            });
        }
        //  for the third phase random prize
        else if(consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_THIRD_PHASE == type){
            pomelo.app.get('random_prize_the_third_phase_wrapper').get(msg.player_guid,function(reply){
                if(null != reply){
                    var free_flag = JSON.parse(reply);
                    //  if the free_flag is 1, that means is the first to single random prize
                    activity.is_first = free_flag?free_flag:0;
                }else{
                    activity.is_first = 1;
                }
                next(null, {
                    code: 0,
                    msg_id : msg.msg_id,
                    flowid : msg.flowid,
                    user_data : msg.user_data,
                    time:Math.floor(Date.now()/1000),
                    activity:activity
                });
            });
        }
        else if(consts.TYPE_ACTIVITY.TYPE_DAILY_SIGN == type){
            if(version_major*100 + version_minor*10 + version_fix >= cur_version_major_4_sign_in *100 + cur_version_minor_4_sign_in*10 + cur_version_fix_4_sign_in){
                //  get the sign data exists
                pomelo.app.get('sign_in_wrapper').get(msg.player_guid,function(reply){
                    var sign_total = 1;
                    if(null == reply){
                        //  if reply is null, that means it is the first sign in
                        //  sign_total = 1;
                    }else{
                        var sign_info = JSON.parse(reply);
                        var last_sign_time = sign_info.last_sign_time;
                        sign_total = sign_info.sign_total;

                        var last_sign_day_time = new Date(last_sign_time);
                        var last_sign_day_tomorrow_time = new Date(last_sign_time + 1000*60*60*24);
                        var last_sign_day = last_sign_day_time.getDate();
                        var last_sign_day_tomorrow = last_sign_day_tomorrow_time.getDate();
                        var date_new = new Date();
                        var date_today = date_new.getDate();
                        if(date_today == last_sign_day_tomorrow){
                            //  sign in 'days is more than login_bonus_json.length, not increase any more
                            if(sign_total != login_bonus_json.length ){
                                ++sign_total;
                            }
                        }else if(last_sign_day == date_today){
                            //  sign in already
                        }else{
                            //  after login_bonus_json.length - 1(30) days, not interrupt
                            if(sign_total == (login_bonus_json.length - 1)){
                                ++sign_total;
                            }else{
                                //  sign in interrupt,count from 1
                                sign_total = 1;
                            }
                        }
                    }
                    //  give award for sign in
                    activity.login_bonus = login_bonus_json[sign_total -1];
                    activity.login_bonus_next = login_bonus_json[sign_total != login_bonus_json.length ? sign_total : login_bonus_json.length - 1];
                    activity.continuousSignDay = sign_total;
                    pomelo.app.get('sign_in_wrapper').set(msg.player_guid,sign_total);
                    next(null, {
                        code: 0,
                        msg_id : msg.msg_id,
                        flowid : msg.flowid,
                        user_data : msg.user_data,
                        time:Math.floor(Date.now()/1000),
                        activity:activity
                    });
                });
            }
            else{
                next(null, {
                    code: 0,
                    msg_id : msg.msg_id,
                    flowid : msg.flowid,
                    user_data : msg.user_data,
                    time:Math.floor(Date.now()/1000),
                    activity:activity
                });
            }
        }
        //  do not callback,must be later
        if(consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE == type
            || consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_SECOND_PHASE == type
            || consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_THIRD_PHASE == type
            || consts.TYPE_ACTIVITY.TYPE_DAILY_SIGN == type
            ){
            return;
        }
        next(null, {
            code: 0,
            msg_id : msg.msg_id,
            flowid : msg.flowid,
            user_data : msg.user_data,
            time:Math.floor(Date.now()/1000),
            activity:activity
        });
    });
});