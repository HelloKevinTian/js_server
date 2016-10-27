/**
 * Created by King Lee on 2014/8/5.
 */
var notice_template = require('../../config/notice_template');
var redis_notice_wrapper = require('../nosql/redis_notice_wrapper');

var notice_wrapper = function() {
    this.init(notice_template);
};

notice_wrapper.prototype.init = function(notice_template){
    redis_notice_wrapper.init_notice('template','1.2.0',notice_template);
};

notice_wrapper.prototype.get = function(channel,version,cb){
    redis_notice_wrapper.get_notice(channel,version,function(reply){
        if(reply){
            cb(JSON.parse(reply));
        }else{
            redis_notice_wrapper.get_notice('template',version,function(reply){
                if(reply) {
                    cb(JSON.parse(reply));
                }
                else{
                    cb(notice_template);
                }
            });
        }
    });
};

notice_wrapper.prototype.get_all = function(cb){
    redis_notice_wrapper.get_all_notice(function(reply){
        cb(reply);
    });
};

module.exports = notice_wrapper;