/**
 * Created by King Lee on 2014/9/16.
 */
var redis_random_prize_the_third_phase_wrapper = require('../nosql/redis_random_prize_the_third_phase_wrapper');
var gacha_the_third_phase_json = require('../../config/gacha_the_third_phase.json');
var gacha_the_third_phase_json_replace = require('../../config/gacha_the_third_phase_replace.json');
var gacha_the_third_phase_json_2 = require('../../config/gacha_the_third_phase_2.json');
var random_prize_the_third_phase_wrapper = function() {
    this.wight_total = 0;
    this.wight_total_replace = 0;
    this.wight_total2 = 0;
    this.wight_array = [];
    this.wight_array_replace = [];
    this.wight_array2 = [];
    this.init();
    if(0){
        this.test();
    }
};

random_prize_the_third_phase_wrapper.prototype.init = function(){
    for(var i = 0; i < gacha_the_third_phase_json.length; ++i){
        var wight_total_backup = this.wight_total;
        this.wight_total += gacha_the_third_phase_json[i].rate;
        this.wight_array.push({"id":gacha_the_third_phase_json[i].id,"range":[wight_total_backup,this.wight_total]});
    }
    for(var i = 0; i < gacha_the_third_phase_json_replace.length; ++i){
        var wight_total_backup_replace = this.wight_total_replace;
        this.wight_total_replace += gacha_the_third_phase_json_replace[i].rate;
        this.wight_array_replace.push({"id":gacha_the_third_phase_json_replace[i].id,"range":[wight_total_backup_replace,this.wight_total_replace]});
    }
    for(var i = 0; i < gacha_the_third_phase_json_2.length; ++i){
        var wight_total_backup2 = this.wight_total2;
        this.wight_total2 += gacha_the_third_phase_json_2[i].rate;
        this.wight_array2.push({"id":gacha_the_third_phase_json_2[i].id,"range":[wight_total_backup2,this.wight_total2]});
    }
};

random_prize_the_third_phase_wrapper.prototype.random = function(){
    var random_value = Math.floor(Math.random()*this.wight_total);
    var index = 0;
    for(var i = 0; i < this.wight_array.length; ++i){
        if(random_value >= this.wight_array[i].range[0] && random_value < this.wight_array[i].range[1]){
            index = i;
            break;
        }
    }
    for(i = 0; i < gacha_the_third_phase_json.length; ++i){
        if(i == index){
            gacha_the_third_phase_json[i].replace_flag = 0;
            return gacha_the_third_phase_json[i];
        }
    }
    return null;
};

random_prize_the_third_phase_wrapper.prototype.random_replace = function(){
    var random_value = Math.floor(Math.random()*this.wight_total_replace);
    var index = 0;
    for(var i = 0; i < this.wight_array_replace.length; ++i){
        if(random_value >= this.wight_array_replace[i].range[0] && random_value < this.wight_array_replace[i].range[1]){
            index = i;
            break;
        }
    }
    for(i = 0; i < gacha_the_third_phase_json_replace.length; ++i){
        if(i == index){
            //  the award is entity, record it!
            gacha_the_third_phase_json_replace[i].replace_flag = 0;
            return gacha_the_third_phase_json_replace[i];
        }
    }
    return null;
};

random_prize_the_third_phase_wrapper.prototype.random2 = function(){
    var random_value = Math.floor(Math.random()*this.wight_total2);
    var index = 0;
    for(var i = 0; i < this.wight_array2.length; ++i){
        if(random_value >= this.wight_array2[i].range[0] && random_value < this.wight_array2[i].range[1]){
            index = i;
            break;
        }
    }
    for(i = 0; i < gacha_the_third_phase_json_2.length; ++i){
        if(i == index){
            gacha_the_third_phase_json_2[i].replace_flag = 0;
            return gacha_the_third_phase_json_2[i];
        }
    }
    return null;
};

random_prize_the_third_phase_wrapper.prototype.set = function(device_guid,current_card,free_flag){
    redis_random_prize_the_third_phase_wrapper.set(device_guid,current_card,free_flag);
};

random_prize_the_third_phase_wrapper.prototype.get = function(device_guid,cb){
    redis_random_prize_the_third_phase_wrapper.get(device_guid,cb);
};

random_prize_the_third_phase_wrapper.prototype.add_award = function(award_info){
    redis_random_prize_the_third_phase_wrapper.add_award(award_info);
};

random_prize_the_third_phase_wrapper.prototype.get_all_award = function(cb){
    redis_random_prize_the_third_phase_wrapper.get_all_award(cb);
};

random_prize_the_third_phase_wrapper.prototype.statistics_for_participant = function(device_guid){
    redis_random_prize_the_third_phase_wrapper.statistics_for_participant(device_guid);
};

random_prize_the_third_phase_wrapper.prototype.update_phone = function(device_guid,phone_number){
    redis_random_prize_the_third_phase_wrapper.update_phone(device_guid,phone_number);
};

random_prize_the_third_phase_wrapper.prototype.test = function(){
    var prize_statistics = {};
    var max_loop = 10000000;
    for(var i = 0; i < max_loop; ++i){
        var prize = this.random();
        if(prize_statistics[prize.id]){
            ++prize_statistics[prize.id];
        }else{
            prize_statistics[prize.id] = 1;
        }
    }
    require("fs").writeFile('prize.json', JSON.stringify(prize_statistics), 'utf8', function(err){
        if(err){
            console.log('failed');
        }else{
            console.log('ok');
        }
    });
};


module.exports = random_prize_the_third_phase_wrapper;