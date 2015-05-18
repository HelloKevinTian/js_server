/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ Date 	2015-05-13
 */
var handlerMgr = require("../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var entity_gacha_winner = require("../../../nosql/redis_entity_gacha_winner_wrapper");

var log4js = require("log4js");
var datelogger = log4js.getLogger("date_logger");

handlerMgr.handler(consts.TYPE_MSG.TYPE_ENTITY_GACHA_FLOW_WORD, function(msg, session, next) {
	datelogger.debug("msg:  " + JSON.stringify(msg));
	var channel = msg.channel;
    var version = msg.version;
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
	activity_wrapper.get(channel, version, function(activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_RANDOM_PRIZE_THE_SECOND_PHASE == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
                break;
            }
        }

		entity_gacha_winner.get_vals(function(reply){
			var virtual_str = activity.virtual_flow_word;
			var phone_num = [];
			var prize = [];
			var prize_time = [];
			var phone_nums = reply.reverse();
			var count = 0;
			for (var i = 0; i < phone_nums.length; i++) {
				if (phone_nums[i].length > 20 && count < 3) {
					var split_arr = phone_nums[i].split("@");

					phone_num.push(phone_nums[i].substr(7,4));
					prize_time.push(split_arr[2]);
					if (split_arr[1] == "5") {
						prize.push("f");
					} else if (split_arr[1] == "6") {
						prize.push("s");
					} else if (split_arr[1] == "7") {
						prize.push("m");
					} else if (split_arr[1] == "8") {
						prize.push("t");
					} else if (split_arr[1] == "9") {
						prize.push("p");
					}
					count++;
				}
			};
			for (var i = 0; i < phone_num.length; i++) {
				datelogger.debug("flow word " + phone_num[i] + " @ " + virtual_str + "@" + i);
			};
			next(null, {
	            code: 0,
	            msg_id: msg.msg_id,
	            flowid: msg.flowid,
	            time: Math.floor(Date.now() / 1000),
	            result: phone_num,
	            prize: prize,
	            prize_time: prize_time,
	            virtual_str: virtual_str
	        });
		});
    });
});