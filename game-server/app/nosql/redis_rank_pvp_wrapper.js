/**
 * Created by King Lee on 2015/1/5.
 */
var redis_pools = require("../nosql/redis_pools");
var pomelo = require('pomelo');
var redis_rank_pvp_wrapper = module.exports;
var log4js = require('log4js');
var util = require('../util/util');
var log_json = require('../../config/log.json');
log4js.configure(log_json);
var rank_for_pvp_logger = log4js.getLogger('rank-for-pvp-logger');

var h_rank_pvp = 'h_rank_pvp';
var z_rank_pvp_score = 'z_rank_pvp_score';
var z_rank_pvp_strength = 'z_rank_pvp_strength';
var h_award_pvp = 'h_award_pvp';
var h_rank_pvp_cheat = 'h_rank_pvp_cheat';
var h_rank_pvp_cheat2 = 'h_rank_pvp_cheat2';
var h_rank_pvp_upload = 'h_rank_pvp_upload';

/**
 * 首次进入或者比赛完上传积分时设置排名信息
 * @param device_guid
 * @param rank_info
 */
redis_rank_pvp_wrapper.set_rank_info = function(channel, device_guid, rank_info, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_rank_pvp, device_guid, JSON.stringify(rank_info), function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
    var championship_id = util.getWeek(new Date());
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_rank_pvp + ":" + championship_id, device_guid, JSON.stringify(rank_info), function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
    if (pomelo.app.get('rank_pvp_wrapper').in_activity(channel)) {
        redis_pools.execute('pool_1', function(client, release) {
            client.hset(h_rank_pvp + ":" + channel, device_guid, JSON.stringify(rank_info), function(err, reply) {
                if (err) {
                    //  some thing log
                    rank_for_pvp_logger.error(err);
                }
                release();
            });
        });
    }
};

/**
 * get rank info form redis
 * @param device_guid
 * @param cb
 */
redis_rank_pvp_wrapper.get_rank_info = function(device_guid, device_emui, cb) {
    //  use device_guid first, if not exist,try device_emui
    redis_pools.execute('pool_1', function(client, release) {
        client.hget(h_rank_pvp, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            if (!reply) { //旧版本存的device_emui, 后来新版本换成device_guid作为key
                redis_pools.execute('pool_1', function(client, release) {
                    client.hget(h_rank_pvp, device_emui, function(err, reply) {
                        if (err) {
                            //  some thing log
                            rank_for_pvp_logger.error(err);
                        }
                        if (reply) {
                            //  copy data from device_emui to device_guid
                            var rank_info = JSON.parse(reply);
                            redis_rank_pvp_wrapper.set_rank_info(rank_info.channel, device_emui, rank_info, function() {});
                            rank_info.device_guid = device_guid;
                            redis_rank_pvp_wrapper.dump_rank_pvp(rank_info);
                            reply = JSON.stringify(rank_info);
                        }
                        cb(reply);
                        release();
                    });
                });
            } else {
                cb(reply);
            }
            release();
        });
    });
};

