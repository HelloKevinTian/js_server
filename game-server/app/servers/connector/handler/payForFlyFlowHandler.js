/**
 * Created by King Lee on 2014/10/14.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_PAY_FOR_FLY_FLOW, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var orderid = msg.orderid;
    var fly_flow_wrapper = pomelo.app.get('fly_flow_wrapper');
    fly_flow_wrapper.get(orderid,function(reply){
        var order_info = JSON.parse(reply);
        next(null, {
            code: 0,
            msg_id: msg.msg_id,
            flowid: msg.flowid,
            ret:order_info.ret,
            time: Math.floor(Date.now() / 1000)
        });
    });
});