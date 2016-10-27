/**
 * Created by King Lee on 2014/10/17.
 */
var request = require('request');

var utils = module.exports;

//  current is the x week
utils.getWeek = function(date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    //	delay_day ,such as 3,that means wednesday is the first day of new week
    var delay_day = 3;
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1 + delay_day) / 7);
};

utils.genNormalDistributionValue1 = function(e, v) {
    var variable_e = 2.718281828;
    var variable_pi = 3.141592654;
    if (0) {
        var u1 = Math.random();
        var u2 = Math.random();
        return e + v * Math.sqrt(-2.0 * (Math.log(u1) / Math.log(variable_e))) * Math.cos(2.0 * variable_pi * u2);
    } else {
        var rand1 = Math.random();
        rand1 = -2.0 * Math.log(rand1) / Math.log(variable_e);
        var rand2 = Math.random() * 2 * variable_pi;
        return e + v * Math.sqrt(rand1) * Math.cos(rand2);
    }
};

utils.genNormalDistributionValue2 = function(min_value, max_value, e, v) {
    var random_value = 0.0;
    do {
        random_value = utils.genNormalDistributionValue1(e, v);
    } while (random_value < min_value || random_value > max_value);

    return random_value;
};

utils.genRandom = function(e, min_value, offset) {
    return utils.genNormalDistributionValue2(min_value, e + offset, e, (e - min_value) / 2.5);
};

utils.formatDate = function(date_str) {
    var date = new Date(date_str);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year.toString() + "年" + month.toString() + "月" + day.toString() + "日";
};

utils.rr = function(url, form, callback) {
    request.post({
        'url': url,
        'form': form,
        'json': true
    }, function(err, result) {
        callback(err, result);
    });
}

utils.md5 = function(str) {
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    md5.update(str, 'utf8'); //默认是binary,可选：ascii  utf8
    return md5.digest('hex'); // The encoding can be 'hex', 'binary' or 'base64'
};