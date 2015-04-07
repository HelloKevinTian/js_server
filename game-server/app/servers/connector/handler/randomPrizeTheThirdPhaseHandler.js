/**
 * Created by King Lee on 2014/9/16.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var gacha_the_third_phase_json = require('../../../../config/gacha_the_third_phase.json');
var gacha_the_third_phase_real_limit_json = require('../../../../config/gacha_the_third_phase_real_limit.json');
var async = require('async');

/**
 * if the gacha result include the item which type is "SAVE"
 * @param gacha_result
 */
var query_item = function(prize,gacha_result,gacha_array){
    if(prize.type != "SAVE"){
        return false;
    }
    //  find from gacha_array first
    for(var m = 0; m < gacha_array.length; ++m){
        if(gacha_array[m].type == "SAVE"){
            return true;
        }
    }
    //  then find from gacha_result
    for(var i = 0; i < gacha_result.length; ++i){
        if(gacha_result[i]){
            for(var j = 0; j < gacha_result[i].length; ++j){
                if(gacha_result[i][j].type == "SAVE"){
                    return true;
                }
            }
        }
    }
    return false;
};

var copy_prize =  function(prize){
  var new_prize = new Object();
    new_prize.id = prize.id;
    new_prize.type = prize.type;
    new_prize.number = prize.number;
    new_prize.data = prize.data;
    new_prize.rate = prize.rate;
    new_prize.icon = prize.icon;
    new_prize.replace_flag = prize.replace_flag;
    if(prize.replace){
        new_prize.replace = prize.replace;
    }
    if(prize.replace_number){
        new_prize.replace_number = prize.replace_number;
    }
    if(prize.replace_icon){
        new_prize.replace_icon = prize.replace_icon;
    }
    return new_prize;
};

handlerMgr.handler(consts.TYPE_MSG.TYPE_RANDOM_PRIZE_THE_THIRD_PHASE, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid;
    var single_gacha = msg.single_gacha;
    var random_prize_the_third_phase_wrapper = pomelo.app.get('random_prize_the_third_phase_wrapper');
    var count = 0;
    var gacha_result = [];
    //  default is free
    var free_flag = 1;
    var free_flag_this_time = 1;
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    activity_wrapper.get(channel,version,function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_THIRD_PHASE == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
                break;
            }
        }
        if(single_gacha == "true" ){
            count = activity.single_count;
        }
        else{
            count = activity.combo_count;
        }
        //  random prize
        random_prize_the_third_phase_wrapper.get(device_guid,function(reply){
            if(null != reply){
                free_flag = JSON.parse(reply);
                free_flag_this_time = free_flag;
            }
            //  if is single random prize, free_flag set zero
            if(1 == free_flag && single_gacha == "true" ){
                free_flag = 0;
            }
            var prize;
            var start = 0;
            async.whilst(
                function () { return start < count; },
                function (callback) {
                    var gacha_array = new Array();
                    async.waterfall([
                            function(callback){
                                for(var j = 0; j < activity.gacha_random_num; ++j)
                                {
                                    //  free random prize come out the item type "SAVE"
                                    if(1 == free_flag_this_time){
                                        for(var v in gacha_the_third_phase_json){
                                            if("SAVE" == gacha_the_third_phase_json[v].type){
                                                gacha_the_third_phase_json[v].replace_flag = 0;
                                                var new_prize = copy_prize(gacha_the_third_phase_json[v]);
                                                gacha_array.push(new_prize);
                                                free_flag_this_time = 0;
                                                j++;
                                                callback(null);
                                                break;
                                            }
                                        }
                                    }
                                    else{
                                        var date = new Date();
                                        var entity_award_time = activity.entity_award_time;
                                        var date_string = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" +  date.getDate();
                                        var use_replace = false;
                                        for(var i = 0; i < entity_award_time.length; ++i){
                                            if(date_string == entity_award_time[i]){
                                                use_replace = true;
                                            }
                                        }
                                        //  date is 2015/2/18~2015/2/25, use json table gacha_the_third_phase_json_replace
                                        if(use_replace){
                                            prize = random_prize_the_third_phase_wrapper.random_replace();
                                            //  the award is entity, record it!
                                            if("REAL" == prize.type){
                                                var cur_entity_num = 0;
                                                var max_entity_num = 0;
                                                for(var v in gacha_the_third_phase_real_limit_json){
                                                    if(gacha_the_third_phase_real_limit_json[v].data  == prize.data){
                                                        max_entity_num = gacha_the_third_phase_real_limit_json[v].limit;
                                                    }
                                                }
                                                //  get all award information, and judge the entity is enough
                                                random_prize_the_third_phase_wrapper.get_all_award(function(all_award_info){
                                                    for(var i = 0; i < all_award_info.length; ++i){
                                                        if(all_award_info[i]){
                                                            if(JSON.parse(all_award_info[i]).prize){
                                                                if(JSON.parse(all_award_info[i]).prize.data  == prize.data){
                                                                    ++cur_entity_num;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //  the entity item is no more today
                                                    if(cur_entity_num < max_entity_num){
                                                        var award_info = new Object();
                                                        award_info.device_guid = device_guid;
                                                        award_info.prize = prize;
                                                        random_prize_the_third_phase_wrapper.add_award(award_info);
                                                        //  win the prize
                                                        prize.replace_flag = 0;
                                                    }
                                                    else{
                                                        //  tell client use replace data
                                                        prize.replace_flag = 1;
                                                    }
                                                    var new_prize = copy_prize(prize);
                                                    gacha_array.push(new_prize);
                                                    callback(null);
                                                });
                                            }
                                            else{
                                                prize.replace_flag = 0;
                                                var new_prize = copy_prize(prize);
                                                gacha_array.push(new_prize);
                                                callback(null);
                                            }
                                        }else{
                                            prize = random_prize_the_third_phase_wrapper.random();
                                            var find = query_item(prize,gacha_result,gacha_array);
                                            if(find){
                                                prize.replace_flag = 1;
                                            }else{
                                                prize.replace_flag = 0;
                                            }
                                            var new_prize = copy_prize(prize);
                                            gacha_array.push(new_prize);
                                            //  no need replace at this condition
                                            callback(null);
                                        }
                                    }
                                }
                            },
                            function(callback){
                                for(var j = 0; j < activity.gacha2_random_num; ++j){
                                    prize = random_prize_the_third_phase_wrapper.random2();
                                    var find = query_item(prize,gacha_result,gacha_array);
                                    if(find){
                                        prize.replace_flag = 1;
                                    }else{
                                        prize.replace_flag = 0;
                                    }
                                    var new_prize = copy_prize(prize);
                                    gacha_array.push(new_prize);
                                }
                                gacha_result.push(gacha_array);
                                callback(null);
                            }
                        ],
                        // optional callback
                        function(err){
                            if(err){
                                console.error(err);
                            }
                            ++start;
                            callback(null);
                        }
                    );
                },
                function (err) {
                    //  whilst end,do nothing
                    if(err){
                        console.error(err);
                    }
                    if(0){
                        var gacha_count = 0;
                        for(var i = 0; i < gacha_result.length; ++i){
                            if(gacha_result[i]){
                                gacha_count += gacha_result[i].length;
                            }
                        }
                        console.log(gacha_count);
                    }
                    random_prize_the_third_phase_wrapper.set(device_guid,free_flag);
                    next(null, {
                        code: 0,
                        msg_id : msg.msg_id,
                        flowid : msg.flowid,
                        time:Math.floor(Date.now()/1000),
                        gacha_result : gacha_result
                    });
                }
            );
        });
    });
});
