/**
 * Created by King Lee on 2015/1/5.
 */
var redis_rank_pvp_wrapper = require('../nosql/redis_rank_pvp_wrapper');
var cluster = require('cluster');
var pomelo = require('pomelo');
var async = require('async');
var util = require('../util/util');
var pvp_black_list_json = require('../../config/pvp_black_list.json');
var rank_for_pvp_json = require('../../config/rank_for_pvp.json');
var rival_vs_award_json = require('../../config/rival_vs_award');

var rank_pvp_wrapper = function() {
    this.time_interval = 1000*60;
    this.trigger_time_hour = 0;
    this.trigger_time_minutes = 0;
    this.championship_id = util.getWeek(new Date());
    for(var v in rank_for_pvp_json){
        if(v == "calc_award"){
            if(1 == rank_for_pvp_json[v]){
                this.tick();
            }
        }else if(v == "require_version"){
            this.require_version = rank_for_pvp_json[v];
        }
    }
};

rank_pvp_wrapper.prototype.tick = function() {
    var self = this;
    setInterval(function(){
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        if(hours == self.trigger_time_hour && minutes == self.trigger_time_minutes)
        {
            if (cluster.isMaster) {
                var championship_id_now = util.getWeek(new Date());
                if(self.championship_id != championship_id_now)
                {
                    //  give award
                    self.calc_rival_pvp_award(self.championship_id);
                    self.championship_id = championship_id_now;
                }
            }
        }
    },self.time_interval);
};

rank_pvp_wrapper.prototype.set_rank_info = function(channel,device_guid,rank_info,cb){
    redis_rank_pvp_wrapper.set_rank_info(channel,device_guid,rank_info,cb);
};

rank_pvp_wrapper.prototype.get_rank_info = function(device_guid,device_emui,cb){
    redis_rank_pvp_wrapper.get_rank_info(device_guid,device_emui,cb);
};

rank_pvp_wrapper.prototype.get_rank_info_batch = function(device_guid_array,cb){
    redis_rank_pvp_wrapper.get_rank_info_batch(device_guid_array,cb);
};

rank_pvp_wrapper.prototype.get_rank_info_weekly_batch = function(championship_id,device_guid_array,cb){
    redis_rank_pvp_wrapper.get_rank_info_weekly_batch(championship_id,device_guid_array,cb);
};

rank_pvp_wrapper.prototype.get_rank_info_activity_batch = function(championship_id,device_guid_array,cb){
    redis_rank_pvp_wrapper.get_rank_info_activity_batch(championship_id,device_guid_array,cb);
};

rank_pvp_wrapper.prototype.update_rank_info = function(device_guid,device_emui,channel,area,phone_number,nickname,cb){
    redis_rank_pvp_wrapper.update_rank_info(device_guid,device_emui,channel,area,phone_number,nickname,cb);
};

rank_pvp_wrapper.prototype.update_score_rank = function(channel,device_guid,championship_id,rank_info){
    redis_rank_pvp_wrapper.update_score_rank(channel,device_guid,championship_id,rank_info);
};

rank_pvp_wrapper.prototype.get_score_rank = function(device_guid,cb){
    redis_rank_pvp_wrapper.get_score_rank(device_guid,cb);
};

rank_pvp_wrapper.prototype.get_score_rank_partial = function(cb){
    redis_rank_pvp_wrapper.get_score_rank_partial(cb);
};

rank_pvp_wrapper.prototype.get_score_rank_weekly = function(device_guid,championship_id,cb){
    redis_rank_pvp_wrapper.get_score_rank_weekly(device_guid,championship_id,cb);
};

rank_pvp_wrapper.prototype.get_score_rank_activity = function(device_guid,channel,cb){
    redis_rank_pvp_wrapper.get_score_rank_activity(device_guid,channel,cb);
};

rank_pvp_wrapper.prototype.get_score_rank_partial_weekly = function(championship_id,cb){
    redis_rank_pvp_wrapper.get_score_rank_partial_weekly(championship_id,cb);
};

rank_pvp_wrapper.prototype.get_score_rank_partial_activity = function(device_guid,championship_id,cb){
    redis_rank_pvp_wrapper.get_score_rank_partial_activity(device_guid,championship_id,cb);
};

rank_pvp_wrapper.prototype.get_all_rank_info_weekly = function(championship_id,cb){
    redis_rank_pvp_wrapper.get_all_rank_info_weekly(championship_id,cb);
};

rank_pvp_wrapper.prototype.update_strength_rank = function(device_guid,strength){
    redis_rank_pvp_wrapper.update_strength_rank(device_guid,strength);
};

rank_pvp_wrapper.prototype.get_strength_rank = function(device_guid,cb){
    redis_rank_pvp_wrapper.get_strength_rank(device_guid,cb);
};

rank_pvp_wrapper.prototype.get_player_by_strength = function(min,max,count,cb){
    redis_rank_pvp_wrapper.get_player_by_strength(min,max,count,cb);
};

rank_pvp_wrapper.prototype.set_award = function(device_guid,award_info){
    redis_rank_pvp_wrapper.set_award(device_guid,award_info);
};

rank_pvp_wrapper.prototype.get_award = function(device_guid,cb){
    redis_rank_pvp_wrapper.get_award(device_guid,cb);
};

rank_pvp_wrapper.prototype.del_award = function(device_guid){
    redis_rank_pvp_wrapper.del_award(device_guid);
};

rank_pvp_wrapper.prototype.record_cheat_info = function(device_guid,rank_info){
    redis_rank_pvp_wrapper.record_cheat_info(device_guid,rank_info);
};

