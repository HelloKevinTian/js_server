/**
 * Created by King Lee on 2014/9/16.
 */
var redis_random_prize_the_second_phase_wrapper = require('../nosql/redis_random_prize_the_second_phase_wrapper');
var gacha_the_second_phase_json = require('../../config/gacha_the_second_phase.json');
var gacha_the_second_phase_json_2 = require('../../config/gacha_the_second_phase_2.json');
var gacha_the_second_phase_json_3 = require('../../config/gacha_the_second_phase_3.json');
var gacha_the_second_phase_json_4 = require('../../config/gacha_the_second_phase_4.json');
var gacha_the_second_phase_json_5 = require('../../config/gacha_the_second_phase_5.json');
var gacha_the_second_phase_json_6 = require('../../config/gacha_the_second_phase_6.json');
var gacha_the_second_phase_json_7 = require('../../config/gacha_the_second_phase_7.json');
var gacha_the_second_phase_json_8 = require('../../config/gacha_the_second_phase_8.json');
var gacha_the_second_phase_json_9 = require('../../config/gacha_the_second_phase_9.json');
var random_prize_the_second_phase_wrapper = function() {
    this.wight_total = 0;
    this.wight_total2 = 0;
    this.wight_total3 = 0;
    this.wight_total4 = 0;
    this.wight_total5 = 0;
    this.wight_total6 = 0;
    this.wight_total7 = 0;
    this.wight_total8 = 0;
    this.wight_total9 = 0;

    this.wight_array = [];
    this.wight_array2 = [];
    this.wight_array3 = [];
    this.wight_array4 = [];
    this.wight_array5 = [];
    this.wight_array6 = [];
    this.wight_array7 = [];
    this.wight_array8 = [];
    this.wight_array9 = [];

    this.init();

    //test data
    if (0) {
        this.test();
    }
};

