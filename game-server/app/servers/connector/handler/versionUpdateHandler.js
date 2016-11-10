/**
 * Created by King Lee on 2014/12/16.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');

handlerMgr.handler(consts.TYPE_MSG.TYPE_VERSION_UPDATE, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var notice_wrapper = pomelo.app.get('notice_wrapper');
    notice_wrapper.get_all(function(notice_json){
        var cur_version_channel = channel + ":" + version;
        var cur_version_template = "template" + ":" + version;
        var version_update_info;
        // var max_version;
        if(notice_json){
            version_update_info = JSON.parse(notice_json[cur_version_template]);
            for(var w in notice_json){
                if(w === cur_version_channel){
                    version_update_info = JSON.parse(notice_json[w]);
                }
            }
        }

        next(null, {
            code: 0,
            msg_id : msg.msg_id,
            flowid : msg.flowid,
            time:Math.floor(Date.now()/1000),
            update:version_update_info.update,
            force_update:version_update_info.force_update,
            real_update_url:version_update_info.update_url
        });
    });
});