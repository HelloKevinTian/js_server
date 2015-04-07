/**
 * Created by King Lee on 2014/8/5.
 */

var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_NOTICE, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var notice_wrapper = pomelo.app.get('notice_wrapper');
    notice_wrapper.get(channel,version,function(notice_json){
        next(null, {
            code: 0,
            msg_id : msg.msg_id,
            flowid : msg.flowid,
            time:Math.floor(Date.now()/1000),
            notice:notice_json
        });
    });
});