// 批量取出排名信息
redis_rank_pvp_wrapper.get_rank_info_batch = function(device_guid_array, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hmget(h_rank_pvp, device_guid_array, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//批量取出周排名信息
redis_rank_pvp_wrapper.get_rank_info_weekly_batch = function(championship_id, device_guid_array, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hmget(h_rank_pvp + ":" + championship_id, device_guid_array, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//批量取出活动排名信息
redis_rank_pvp_wrapper.get_rank_info_activity_batch = function(championship_id, device_guid_array, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hmget(h_rank_pvp + ":" + championship_id, device_guid_array, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//更新玩家地区、手机号、昵称信息
redis_rank_pvp_wrapper.update_rank_info = function(device_guid, device_emui, channel, area, phone_number, nickname, cb) {
    redis_rank_pvp_wrapper.get_rank_info(device_guid, device_emui, function(rank_info) {
        if (rank_info) {
            rank_info = JSON.parse(rank_info);
            rank_info.area = area;
            rank_info.phone_number = phone_number;
            rank_info.nickname = nickname;
            redis_rank_pvp_wrapper.set_rank_info(channel, device_guid, rank_info, function() {});
        }
        cb(rank_info);
    });
};

//更新单人pvp的总排名和周排名
redis_rank_pvp_wrapper.update_score_rank = function(channel, device_guid, championship_id, rank_info) {
    //  avoid score is 0 in redis
    if (0 != rank_info.score) {
        redis_pools.execute('pool_1', function(client, release) {
            client.zadd(z_rank_pvp_score, rank_info.score, device_guid, function(err, reply) {
                if (err) {
                    //  some thing log
                    rank_for_pvp_logger.error(err);
                }
                release();
            });
        });
    }
    //  avoid score_weekly is 0 in redis
    if (0 != rank_info.score_weekly) {
        redis_pools.execute('pool_1', function(client, release) {
            client.zadd(z_rank_pvp_score + ":" + championship_id, rank_info.score_weekly, device_guid, function(err, reply) {
                if (err) {
                    //  some thing log
                    rank_for_pvp_logger.error(err);
                }
                release();
            });
        });
    }
    if (pomelo.app.get('rank_pvp_wrapper').in_activity(channel)) {
        //  avoid score_activity is 0 in redis
        if (0 != rank_info.score_activity) {
            redis_pools.execute('pool_1', function(client, release) {
                client.zadd(z_rank_pvp_score + ":" + channel, rank_info.score_activity, device_guid, function(err, reply) {
                    if (err) {
                        //  some thing log
                        rank_for_pvp_logger.error(err);
                    }
                    release();
                });
            });
            //  if the channel is different from store in file, record it!
            if (channel != rank_info.channel) {
                redis_rank_pvp_wrapper.record_cheat2_info(channel, rank_info);
            }
        }
    }
    /*
    redis_pools.execute('pool_1',function(client, release) {
        client.hset(h_rank_pvp_upload,Date.now(), JSON.stringify(rank_info),function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
    */
};

//取单人总排名
redis_rank_pvp_wrapper.get_score_rank = function(device_guid, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.zrevrank(z_rank_pvp_score, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//取总榜前十排名
redis_rank_pvp_wrapper.get_score_rank_partial = function(cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.zrevrange(z_rank_pvp_score, 0, 9, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//取单人周排名
redis_rank_pvp_wrapper.get_score_rank_weekly = function(device_guid, championship_id, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.zrevrank(z_rank_pvp_score + ":" + championship_id, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//取单人渠道排名
redis_rank_pvp_wrapper.get_score_rank_activity = function(device_guid, channel, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.zrevrank(z_rank_pvp_score + ":" + channel, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//取周排行榜前十名
redis_rank_pvp_wrapper.get_score_rank_partial_weekly = function(championship_id, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.zrevrange(z_rank_pvp_score + ":" + championship_id, 0, 9, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//取周排行中某人前十名和后十名的device_guid和分数信息
redis_rank_pvp_wrapper.get_score_rank_partial_activity = function(device_guid, championship_id, cb) {
    redis_rank_pvp_wrapper.get_score_rank_weekly(device_guid, championship_id, function(mine_score_rank_weekly) {
        var score_rank_weekly = (mine_score_rank_weekly != null) ? parseInt(mine_score_rank_weekly) + 1 : mine_score_rank_weekly;
        var rank_range_low = (score_rank_weekly - 11) > 0 ? score_rank_weekly - 11 : 0;
        var rank_range_high = score_rank_weekly != null ? (score_rank_weekly + 9) : 9;
        redis_pools.execute('pool_1', function(client, release) {
            client.zrevrange(z_rank_pvp_score + ":" + championship_id, rank_range_low, rank_range_high, function(err, reply) {
                if (err) {
                    //  some thing log
                    rank_for_pvp_logger.error(err);
                }
                cb(reply);
                release();
            });
        });
    });
};

//取周排行的全部排名信息
redis_rank_pvp_wrapper.get_all_rank_info_weekly = function(championship_id, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hgetall(h_rank_pvp + ":" + championship_id, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//设置单人pvp奖励
redis_rank_pvp_wrapper.set_award = function(device_guid, award_info) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_award_pvp, device_guid, JSON.stringify(award_info), function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

//取单人pvp奖励信息
redis_rank_pvp_wrapper.get_award = function(device_guid, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hget(h_award_pvp, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//删除单人pvp奖励信息
redis_rank_pvp_wrapper.del_award = function(device_guid) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hdel(h_award_pvp, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

//更新单人pvp战力排行信息
redis_rank_pvp_wrapper.update_strength_rank = function(device_guid, strength) {
    redis_pools.execute('pool_1', function(client, release) {
        client.zadd(z_rank_pvp_strength, strength, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

//取单人pvp战力排行信息
redis_rank_pvp_wrapper.get_strength_rank = function(device_guid, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        client.rank(z_rank_pvp_strength, device_guid, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

//取特定数量的战力在一定区间的某些人的pvp战力信息
redis_rank_pvp_wrapper.get_player_by_strength = function(min, max, count, cb) {
    redis_pools.execute('pool_1', function(client, release) {
        //  offset form the first result
        var offset = 0;
        var args = [z_rank_pvp_strength, min, max, 'LIMIT', offset, count];
        client.zrangebyscore(args, function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

/**
 * dump rank info from device emui to device guid
 */
redis_rank_pvp_wrapper.dump_rank_pvp = function(rank_info) {
    var channel = rank_info.channel;
    var device_guid = rank_info.device_guid;
    var strength = rank_info.strength;
    var championship_id = util.getWeek(new Date());
    if (championship_id != rank_info.championship_id) {
        rank_info.score_weekly = 0;
    }
    redis_rank_pvp_wrapper.set_rank_info(channel, device_guid, rank_info, function() {});
    redis_rank_pvp_wrapper.update_score_rank(channel, device_guid, championship_id, rank_info);
    redis_rank_pvp_wrapper.update_strength_rank(device_guid, strength);
};

//pvp两次上传积分时间在45秒内的记录为作弊者
redis_rank_pvp_wrapper.record_cheat_info = function(device_guid, rank_info) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_rank_pvp_cheat, Date.now(), JSON.stringify(rank_info), function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

//特定渠道的活动作弊信息（不常用）
redis_rank_pvp_wrapper.record_cheat2_info = function(channel, rank_info) {
    redis_pools.execute('pool_1', function(client, release) {
        client.hset(h_rank_pvp_cheat2, Date.now() + ':' + channel, JSON.stringify(rank_info), function(err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};