rank_pvp_wrapper.prototype.compare_version = function(client_version){
    var require_version_array = this.require_version.split('.');
    if(3 != require_version_array.length){
        return false;
    }
    var client_version_array = client_version.split('.');
    if(3 != client_version_array.length){
        return false;
    }
    if(parseInt(require_version_array[0])*100 + parseInt(require_version_array[1])*10 + parseInt(require_version_array[2]) >
        parseInt(client_version_array[0])*100 + parseInt(client_version_array[1])*10 + parseInt(client_version_array[2]) ){
        return false;
    }
    return true;
};

rank_pvp_wrapper.prototype.in_activity = function(channel){
    for(var v in rank_for_pvp_json){
        if("activity" == v){
            for(var i = 0; i < rank_for_pvp_json[v].length; ++i){
                if(channel == rank_for_pvp_json[v][i].channel){
                    var duration = rank_for_pvp_json[v][i].duration;
                    var start_time = duration[0];
                    var end_time = duration[1];
                    var start_time_array = start_time.split('/');
                    var end_time_array = end_time.split('/');
                    var start_time_year = parseInt(start_time_array[0]);
                    var start_time_month = parseInt(start_time_array[1]);
                    var start_time_date = parseInt(start_time_array[2]);
                    var end_time_year = parseInt(end_time_array[0]);
                    var end_time_month = parseInt(end_time_array[1]);
                    var end_time_date = parseInt(end_time_array[2]);
                    var time_start = new Date(start_time_year,(start_time_month - 1),start_time_date);
                    var time_end = new Date(end_time_year,(end_time_month - 1),end_time_date);
                    var time_now = Date.now();
                    if(time_now >= time_start.getTime() && time_now < time_end.getTime()){
                        return 1;
                    }
                }
            }
        }
    }
    return 0;
};

rank_pvp_wrapper.prototype.activity_switch = function(channel){
    var find = 0;
    for(var v in rank_for_pvp_json){
        if("activity" == v){
            for(var i = 0; i < rank_for_pvp_json[v].length; ++i){
                if(channel == rank_for_pvp_json[v][i].channel){
                    find = 1;
                }
            }
        }
    }
    if(find){
        for(var v in rank_for_pvp_json){
            if("activity_switch" == v){
                return rank_for_pvp_json[v];
            }
        }
    }
    return 0;
};

rank_pvp_wrapper.prototype.get_url = function(){
    for(var v in rank_for_pvp_json){
        if("url" == v){
            return rank_for_pvp_json[v];
        }
    }
    return "";
};

rank_pvp_wrapper.prototype.total_rank_switch = function(){
    for(var v in rank_for_pvp_json){
        if("total_rank_switch" == v){
            return rank_for_pvp_json[v];
        }
    }
    return 0;
};

rank_pvp_wrapper.prototype.maintaining_msg = function(){
    for(var v in rank_for_pvp_json){
        if("maintaining_msg" == v){
            return rank_for_pvp_json[v];
        }
    }
    return "";
};

rank_pvp_wrapper.prototype.block_msg = function(){
    for(var v in rank_for_pvp_json){
        if("block_msg" == v){
            return rank_for_pvp_json[v];
        }
    }
    return "";
};

/**
 * compatibility 2.3.0,it only uses device_emui
 * @param device_emui
 * @returns {number}
 */
rank_pvp_wrapper.prototype.in_black_list = function(device_emui){
    for(var i = 0; i < pvp_black_list_json.length; ++i){
        if(device_emui == pvp_black_list_json[i]){
            return 1;
        }
    }
    return 0;
};

rank_pvp_wrapper.prototype.calc_rival_pvp_award = function(championship_id){
    var rank_pvp_wrapper = pomelo.app.get('rank_pvp_wrapper');
    this.get_all_rank_info_weekly(championship_id,function(reply){
        var rank_joiner_list = reply;
        var device_version_channel_list = [];
        for(var v in rank_joiner_list){
            if(rank_joiner_list[v]){
                var rank_joiner = JSON.parse(rank_joiner_list[v]);
                if(rank_joiner){
                    var version = rank_joiner.version;
                    var channel = rank_joiner.channel;
                    device_version_channel_list.push({"device_guid":v,"version":version,"channel":channel});
                }
            }
        }
        var count = 0;
        async.whilst(
            function () { return count < device_version_channel_list.length; },
            function (callback) {
                async.waterfall([
                        function(callback){
                            //  1  get rank info
                            rank_pvp_wrapper.get_score_rank_weekly(device_version_channel_list[count].device_guid,championship_id,function(reply){
                                //  reply is null, that means user join in the the activity,but not upload score,it dangerous!
                                var rank = reply != null ? parseInt(reply) + 1: 999999;
                                var award = rival_vs_award_json;
                                var rank_award;
                                for(var w in award){
                                    var range = w;
                                    var range_array = range.split('-');
                                    var range_low = parseInt(range_array[0]);
                                    var range_high = parseInt(range_array[1]);
                                    if(rank >= range_low && rank < range_high){
                                        rank_award = award[w];
                                        callback(null,device_version_channel_list[count].device_guid,championship_id,rank,rank_award);
                                        break;
                                    }
                                }
                            });
                        },
                        function(device_guid,championship_id,rank,rank_award,callback){
                            //  2   set award data
                            var award_info = {};
                            award_info.championship_id = championship_id;
                            award_info.rank = rank;
                            award_info.rank_award = rank_award;
                            if(999999 != rank){
                                rank_pvp_wrapper.set_award(device_guid,award_info);
                            }
                            callback(null);
                        }
                    ],
                    // optional callback
                    function(err){
                        if(err){
                            console.error(err);
                        }
                        ++count;
                        callback(null);
                    });
            },
            function (err) {
                //  whilst end,do nothing
                if(err){
                    console.error(err);
                }
            }
        );
    });
};
module.exports = rank_pvp_wrapper;