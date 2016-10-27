/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ 2016/10/25
 * @ 安趣登陆验证
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var util = require('../../../util/util');
var redis_pools = require("../../../nosql/redis_pools");

handlerMgr.handler(consts.TYPE_MSG.TYPE_ANQU_LOGIN_VERIFY, function(msg, session, next) {
    // uid: 用户身份统一标识识别码
    // vkey: sid的值
    // appid: cp应用ID
    // sign: 数据加密验证字符串  sign构成：md5(uid + vkey + appid + appsecret);

    var appId = 'G100369';
    var appsecret = '50a93cbd4d207fcb4c4df93710ff3d30';

    var postObj = {};
    postObj.uid = msg.uid;
    postObj.vkey = msg.vkey;
    postObj.appid = msg.appid;
    postObj.sign = util.md5('' + msg.uid + msg.vkey + msg.appid + appsecret);

    util.rr('http://i.anqu.com/index.php/user/checkUser', postObj, function(err, info) {
        console.log(err, info.body);

        next(null, {
            code: 0,
            msg_id: msg.msg_id,
            flowid: msg.flowid,
            result: info.body.status,
            time: Math.floor(Date.now() / 1000)
        });
    });

});