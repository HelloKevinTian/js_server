/**
 * Created by King Lee on 2014/10/17.
 */
var utils = module.exports;

//  current is the x week
utils.getWeek = function (date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    //	delay_day ,such as 3,that means wednesday is the first day of new week
    var delay_day = 3;
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1 + delay_day) / 7);
};