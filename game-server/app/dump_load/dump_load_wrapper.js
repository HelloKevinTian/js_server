/**
 * Created by King Lee on 2014/11/7.
 */
var redis_random_prize_wrapper = require('../nosql/redis_random_prize_wrapper');
var redis_activity_wrapper = require('../nosql/redis_activity_wrapper');
var redis_notice_wrapper = require('../nosql/redis_notice_wrapper');
var redis_rank_wrapper = require('../nosql/redis_rank_wrapper');

var dump_load_wrapper = function() {
    if(0){
        this.dump_load();
    }
};

dump_load_wrapper.prototype.dump_load = function(){

    redis_random_prize_wrapper.dump_load();
    redis_activity_wrapper.dump_load();
    redis_notice_wrapper.dump_load();
    redis_rank_wrapper.dump_load();
};

module.exports = dump_load_wrapper;