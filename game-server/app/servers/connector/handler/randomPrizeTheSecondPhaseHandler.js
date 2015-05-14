/**
 * Created by King Lee on 2014/9/16.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var specialPrizeFlag = require("../../../nosql/redis_special_prize_flag");
var entity_gacha_info = require("../../../nosql/redis_entity_gacha_info_wrapper");
var entity_gacha_winner = require("../../../nosql/redis_entity_gacha_winner_wrapper");

var log4js = require("log4js");
var datelogger = log4js.getLogger("date_logger");

handlerMgr.handler(consts.TYPE_MSG.TYPE_RANDOM_PRIZE_THE_SECOND_PHASE, function(msg, session, next) {
    datelogger.debug("msg:  " + JSON.stringify(msg));
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid;
    var single_gacha = msg.single_gacha;
    var random_prize_the_second_phase_wrapper = pomelo.app.get('random_prize_the_second_phase_wrapper');
    var count = 0;
    var gacha_result = [];
    if (single_gacha == "true") {
        count = 1;
    } else {
        count = 12;
    }
    var free_flag = 1;
    var count_index = null;
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');

    activity_wrapper.get(channel, version, function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_SECOND_PHASE == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
                break;
            }
        }
        //  random prize
        random_prize_the_second_phase_wrapper.get(device_guid, function(reply) {
            if (null != reply) {
                free_flag = JSON.parse(reply)
            }
            //  if is single random prize, free_flag set zero
            if (1 == free_flag && single_gacha == "true") {
                free_flag = 0;
            }

            //1.0.3版本加入实物抽奖
            if (version === "2.2.3" || version === "1.0.3") {
                get_prize(device_guid,count_index,count,random_prize_the_second_phase_wrapper,activity,gacha_result,free_flag,msg,next,"1.0.3")
            } else if (version === "2.2.2" || version === "1.0.2") {
                get_prize(device_guid,count_index,count,random_prize_the_second_phase_wrapper,activity,gacha_result,free_flag,msg,next,"1.0.2");
            } else { //1.0.2版本以前的抽奖规则
                for (var i = 0; i < count; ++i) {
                    var gacha_array = new Array();
                    for (var j = 0; j < activity.gacha_random_num; ++j) {
                        var prize = random_prize_the_second_phase_wrapper.random();
                        if (!prize) {
                            continue;
                        }
                        gacha_array.push(prize);
                    }
                    for (var j = 0; j < activity.gacha2_random_num; ++j) {
                        var prize = random_prize_the_second_phase_wrapper.random2();
                        if (!prize) {
                            continue;
                        }
                        gacha_array.push(prize);
                    }
                    gacha_result.push(gacha_array);
                }
                random_prize_the_second_phase_wrapper.set(device_guid, free_flag);
                next(null, {
                    code: 0,
                    msg_id: msg.msg_id,
                    flowid: msg.flowid,
                    time: Math.floor(Date.now() / 1000),
                    gacha_result: gacha_result,
                    use_ticket: msg.use_ticket
                });
            }

        });
    });
});

function get_prize(device_guid,count_index,count,random_prize_the_second_phase_wrapper,activity,gacha_result,free_flag,msg,next,version) {
    specialPrizeFlag.get(device_guid, function(replyData) {
        if (null != replyData) {
            count_index = JSON.parse(replyData)
        }

        entity_gacha_info.getall(function(reply){
            var gacha_info;
            if (reply != null) {
                gacha_info = reply;
            }

            var entity_prize_has_win;  //连抽中已经获得一次实物奖品的标识，不能获得更多次
            if (count > 1) {//连抽
                entity_prize_has_win = 0;
            }

            for (var i = 0; i < count; ++i) {
                var gacha_array = new Array();
                var tempValue = 0;
                if (null === count_index) { //第一次特殊奖励json3
                    //first time
                    count_index = 2
                    var prize = random_prize_the_second_phase_wrapper.random3();
                    if (!prize) {
                        continue;
                    }
                    gacha_array.push(prize);
                } else if (count_index === 3) { //第三次特殊奖励json3
                    //third time
                    count_index++;
                    var prize = random_prize_the_second_phase_wrapper.random3();
                    if (!prize) {
                        continue;
                    }
                    gacha_array.push(prize);
                    gacha_array.push(prize);
                    tempValue = -1;
                } else {
                    if (count_index === 2) { //只有1,2,3会自增1,以后count_index恒定为4
                        count_index++;
                    }
                    for (var j = 0; j < activity.gacha_random_num; ++j) {
                        var prize;
                        if (version === "1.0.2") {
                            prize = random_prize_the_second_phase_wrapper.random4();
                        } else if (version === "1.0.3") {
                            if (entity_prize_has_win != null) {
                                if (entity_prize_has_win === 0) {
                                    prize = get_entity_prize(activity,device_guid,random_prize_the_second_phase_wrapper,gacha_info);
                                    entity_prize_has_win = 1;
                                } else {
                                    prize = random_prize_the_second_phase_wrapper.random4();
                                }
                            } else {
                                prize = get_entity_prize(activity,device_guid,random_prize_the_second_phase_wrapper,gacha_info);
                            }
                        }

                        if (!prize) {
                            continue;
                        }
                        gacha_array.push(prize);
                    }
                }

                for (var j = 0; j < (activity.gacha2_random_num + tempValue); ++j) {
                    var prize = random_prize_the_second_phase_wrapper.random2();
                    if (!prize) {
                        continue;
                    }
                    gacha_array.push(prize);
                }

                gacha_result.push(gacha_array);
            }

            random_prize_the_second_phase_wrapper.set(device_guid, free_flag);
            specialPrizeFlag.set(device_guid, count_index);
            next(null, {
                code: 0,
                msg_id: msg.msg_id,
                flowid: msg.flowid,
                time: Math.floor(Date.now() / 1000),
                gacha_result: gacha_result,
                use_ticket: msg.use_ticket == "true" ? "1" : "0"
            });
        })

    });
}

function get_entity_prize(activity,device_guid,random_prize_the_second_phase_wrapper,gacha_info){
    var entity_startTime = activity.entity_startTime;
    var entity_endTime = activity.entity_endTime;
    var entity_unit_type = activity.entity_unit_type;
    var entity_unit_time = activity.entity_unit_time;
    var entity_unit_num = activity.entity_unit_num;
    var entity_total_num = activity.entity_total_num;
    var entity_json_item_weight = activity.entity_json_item_weight;

    var entity_startTime_date = new Date(entity_startTime);
    var entity_endTime_date = new Date(entity_endTime);
    var now_date = new Date();

    //三个时间戳 活动开始时间 活动结束时间  当前抽奖时间
    var entity_startTime_stamp = entity_startTime_date.getTime();
    var entity_endTime_stamp = entity_endTime_date.getTime();
    var now_stamp = Date.now();

    //是否在活动时间内
    if (now_stamp >= entity_startTime_stamp && now_stamp <= entity_endTime_stamp) {
        //抽中，存玩家guid，item_type
        //设置手机号时  更新redis   phone_num_item_type
        //跑马取数据时 hvals  arr.reverse()
        var entity_prize_win_flag = false; //抽中实物奖励标识

        for (var i = 0;i < entity_unit_type.length;i++) {
            var item_type = entity_unit_type[i]; //服务器特有的实物类型唯一标识
            var unit_time = entity_unit_time[i]; //m小时产n个奖品的m值
            var unit_num = entity_unit_num[i]; //m小时产n个奖品的n值
            var total_num = entity_total_num[i]; //该奖品理论产出最大值

            var used_prize_num = 0; //已抽中的数量
            if (gacha_info != null) {
                var item_type_str = item_type.toString();
                used_prize_num = gacha_info[item_type_str];
            }

            var n = Math.ceil((now_stamp - entity_startTime_stamp) / unit_time); //已过n个单位时间
            var all_prize_num = n * unit_num; //理论产出值
            if (all_prize_num >= total_num) {
                all_prize_num = total_num;
            }

            var cur_prize_num = all_prize_num - used_prize_num; //理论剩余奖品值

            if (cur_prize_num > 0) {
                var get_weight = entity_json_item_weight[i]; //抽中概率
                var random_val = Math.random();
                if (random_val < get_weight) {
                    //抽中了！！！
                    entity_prize_win_flag = true;
                    entity_gacha_info.set(item_type,++used_prize_num);  //更新redis，此奖品已被抽中的次数存库

                    var year = now_date.getFullYear();
                    var month = now_date.getMonth() + 1;
                    var day = now_date.getDate();
                    var date_str = year.toString() + "/" + month.toString() + "/" + day.toString();

                    entity_gacha_winner.set(device_guid.toString() + "_" + now_date.toString(),item_type.toString() + "_" + date_str);     //哪个人抽到哪个奖品存库
                    //log
                    datelogger.debug("winner get prize! :" + device_guid.toString() + "@" + now_date.toString() + "@" + item_type.toString());
                    if (item_type === consts.TYPE_ENTITY_PRIZE.TYPE_PHONE_CHARGE) {
                        return random_prize_the_second_phase_wrapper.random5();
                    } else if (item_type === consts.TYPE_ENTITY_PRIZE.TYPE_SHOPPING_CARD) {
                        return random_prize_the_second_phase_wrapper.random6();
                    } else if (item_type === consts.TYPE_ENTITY_PRIZE.TYPE_CAR_MODEL) {
                        return random_prize_the_second_phase_wrapper.random7();
                    } else if (item_type === consts.TYPE_ENTITY_PRIZE.TYPE_MOBILE) {
                        return random_prize_the_second_phase_wrapper.random8();
                    } else if (item_type === consts.TYPE_ENTITY_PRIZE.TYPE_PAD) {
                        return random_prize_the_second_phase_wrapper.random9();
                    }
                }
            }
            if ((i === entity_unit_type.length - 1) && !entity_prize_win_flag) {
                return random_prize_the_second_phase_wrapper.random4();
            }
        }
    } else {
        //不在实物抽奖活动时间内(1.0.3新功能)  取1.0.2的抽奖
        return random_prize_the_second_phase_wrapper.random4();
    }
}