/**
 * Created by King Lee on 2014/9/16.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var gacha_json = require('../../../../config/gacha.json');
var gacha_replace_json = require('../../../../config/gacha_replace.json');

handlerMgr.handler(consts.TYPE_MSG.TYPE_RANDOM_PRIZE, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid;
    var single_gacha = msg.single_gacha;
    var random_prize_wrapper = pomelo.app.get('random_prize_wrapper');
    var count = 0;
    var gacha_result = [];
    if(single_gacha == "true" ){
        count = 1;
    }
    else{
        count = 12;
    }
    var current_card = 0;
    var last_current_card = 0;
    var reward_car = 0;
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    activity_wrapper.get(channel,version,function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
                break;
            }
        }
        //  random prize
        random_prize_wrapper.get(device_guid,function(reply){
            if(null != reply){
                current_card = JSON.parse(reply).current_card;
                last_current_card = current_card;
            }
            for(var i = 0; i < count; ++i){
                var gacha_array = new Array();
                for(var j = 0; j < activity.gacha_random_num; ++j){
                    //  random a card when first
                    if(0 == current_card){
                        current_card += gacha_json[0].number;
                        gacha_array.push(gacha_json[0]);
                        continue;
                    }
                    var prize = random_prize_wrapper.random();
                    if(!prize){
                        continue;
                    }
                    if(prize.type == "TICKET"){
                        //  if the current card is more than total_card, give something instead of card
                        if(current_card < activity.total_card){
                            current_card += prize.number;
                            if(current_card > activity.total_card){
                                current_card = activity.total_card;
                            }
                            //  then the current card is equal total_card,give a car as award
                            if(current_card == activity.total_card){
                                reward_car = activity.reward_car;
                            }
                        }else{
                            // give something other(use gacha_replace_json 1,2,3 instead gacha_json 1,2,3)
                            prize = gacha_replace_json[prize.id - 1];
                        }
                    }
                    gacha_array.push(prize);
                }
                for(var j = 0; j < activity.gacha2_random_num; ++j){
                    var prize = random_prize_wrapper.random2();
                    if(prize){
                        gacha_array.push(prize);
                    }
                }
                gacha_result.push(gacha_array);
            }
            if(current_card <= activity.total_card && last_current_card != current_card){
                random_prize_wrapper.set(device_guid,current_card);
            }
            //  test code
            if(0){
                var gacha_result_string = JSON.stringify(gacha_result);
                try{
                    JSON.parse(gacha_result_string);
                }
                catch (e){
                    console.log(e.name  + ":" +  e.message);
                }
            }
            next(null, {
                code: 0,
                msg_id : msg.msg_id,
                flowid : msg.flowid,
                time:Math.floor(Date.now()/1000),
                gacha_result : gacha_result,
                current_card : current_card,
                reward_car : reward_car
            });
        });

    });
});
