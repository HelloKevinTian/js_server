/**
 * Created by King Lee on 2015/3/6.
 */
var gacha_the_fourth_phase_json = require('../../config/gacha_the_fourth_phase.json');

var random_prize_the_fourth_phase_wrapper = function() {
    this.wight_total = 0;
    this.wight_array = [];
    this.init();
};

random_prize_the_fourth_phase_wrapper.prototype.init = function(){
    for(var i = 0; i < gacha_the_fourth_phase_json.length; ++i){
        var wight_total_backup = this.wight_total;
        this.wight_total += gacha_the_fourth_phase_json[i].rate;
        this.wight_array.push({"id":gacha_the_fourth_phase_json[i].id,"range":[wight_total_backup,this.wight_total]});
    }
};

random_prize_the_fourth_phase_wrapper.prototype.random = function(){
    var random_value = Math.floor(Math.random()*this.wight_total);
    var index = 0;
    for(var i = 0; i < this.wight_array.length; ++i){
        if(random_value >= this.wight_array[i].range[0] && random_value < this.wight_array[i].range[1]){
            index = i;
            break;
        }
    }
    for(i = 0; i < gacha_the_fourth_phase_json.length; ++i){
        if(i == index){
            return gacha_the_fourth_phase_json[i];
        }
    }
    return null;
};

module.exports = random_prize_the_fourth_phase_wrapper;