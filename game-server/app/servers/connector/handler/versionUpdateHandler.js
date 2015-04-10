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
        var max_version;
        if(notice_json){
            for(var w in notice_json){
                if(w == cur_version_channel || w == cur_version_template){
                    version_update_info = JSON.parse(notice_json[w]);
                }
            }
            for(var v in notice_json){
                var version_temp = v.split(':');
                var version_temp_array = version_temp[1].split('.');
                if(version_temp_array.length == 3){
                    if(!max_version){
                        max_version = parseInt(version_temp_array[0])*100 + parseInt(version_temp_array[1])*10 + parseInt(version_temp_array[2]);
                        version_update_info.real_update_url = JSON.parse(notice_json[v]).update_url;
                    }else{
                        var temp = parseInt(version_temp_array[0])*100 + parseInt(version_temp_array[1])*10 + parseInt(version_temp_array[2]);
                        if( temp > max_version){
                            max_version = temp;
                            version_update_info.real_update_url = JSON.parse(notice_json[v]).update_url;
                        }
                    }
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
            real_update_url:version_update_info.real_update_url
        });
    });
});