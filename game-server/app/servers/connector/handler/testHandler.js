/**
 * Created by King Lee on 2014/5/9.
 */

var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
handlerMgr.handler(consts.TYPE_MSG.TYPE_MSG_BEGIN, function(msg, session, next) {
    next(null, {code: 200, msg: 'test.'});
});
