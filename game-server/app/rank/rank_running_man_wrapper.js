/**
 * Created by King Lee on 2014/8/11.
 */
var redis_rank_running_man_wrapper = require('../nosql/redis_rank_running_man_wrapper');
var rival_seoul_json = require('../../config/rival_seoul');
var rival_seoul_boss_json = require('../../config/rival_seoul_boss');
var cluster = require('cluster');
var util = require('../util/util');
var consts = require("../util/consts");
var pomelo = require('pomelo');
var async = require('async');
var log4js = require('log4js');
var log_json = require('../../config/log.json');
var rank_for_ranning_man_json = require('../../config/rank_for_ranning_man.json');

log4js.configure(log_json);
var rank_logger = log4js.getLogger('rank-logger');

var rank_running_man_wrapper = function() {
    this.time_interval = 1000*60;
    this.trigger_time_hour = 0;
    this.trigger_time_minutes = 0;
    this.championship_id = util.getWeek(new Date());
    for(var v in rank_for_ranning_man_json){
        if(v == "calc_award"){
            if(1 == rank_for_ranning_man_json[v]){
                this.tick();
            }
        }
    }

};

rank_running_man_wrapper.prototype.tick = function() {
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
                    self.calc_rival_seoul_award(self.championship_id);
                    self.championship_id = championship_id_now;
                }
            }
        }
    },self.time_interval);
};

rank_running_man_wrapper.prototype.add_rank_info = function(championship_id,device_guid,is_add_score,finally_score,rank_info,cb){
    redis_rank_running_man_wrapper.add_rank_info(championship_id,device_guid,is_add_score,finally_score,rank_info,cb);
};

rank_running_man_wrapper.prototype.get_all_rank_info = function(championship_id,cb){
    redis_rank_running_man_wrapper.get_all_rank_info(championship_id,cb);
};

rank_running_man_wrapper.prototype.get_rank = function(championship_id,device_guid,cb){
    redis_rank_running_man_wrapper.get_rank(championship_id,device_guid,cb);
};

rank_running_man_wrapper.prototype.increase_level = function(championship_id,device_guid,increase_level_num){
    redis_rank_running_man_wrapper.increase_level(championship_id,device_guid,increase_level_num);
};

rank_running_man_wrapper.prototype.get_level = function(championship_id,device_guid,cb){
    redis_rank_running_man_wrapper.get_level(championship_id,device_guid,cb);
};

rank_running_man_wrapper.prototype.set_award = function(device_guid,award_info){
    redis_rank_running_man_wrapper.set_award(device_guid,award_info);
};

rank_running_man_wrapper.prototype.get_award = function(device_guid,cb){
    redis_rank_running_man_wrapper.get_award(device_guid,cb);
};

rank_running_man_wrapper.prototype.del_award = function(device_guid){
    redis_rank_running_man_wrapper.del_award(device_guid);
};

rank_running_man_wrapper.prototype.update_rank_info = function(championship_id,device_guid,rank_info,cb){
    redis_rank_running_man_wrapper.update_rank_info(championship_id,device_guid,rank_info,cb);
};