random_prize_the_second_phase_wrapper.prototype.init = function() {
    for (var i = 0; i < gacha_the_second_phase_json.length; ++i) {
        var wight_total_backup = this.wight_total;
        this.wight_total += gacha_the_second_phase_json[i].rate;
        this.wight_array.push({
            "id": gacha_the_second_phase_json[i].id,
            "range": [wight_total_backup, this.wight_total]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_2.length; ++i) {
        var wight_total_backup2 = this.wight_total2;
        this.wight_total2 += gacha_the_second_phase_json_2[i].rate;
        this.wight_array2.push({
            "id": gacha_the_second_phase_json_2[i].id,
            "range": [wight_total_backup2, this.wight_total2]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_3.length; ++i) {
        var wight_total_backup3 = this.wight_total3;
        this.wight_total3 += gacha_the_second_phase_json_3[i].rate;
        this.wight_array3.push({
            "id": gacha_the_second_phase_json_3[i].id,
            "range": [wight_total_backup3, this.wight_total3]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_4.length; ++i) {
        var wight_total_backup4 = this.wight_total4;
        this.wight_total4 += gacha_the_second_phase_json_4[i].rate;
        this.wight_array4.push({
            "id": gacha_the_second_phase_json_4[i].id,
            "range": [wight_total_backup4, this.wight_total4]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_5.length; ++i) {
        var wight_total_backup5 = this.wight_total5;
        this.wight_total5 += gacha_the_second_phase_json_5[i].rate;
        this.wight_array5.push({
            "id": gacha_the_second_phase_json_5[i].id,
            "range": [wight_total_backup5, this.wight_total5]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_6.length; ++i) {
        var wight_total_backup6 = this.wight_total6;
        this.wight_total6 += gacha_the_second_phase_json_6[i].rate;
        this.wight_array6.push({
            "id": gacha_the_second_phase_json_6[i].id,
            "range": [wight_total_backup6, this.wight_total6]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_7.length; ++i) {
        var wight_total_backup7 = this.wight_total7;
        this.wight_total7 += gacha_the_second_phase_json_7[i].rate;
        this.wight_array7.push({
            "id": gacha_the_second_phase_json_7[i].id,
            "range": [wight_total_backup7, this.wight_total7]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_8.length; ++i) {
        var wight_total_backup8 = this.wight_total8;
        this.wight_total8 += gacha_the_second_phase_json_8[i].rate;
        this.wight_array8.push({
            "id": gacha_the_second_phase_json_8[i].id,
            "range": [wight_total_backup8, this.wight_total8]
        });
    }
    for (var i = 0; i < gacha_the_second_phase_json_9.length; ++i) {
        var wight_total_backup9 = this.wight_total9;
        this.wight_total9 += gacha_the_second_phase_json_9[i].rate;
        this.wight_array9.push({
            "id": gacha_the_second_phase_json_9[i].id,
            "range": [wight_total_backup9, this.wight_total9]
        });
    }
}

random_prize_the_second_phase_wrapper.prototype.random = function() {
    var random_value = Math.floor(Math.random() * this.wight_total);
    var index = 0;
    for (var i = 0; i < this.wight_array.length; ++i) {
        if (random_value >= this.wight_array[i].range[0] && random_value < this.wight_array[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random2 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total2);
    var index = 0;
    for (var i = 0; i < this.wight_array2.length; ++i) {
        if (random_value >= this.wight_array2[i].range[0] && random_value < this.wight_array2[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_2.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_2[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random3 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total3);
    var index = 0;
    for (var i = 0; i < this.wight_array3.length; ++i) {
        if (random_value >= this.wight_array3[i].range[0] && random_value < this.wight_array3[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_3.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_3[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random4 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total4);
    var index = 0;
    for (var i = 0; i < this.wight_array4.length; ++i) {
        if (random_value >= this.wight_array4[i].range[0] && random_value < this.wight_array4[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_4.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_4[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random5 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total5);
    var index = 0;
    for (var i = 0; i < this.wight_array5.length; ++i) {
        if (random_value >= this.wight_array5[i].range[0] && random_value < this.wight_array5[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_5.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_5[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random6 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total6);
    var index = 0;
    for (var i = 0; i < this.wight_array6.length; ++i) {
        if (random_value >= this.wight_array6[i].range[0] && random_value < this.wight_array6[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_6.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_6[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random7 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total7);
    var index = 0;
    for (var i = 0; i < this.wight_array7.length; ++i) {
        if (random_value >= this.wight_array7[i].range[0] && random_value < this.wight_array7[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_7.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_7[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random8 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total8);
    var index = 0;
    for (var i = 0; i < this.wight_array8.length; ++i) {
        if (random_value >= this.wight_array8[i].range[0] && random_value < this.wight_array8[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_8.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_8[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.random9 = function() {
    var random_value = Math.floor(Math.random() * this.wight_total9);
    var index = 0;
    for (var i = 0; i < this.wight_array9.length; ++i) {
        if (random_value >= this.wight_array9[i].range[0] && random_value < this.wight_array9[i].range[1]) {
            index = i;
            break;
        }
    }
    for (var j = 0; j < gacha_the_second_phase_json_9.length; ++j) {
        if (j == index) {
            return gacha_the_second_phase_json_9[j];
        }
    }
    return null;
};

random_prize_the_second_phase_wrapper.prototype.set = function(device_guid, current_card, free_flag) {
    redis_random_prize_the_second_phase_wrapper.set(device_guid, current_card, free_flag);
};

random_prize_the_second_phase_wrapper.prototype.get = function(device_guid, cb) {
    redis_random_prize_the_second_phase_wrapper.get(device_guid, cb);
};

random_prize_the_second_phase_wrapper.prototype.statistics_for_participant = function(device_guid) {
    redis_random_prize_the_second_phase_wrapper.statistics_for_participant(device_guid);
};

random_prize_the_second_phase_wrapper.prototype.test = function() {
    var prize_statistics = {};
    var max_loop = 10000000;
    for (var i = 0; i < max_loop; ++i) {
        var prize = this.random();
        if (prize_statistics[prize.id]) {
            ++prize_statistics[prize.id];
        } else {
            prize_statistics[prize.id] = 1;
        }
    }
    require("fs").writeFile('prize.json', JSON.stringify(prize_statistics), 'utf8', function(err) {
        if (err) {
            console.log('failed');
        } else {
            console.log('ok');
        }
    });
};


module.exports = random_prize_the_second_phase_wrapper;