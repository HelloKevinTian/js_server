/**
 * Created by King Lee on 14-4-15.
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
        TYPE_VERSION_UPDATE:21
    },
    TYPE_ACTIVITY:{
        TYPE_DAILY_SIGN:1, 	    //// 每日签到
        TYPE_DROP_ITEM:2,		//// 物品掉落
        TYPE_TASK:3,		    //// 每日任务
        TYPE_RANDOM_PRIZE:6,
        RIVAL_SEOUL:7,
        TYPE_RANDOM_PRIZE_THE_SECOND_PHASE:8
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
    }
};