rank_running_man_wrapper.prototype.get_rival_seoul = function(activity,level,rivals){
    var rival_offset = parseInt(activity.rival_offset);
    var rival_seoul_array = new Array();
    //  the index have been random
    var rival_seoul_random_index_general = [];
    for(var i = 0 ; i < rivals; ){
        var rival_seoul_random_index = Math.floor(parseInt(level) + Math.random()*(rival_offset/*level + rival_offset - level*/));
        //  get rid of repetition
        var find_repetition = false;
        for(var j = 0; j < rival_seoul_random_index_general.length; ++j){
            if(rival_seoul_random_index_general[j] == rival_seoul_random_index){
                find_repetition = true;
                break;
            }
        }
        if(!find_repetition){
            rival_seoul_random_index_general.push(rival_seoul_random_index);
            ++i;
        }
        else{
            //  random again
            continue;
        }
        var rival_seoul = rival_seoul_json[(rival_seoul_random_index > rival_seoul_json.length ? rival_seoul_json.length: rival_seoul_random_index) - 1];
        if(rival_seoul){
            var rival_seoul_res = rival_seoul.res;
            var rival_seoul_res_sub = rival_seoul_res.substr(2,rival_seoul_res.length - 2);
            for(var v in activity){
                if(rival_seoul_res_sub == v){
                    var wight_total_rate = 0;
                    var wight_total_backup = 0;
                    var wight_array_rate = [];
                    for(var w in activity[v]){
                        wight_total_backup = wight_total_rate;
                        wight_total_rate += activity[v][w].rate;
                        wight_array_rate.push({"res":activity[v][w].res,"range":[wight_total_backup,wight_total_rate]});
                    }
                    var rival_seoul_config_random_value = Math.floor(Math.random()*wight_total_rate);
                    var rival_seoul_config_index = 0;
                    for(var m = 0; m < wight_array_rate.length; ++m){
                        if(rival_seoul_config_random_value >= wight_array_rate[m].range[0] && rival_seoul_config_random_value < wight_array_rate[m].range[1]){
                            rival_seoul_config_index = m;
                            break;
                        }
                    }
                    var rival_seoul_config_res = wight_array_rate[rival_seoul_config_index].res;
                    rival_seoul.res_real = rival_seoul_config_res;
                    rival_seoul_array.push(rival_seoul);
                    break;
                }
            }
        }
    }
    return rival_seoul_array;
};

/**
 * get the boss config index which is different invalid_index, no useless now!
 * @param level
 * @param rival_offset
 * @param invalid_index
 * @returns {*}
 */
rank_running_man_wrapper.prototype.random_rival_seoul_boss = function(level,rival_offset,invalid_index){
    var rival_seoul_random_index = level;
    var max_loop_count = rival_offset * 5;
    var current_loop_count = 0;
    do{
        rival_seoul_random_index = Math.floor(parseInt(level) + Math.random() * (rival_offset/*level + rival_offset - level*/));
        ++current_loop_count;
        if(current_loop_count >= max_loop_count){
            break;
        }
    }while(invalid_index == rival_seoul_random_index);
    return rival_seoul_random_index;
};

/**
 * get boss info by rule of random,
 * @param activity
 * @param level
 * @param invalid_index the random index which can not be used, to avoid change the old value for object reference
 * @returns {*}
 */
rank_running_man_wrapper.prototype.get_rival_seoul_boss = function(activity,level,invalid_index){
    var rival_offset = parseInt(activity.rival_offset);
    //  boss id 's level do not random
    var rival_seoul_random_index = level/*this.random_rival_seoul_boss(level,rival_offset,invalid_index)*/;
    var rival_seoul = rival_seoul_boss_json[(rival_seoul_random_index > rival_seoul_boss_json.length? rival_seoul_boss_json.length : rival_seoul_random_index) - 1];
    if (rival_seoul) {
        var wight_total_rate = 0;
        var wight_total_backup = 0;
        var wight_array_rate = [];
        var rival_seoul_config_random_value;
        var rival_seoul_config_index = 0;
        //  res
        var rival_seoul_res = rival_seoul.res;
        var rival_seoul_res_sub = rival_seoul_res.substr(2, rival_seoul_res.length - 2);
        for (var v in activity) {
            if (rival_seoul_res_sub == v) {
                wight_total_rate = 0;
                wight_total_backup = 0;
                wight_array_rate = [];
                for (var w in activity[v]) {
                    wight_total_backup = wight_total_rate;
                    wight_total_rate += activity[v][w].rate;
                    wight_array_rate.push({"res": activity[v][w].res, "range": [wight_total_backup, wight_total_rate]});
                }
                rival_seoul_config_random_value = Math.floor(Math.random() * wight_total_rate);
                rival_seoul_config_index = 0;
                for (var m = 0; m < wight_array_rate.length; ++m) {
                    if (rival_seoul_config_random_value >= wight_array_rate[m].range[0] && rival_seoul_config_random_value < wight_array_rate[m].range[1]) {
                        rival_seoul_config_index = m;
                        break;
                    }
                }
                var rival_seoul_config_res = wight_array_rate[rival_seoul_config_index].res;
                rival_seoul.res_real_next = rival_seoul_config_res;
                break;
            }
        }
        //  boss id
        var rival_seoul_boss_id = rival_seoul.bossid;
        var rival_seoul_boss_id_sub = rival_seoul_boss_id.substr(2, rival_seoul_boss_id.length - 2);
        for (var v in activity) {
            if (rival_seoul_boss_id_sub == v) {
                wight_total_rate = 0;
                wight_total_backup = 0;
                wight_array_rate = [];
                for (var w in activity[v]) {
                    wight_total_backup = wight_total_rate;
                    wight_total_rate += activity[v][w].rate;
                    wight_array_rate.push({"res": activity[v][w].res, "range": [wight_total_backup, wight_total_rate]});
                }
                rival_seoul_config_random_value = Math.floor(Math.random() * wight_total_rate);
                rival_seoul_config_index = 0;
                for (var m = 0; m < wight_array_rate.length; ++m) {
                    if (rival_seoul_config_random_value >= wight_array_rate[m].range[0] && rival_seoul_config_random_value < wight_array_rate[m].range[1]) {
                        rival_seoul_config_index = m;
                        break;
                    }
                }
                var rival_seoul_config_boss_id = wight_array_rate[rival_seoul_config_index].res;
                rival_seoul.bossid_real_next = rival_seoul_config_boss_id;
                break;
            }
        }
    }
    return rival_seoul;
};

