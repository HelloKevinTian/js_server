/**
 * Created by King Lee on 2015/1/8.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var async = require('async');
var rival_vs_title_json = require('../../../../config/rival_vs_title');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_RANK_PARTIAL_FOR_PVP, function (msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.player_guid ? msg.player_guid : msg.deviceid;
    var device_emui = msg.deviceid;
    var championship_id = util.getWeek(new Date());
    var activity = {};
    var activity_wrapper = pomelo.app.get('activity_wrapper');
    var rank_pvp_wrapper = pomelo.app.get("rank_pvp_wrapper");
    activity_wrapper.get(channel, version, function (activity_json) {
        for (var v in activity_json) {
            if (consts.TYPE_ACTIVITY.TYPE_PVP == parseInt(activity_json[v].type)) {
                activity = activity_json[v];
            }
        }
        var pvp_switch = activity.switch;
        if(rank_pvp_wrapper.in_black_list(device_emui)){
            pvp_switch = 0;
        }
        var maintaining_msg = rank_pvp_wrapper.maintaining_msg();
        async.parallel([
                function (callback) {
                    rank_pvp_wrapper.get_score_rank_partial_weekly(championship_id, function (reply) {
                        //  reply is rank as a json array
                        if (0 != reply.length) {
                            rank_pvp_wrapper.get_rank_info_weekly_batch(championship_id,reply, function (reply) {
                                callback(null, reply);
                            });
                        } else {
                            callback(null, []);
                        }
                    });
                },
                function (callback) {
                    rank_pvp_wrapper.get_score_rank_partial(function (reply) {
                        //  reply is rank as a json array
                        if (0 != reply.length) {
                            rank_pvp_wrapper.get_rank_info_batch(reply, function (reply) {
                                callback(null, reply);
                            });
                        } else {
                            callback(null, []);
                        }
                    });
                },
                function (callback) {
                    //  update 2015/3/9, the activity is rank score weekly,from (my rank - 10) to (my rank  + 10)
                    rank_pvp_wrapper.get_score_rank_partial_activity(device_guid,championship_id,function (reply) {
                        //  reply is rank as a json array
                        if (0 != reply.length) {
                            rank_pvp_wrapper.get_rank_info_activity_batch(championship_id,reply, function (reply) {
                                var rank_info_array = reply;
                                //  get week rank
                                var count = 0;
                                async.whilst(
                                    function () { return count < rank_info_array.length; },
                                    function (callback_whilst) {
                                        async.waterfall([
                                                function(callback_whilst){
                                                    rank_pvp_wrapper.get_score_rank_weekly(JSON.parse(rank_info_array[count]).device_guid,championship_id,function(cur_rank){
                                                        callback_whilst(null,cur_rank);
                                                    })
                                                },
                                                function(cur_rank,callback_whilst){
                                                    var rank_info_tmp = JSON.parse(rank_info_array[count]);
                                                    rank_info_tmp.rank = cur_rank;
                                                    rank_info_array[count] = JSON.stringify(rank_info_tmp);
                                                    callback_whilst(null);
                                                }
                                            ],
                                            // optional callback
                                            function(err){
                                                if(err){
                                                    console.error(err);
                                                }
                                                ++count;
                                                callback_whilst(null);
                                            });
                                    },
                                    function (err) {
                                        //  whilst end,do nothing
                                        if(err){
                                            console.error(err);
                                        }
                                        callback(null, rank_info_array);
                                    }
                                );
                            });
                        } else {
                            callback(null, []);
                        }
                    });
                },
                function (callback) {
                    rank_pvp_wrapper.get_score_rank_weekly(device_guid, championship_id, function (reply) {
                        callback(null, reply);
                    });
                },
                function (callback) {
                    rank_pvp_wrapper.get_score_rank(device_guid, function (reply) {
                        callback(null, reply);
                    });
                },
                function (callback) {
                    rank_pvp_wrapper.get_score_rank_activity(device_guid,channel,function (reply) {
                        callback(null, reply);
                    });
                }
            ],
            // optional callback
            function (err, result) {
                if (err) {
                    console.error(err);
                }
                if (0) {
                    console.log("%j", result[1]);
                }
                var rank_info_array_weekly = result[0];
                var rank_info_array = result[1];
                var rank_info_array_activity = result[2];
                var mine_score_rank_weekly = result[3];
                var mine_score_rank = result[4];
                var mine_score_rank_activity = result[5];
                var score_rank_array = [];
                var score_rank_array_weekly = [];
                var score_rank_array_activity = [];
                var degree;
                var degree_title;
                for (var i = 0; i < rank_info_array.length; ++i) {
                    if (rank_info_array[i]) {
                        var rank_info = JSON.parse(rank_info_array[i]);
                        if (rank_info) {
                            for (var v in rival_vs_title_json) {
                                if (rival_vs_title_json[v].score <= rank_info.score) {
                                    degree_title = rival_vs_title_json[v].title;
                                    degree = rival_vs_title_json[v].grade;
                                }
                            }
                        }
                        score_rank_array.push({
                            driver_id: rank_info.racer,
                            car_id: rank_info.car,
                            nickname: rank_info.nickname,
                            degree_title: degree_title,
                            area: rank_info.area,
                            rank: i + 1,
                            score: rank_info.score
                        })
                    }
                }
                for (var i = 0; i < rank_info_array_weekly.length; ++i) {
                    if (rank_info_array_weekly[i]) {
                        var rank_info = JSON.parse(rank_info_array_weekly[i]);
                        if (rank_info) {
                            for (var v in rival_vs_title_json) {
                                if (rival_vs_title_json[v].score <= rank_info.score) {
                                    degree_title = rival_vs_title_json[v].title;
                                    degree = rival_vs_title_json[v].grade;
                                }
                            }
                        }
                        score_rank_array_weekly.push({
                            driver_id: rank_info.racer,
                            car_id: rank_info.car,
                            nickname: rank_info.nickname,
                            degree_title: degree_title,
                            area: rank_info.area,
                            rank: i + 1,
                            score: rank_info.score_weekly
                        })
                    }
                }
                for (var i = 0; i < rank_info_array_activity.length; ++i) {
                    if (rank_info_array_activity[i]) {
                        var rank_info = JSON.parse(rank_info_array_activity[i]);
                        if (rank_info) {
                            for (var v in rival_vs_title_json) {
                                if (rival_vs_title_json[v].score <= rank_info.score) {
                                    degree_title = rival_vs_title_json[v].title;
                                    degree = rival_vs_title_json[v].grade;
                                }
                            }
                        }
                        score_rank_array_activity.push({
                            driver_id: rank_info.racer,
                            car_id: rank_info.car,
                            nickname: rank_info.nickname,
                            degree_title: degree_title,
                            area: rank_info.area,
                            rank: rank_info.rank + 1,
                            score: rank_info.score_weekly
                        })
                    }
                }
                //  mask word,so complicated!
                var count_score_rank = 0;
                var count_score_rank_weekly = 0;
                var count_score_rank_activity = 0;
                async.parallel([
                        function (callback) {
                            async.whilst(
                                function () {return count_score_rank < score_rank_array.length;},
                                function (whilst_callback) {
                                    async.waterfall([
                                            function (waterfall_callback) {
                                                pomelo.app.get('mask_word_wrapper').analysis(score_rank_array[count_score_rank].nickname, function (nickname_new) {
                                                    score_rank_array[count_score_rank].nickname = nickname_new;
                                                    waterfall_callback(null);
                                                });
                                            }
                                        ],
                                        function (err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            ++count_score_rank;
                                            whilst_callback(null);
                                        }
                                    );
                                },
                                function (err) {
                                    //  whilst end,do nothing
                                    if (err) {
                                        console.error(err);
                                    }
                                    callback(null);
                                }
                            );
                        },
                        function (callback) {
                            async.whilst(
                                function () {return count_score_rank_weekly < score_rank_array_weekly.length;},
                                function (whilst_callback) {
                                    async.waterfall([
                                            function (waterfall_callback) {
                                                pomelo.app.get('mask_word_wrapper').analysis(score_rank_array_weekly[count_score_rank_weekly].nickname, function (nickname_new) {
                                                    score_rank_array_weekly[count_score_rank_weekly].nickname = nickname_new;
                                                    waterfall_callback(null);
                                                });
                                            }
                                        ],
                                        function (err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            ++count_score_rank_weekly;
                                            whilst_callback(null);
                                        }
                                    );
                                },
                                function (err) {
                                    //  whilst end,do nothing
                                    if (err) {
                                        console.error(err);
                                    }
                                    callback(null);
                                }
                            );
                        },
                        function (callback) {
                            async.whilst(
                                function () {return count_score_rank_activity < score_rank_array_activity.length;},
                                function (whilst_callback) {
                                    async.waterfall([
                                            function (waterfall_callback) {
                                                pomelo.app.get('mask_word_wrapper').analysis(score_rank_array_activity[count_score_rank_activity].nickname, function (nickname_new) {
                                                    score_rank_array_activity[count_score_rank_activity].nickname = nickname_new;
                                                    waterfall_callback(null);
                                                });
                                            }
                                        ],
                                        function (err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            ++count_score_rank_activity;
                                            whilst_callback(null);
                                        }
                                    );
                                },
                                function (err) {
                                    //  whilst end,do nothing
                                    if (err) {
                                        console.error(err);
                                    }
                                    callback(null);
                                }
                            );
                        }
                    ],
                    // optional callback
                    function (err, results) {
                        // the results array will equal ['rank','score','phone_number',rank_total_count]
                        next(null, {
                            code: 0,
                            msg_id: msg.msg_id,
                            flowid: msg.flowid,
                            time: Math.floor(Date.now() / 1000),
                            score_rank_array: score_rank_array,
                            score_rank_array_weekly: score_rank_array_weekly,
                            score_rank_array_activity: score_rank_array_activity,
                            mine_score_rank: mine_score_rank != null ? parseInt(mine_score_rank) + 1 : mine_score_rank,
                            mine_score_rank_weekly: mine_score_rank_weekly != null ? parseInt(mine_score_rank_weekly) + 1 : mine_score_rank_weekly,
                            mine_score_rank_activity: mine_score_rank_weekly != null ? parseInt(mine_score_rank_weekly) + 1 : mine_score_rank_weekly,
                            pvp_switch: pvp_switch,
                            maintaining_msg:maintaining_msg
                        });
                    });
            }
        );
    });
});