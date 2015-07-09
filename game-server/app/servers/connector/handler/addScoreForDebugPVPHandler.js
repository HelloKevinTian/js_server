/**
 * Created by King Lee on 2015/1/19.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');

handlerMgr.handler(consts.TYPE_MSG.TYPE_ADD_SCORE_FOR_DEBUG_PVP, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var add_score = parseInt(msg.add_score);
    var device_guid = msg.player_guid ? msg.player_guid : msg.deviceid;
    var device_emui = msg.deviceid;
    var rank_pvp_wrapper = pomelo.app.get('rank_pvp_wrapper');
    rank_pvp_wrapper.get_rank_info(device_guid,device_emui,function(rank_info){
        if(rank_info){
            rank_info = JSON.parse(rank_info);
        }
        rank_info.score += add_score;
        rank_info.score_weekly += add_score;
        rank_pvp_wrapper.set_rank_info(channel,device_guid,rank_info,function(){});
        next(null, {
            code: 0,
            msg_id: msg.msg_id,
            flowid: msg.flowid,
            score:rank_info.score,
            time: Math.floor(Date.now() / 1000)
        });
    });
});