rank_running_man_wrapper.prototype.composs_rival_seoul_boss = function(activity,level,boss_id,boss_res){
    var rival_offset = parseInt(activity.rival_offset);
    var rival_seoul_random_index = level/*Math.floor(parseInt(level) + Math.random() * (rival_offset))*/;
    var rival_seoul = rival_seoul_boss_json[(rival_seoul_random_index > rival_seoul_boss_json.length? rival_seoul_boss_json.length : rival_seoul_random_index) - 1];
    if (rival_seoul) {
        rival_seoul.res_real = boss_res;
        rival_seoul.bossid_real = boss_id;
    }
    return rival_seoul;
};

//  calc award at the end of championship
rank_running_man_wrapper.prototype.calc_rival_seoul_award = function(championship_id){
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    var rank_running_man_wrapper = pomelo.app.get('rank_running_man_wrapper');
    //  1   get version and channel first
    this.get_all_rank_info(championship_id,function(reply){
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
        var count = 1;
        async.whilst(
            function () { return count < device_version_channel_list.length; },
            function (callback) {
                //  2   get activity
                var activity = {};
                async.waterfall([
                        function(callback){
                            activity_wrapper.get(device_version_channel_list[count - 1].channel,device_version_channel_list[count - 1].version,function(activity_json) {
                                for (var w in activity_json) {
                                    if (consts.TYPE_ACTIVITY.RIVAL_SEOUL == parseInt(activity_json[w].type)) {
                                        activity = activity_json[w];
                                        callback(null,device_version_channel_list[count - 1].device_guid,activity);
                                    }
                                }
                            });
                        },
                        function(device_guid,activity,callback){
                            //  3  get rank info
                            rank_running_man_wrapper.get_rank(championship_id,device_guid,function(reply){
                                if(null == reply){
                                    rank_logger.error(device_guid);
                                }
                                //  reply is null, that means user join in the the activity,but not upload score,it dangerous!
                                var rank = reply[0] != null ? parseInt(reply[0]) + 1: 999999;
                                var award = activity.award;
                                var rank_award;
                                for(var w in award){
                                    var range = w;
                                    var range_array = range.split('-');
                                    var range_low = parseInt(range_array[0]);
                                    var range_high = parseInt(range_array[1]);
                                    if(rank >= range_low && rank < range_high){
                                        rank_award = award[w];
                                        callback(null,device_guid,championship_id,rank,rank_award);
                                        break;
                                    }
                                }
                            });
                        },
                        function(device_guid,championship_id,rank,rank_award,callback){
                            if(0){
                                rank_logger.debug(rank);
                            }
                            //  4   set award data
                            var award_info = {};
                            award_info.championship_id = championship_id;
                            award_info.rank = rank;
                            award_info.rank_award = rank_award;
                            rank_running_man_wrapper.set_award(device_guid,award_info);
                            callback(null);
                        }
                    ],
                    // optional callback
                    function(err){
                        if(err){
                            rank_logger.error(err);
                        }
                        ++count;
                        callback(null);
                    });

            },
            function (err) {
                //  whilst end,do nothing
                if(err){
                    rank_logger.error(err);
                }
            }
        );
    });
};
module.exports = rank_running_man_wrapper;