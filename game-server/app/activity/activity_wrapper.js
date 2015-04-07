/**
 * Created by King Lee on 2014/7/14.
 */
var activity_templete = require('../../config/activity_templete');
var redis_activity_wrapper = require('../nosql/redis_activity_wrapper');

var activity_wrapper = function() {
    //  init once
    if(1)
    {
        this.init(activity_templete);
    }
};

activity_wrapper.prototype.init = function(activity_template){
    redis_activity_wrapper.init_activity('template','2.4.0',activity_template);
    redis_activity_wrapper.init_activity('template','2.3.0',activity_template);
    redis_activity_wrapper.init_activity('template','2.2.0',activity_template);
    redis_activity_wrapper.init_activity('template','2.1.0',activity_template);
    redis_activity_wrapper.init_activity('template','2.0.0',activity_template);
    redis_activity_wrapper.init_activity('template','1.3.0',activity_template);
    redis_activity_wrapper.init_activity('template','1.2.8',activity_template);
    redis_activity_wrapper.init_activity('template','1.2.6',activity_template);
    redis_activity_wrapper.init_activity('template','1.2.4',activity_template);
    redis_activity_wrapper.init_activity('template','1.2.2',activity_template);
    redis_activity_wrapper.init_activity('template','1.2.0',activity_template);
};

activity_wrapper.prototype.get = function(channel,version,cb){
    redis_activity_wrapper.get_activity(channel,version,function(reply){
        if(reply){
            cb(JSON.parse(reply));
        }else{
            redis_activity_wrapper.get_activity('template',version,function(reply){
                if(reply) {
                    cb(JSON.parse(reply));
                }
                else{
                    cb(activity_templete);
                }
            });
        }
    });
};

module.exports = activity_wrapper;
