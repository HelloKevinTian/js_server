/**
 * Created by King Lee on 2014/11/4.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');

handlerMgr.handler(consts.TYPE_MSG.TYPE_UPDATE_PHONE_FOR_RUNNING_MAN, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.deviceid;
    var phone_number = msg.phone_number;
    var championship_id = util.getWeek(new Date());
    var rank_info = {
        channel:channel,
        version:version,
        phone_number:phone_number,
        championship_id:championship_id
    };
    var rank_running_man_wrapper = pomelo.app.get('rank_running_man_wrapper');
    rank_running_man_wrapper.update_rank_info(championship_id,device_guid,rank_info,function(reply){
        if(reply){
            //  do nothing
        }
        next(null, {
            code: 0,
            msg_id: msg.msg_id,
            flowid: msg.flowid,
            time: Math.floor(Date.now() / 1000)
        });
    });
});