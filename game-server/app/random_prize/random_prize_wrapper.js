/**
 * Created by King Lee on 2014/9/16.
 */
var redis_random_prize_wrapper = require('../nosql/redis_random_prize_wrapper');
var gacha_json = require('../../config/gacha.json');
var gacha_json2 = require('../../config/gacha2.json');
var random_prize_wrapper = function() {
    this.wight_total = 0;
    this.wight_total2 = 0;
    this.wight_array = [];
    this.wight_array2 = [];
    this.init();
};

random_prize_wrapper.prototype.init = function(){
    for(var i = 0; i < gacha_json.length; ++i){
        var wight_total_backup = this.wight_total;
        this.wight_total += gacha_json[i].rate;
        this.wight_array.push({"id":gacha_json[i].id,"range":[wight_total_backup,this.wight_total]});
    }
    for(var i = 0; i < gacha_json2.length; ++i){
        var wight_total_backup2 = this.wight_total2;
        this.wight_total2 += gacha_json2[i].rate;
        this.wight_array2.push({"id":gacha_json2[i].id,"range":[wight_total_backup2,this.wight_total2]});
    }
};

random_prize_wrapper.prototype.random = function(){
    var random_value = Math.floor(Math.random()*this.wight_total);
    var index = 0;
    for(var i = 0; i < this.wight_array.length; ++i){
        if(random_value >= this.wight_array[i].range[0] && random_value < this.wight_array[i].range[1]){
            index = i;
            break;
        }
    }
    for(i = 0; i < gacha_json.length; ++i){
        if(i == index){
            return gacha_json[i];
        }
    }
    return null;
};

random_prize_wrapper.prototype.random2 = function(){
    var random_value = Math.floor(Math.random()*this.wight_total2);
    var index = 0;
    for(var i = 0; i < this.wight_array2.length; ++i){
        if(random_value >= this.wight_array2[i].range[0] && random_value < this.wight_array2[i].range[1]){
            index = i;
            break;
        }
    }
    for(i = 0; i < gacha_json2.length; ++i){
        if(i == index){
            return gacha_json2[i];
        }
    }
    return null;
};

random_prize_wrapper.prototype.set = function(device_guid,current_card,free_flag){
    redis_random_prize_wrapper.set(device_guid,current_card,free_flag);
};

random_prize_wrapper.prototype.get = function(device_guid,cb){
    redis_random_prize_wrapper.get(device_guid,cb);
};

random_prize_wrapper.prototype.statistics_for_participant = function(device_guid){
    redis_random_prize_wrapper.statistics_for_participant(device_guid);
};


module.exports = random_prize_wrapper;