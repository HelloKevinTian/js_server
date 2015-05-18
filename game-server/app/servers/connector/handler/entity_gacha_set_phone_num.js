/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ Date 	2015-05-13
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var entity_gacha_winner = require("../../../nosql/redis_entity_gacha_winner_wrapper");
var async = require("async");

var log4js = require("log4js");
var datelogger = log4js.getLogger("date_logger");

handlerMgr.handler(consts.TYPE_MSG.TYPE_ENTITY_GACHA_SET_PHONE_NUM, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid;
    var phone_num = msg.phone_num;

    entity_gacha_winner.get_keys(function(reply) {
        var players = reply.reverse();
        var result = 1;
        var count = 0;

        async.whilst(
            function() {
                return count < players.length;
            },
            function(callback) {
                if (players[count].indexOf(device_guid.toString()) > -1) {
                    entity_gacha_winner.get(players[count], function(ret) {
                        if (ret != null && ret.length < 20) {
                            result = 0;
                            entity_gacha_winner.set(players[count], phone_num.toString() + "@" + ret);
                        }
                        count++;
                        callback();
                    });
                } else {
                    count++;
                    callback();
                }
            },
            function(err) {
                if (err) {
                    console.error(err);
                }
                datelogger.debug("@result: " + result.toString() + "@phone_num: " + phone_num.toString() + "@guid:  " + device_guid.toString());
                next(null, {
                    code: 0,
                    msg_id: msg.msg_id,
                    flowid: msg.flowid,
                    time: Math.floor(Date.now() / 1000),
                    result: result
                });
            }
        );


    });
});