/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ 2015-7-9     
 */
module.exports = {
    //  the message type communicated with server,client must define something similar.
    TYPE_MSG:{
        TYPE_MSG_BEGIN :1,
        TYPE_MSG_GET_SRV_TIME:3,
        TYPE_MSG_MAIL:4,
        TYPE_GET_ACTIVITY:5,
        TYPE_GET_NOTICE:6,
        TYPE_UPLOAD_RACE_TIME:7,
        TYPE_GET_RACE_RANK:8,
        TYPE_RANDOM_PRIZE:13,
        TYPE_UPLOAD_RACE_TIME_FOR_RUNNING_MAN:15,
        TYPE_GET_RIVAL_FOR_RUNNING_MAN:16,
        TYPE_GET_RACE_RANK_FOR_RUNNING_MAN:17,
        TYPE_GET_AWARD_FOR_RUNNING_MAN:18,
        TYPE_UPDATE_PHONE_FOR_RUNNING_MAN:19,
        TYPE_RANDOM_PRIZE_THE_SECOND_PHASE:20,
        TYPE_VERSION_UPDATE:21,
        TYPE_RANK_INFO_FOR_PVP: 22,
        TYPE_GET_RIVAL_FOR_PVP: 23,
        TYPE_UPLOAD_SCORE_FOR_PVP: 24,
        TYPE_GET_AWARD_FOR_PVP: 25,
        TYPE_GET_RANK_PARTIAL_FOR_PVP: 26,
        // TYPE_RANDOM_PRIZE_THE_THIRD_PHASE: 27,
        // TYPE_UPDATE_PHONE_FOR_RANDOM_PRIZE_THE_THIRD_PHASE: 28,
        TYPE_ADD_SCORE_FOR_DEBUG_PVP: 29,
        // TYPE_GET_FINAL_AWARD_FOR_RUNNING_MAN: 30,
        TYPE_GET_EXCHANGE_CAR_INFO_FOR_PVP: 31,
        // TYPE_RANDOM_PRIZE_THE_FOURTH_PHASE: 32,
        // TYPE_SET_CHARGE_FEEDBACK_INFO: 33,
        TYPE_ENTITY_GACHA_FLOW_WORD:35,
        TYPE_ENTITY_GACHA_SET_PHONE_NUM:36
    },
    TYPE_ACTIVITY:{
        TYPE_DAILY_SIGN:1, 	    //// 每日签到
        TYPE_DROP_ITEM:2,		//// 物品掉落
        TYPE_TASK:3,		    //// 每日任务
        TYPE_RANDOM_PRIZE:6,
        RIVAL_SEOUL:7,
        TYPE_RANDOM_PRIZE_THE_SECOND_PHASE:8,
        TYPE_PVP: 9
    },
    TYPE_MISSION:{
        MISSION_TYPE_GEM :0,
        MISSION_TYPE_EASY :1,
        MISSION_TYPE_NORMAL:2,
        MISSION_TYPE_HARD:3,
        MISSION_TYPE_EVENT:4,
        MISSION_TYPE_NUM:5
    },
    TYPE_RIVAL:{
        TYPE_RIVAL_GENERAL:0,
        TYPE_RIVAL_BOSS:1
    },
    TYPE_ENTITY_PRIZE:{
        TYPE_PHONE_CHARGE:5,    //话费
        TYPE_SHOPPING_CARD:6,   //购物卡
        TYPE_CAR_MODEL:7,       //车模
        TYPE_MOBILE:8,          //手机
        TYPE_PAD:9              //平板
    },
    TYPE_SCORE_RANK_PVP: {
        TYPE_SCORE_RANK_PVP_WEEKLY: 0,
        TYPE_SCORE_RANK_PVP_ALL: 1
    },
    TYPE_PVP: {
        PVP_RACER_NUM: 4, //pvp随机对手数量
        PVP_BOSS_RACER_ID: 19, //pvp随机boss的driver id
        PVP_BOSS_WEIGHT: 0.5,
        PVP_DOUBLE_SCORE_CAR: 42 //积分加倍的车id
    }
};
