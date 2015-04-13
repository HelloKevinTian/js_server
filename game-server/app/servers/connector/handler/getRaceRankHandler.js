/**
 * Created by King Lee on 2014/8/11.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_RACE_RANK, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.deviceid;
    var championship_id = msg.championship_id;
    var rank_wrapper = pomelo.app.get('rank_wrapper');
    rank_wrapper.get_rank(championship_id,device_guid,function(reply){
        next(null, {
            code: 0,
            msg_id: msg.msg_id,
            flowid: msg.flowid,
            rank:reply != null ? parseInt(reply) + 1: reply,
            time: Math.floor(Date.now() / 1000)
        });
    });
});