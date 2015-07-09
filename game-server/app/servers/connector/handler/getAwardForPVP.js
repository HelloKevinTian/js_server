/**
 * Created by King Lee on 2014/10/20.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_AWARD_FOR_PVP, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid ? msg.player_guid : msg.deviceid;
    var device_emui = msg.deviceid;
    var rank_pvp_wrapper = pomelo.app.get('rank_pvp_wrapper');
    var award_info;
    rank_pvp_wrapper.get_award(device_guid,function(reply){
        if(reply){
            award_info = JSON.parse(reply);
        }
        rank_pvp_wrapper.del_award(device_guid);
        next(null, {
            code: 0,
            msg_id: msg.msg_id,
            flowid: msg.flowid,
            award_info:award_info,
            time: Math.floor(Date.now() / 1000)
        });
    });
});