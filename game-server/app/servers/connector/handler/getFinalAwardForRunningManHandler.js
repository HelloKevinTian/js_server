/**
 * Created by King Lee on 2015/3/5.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_FINAL_AWARD_FOR_RUNNING_MAN, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.deviceid;
    var rank_running_man_wrapper = pomelo.app.get('rank_running_man_wrapper');
    rank_running_man_wrapper.get_final_award_flag(device_guid,function(reply){
        if(reply){
            //  have got the award,just return null
            next(null, {
                code: 0,
                msg_id: msg.msg_id,
                flowid: msg.flowid,
                award_info:null,
                time: Math.floor(Date.now() / 1000)
            });
        }
        else{
            //  calc award
            rank_running_man_wrapper.calc_rival_seoul_final_award(channel,version,device_guid,function(rank_award){
                next(null, {
                    code: 0,
                    msg_id: msg.msg_id,
                    flowid: msg.flowid,
                    award_info:rank_award,
                    time: Math.floor(Date.now() / 1000)
                });
            });
        }
    });
});