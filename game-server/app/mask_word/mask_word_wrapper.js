/**
 * Created by King Lee on 2015/1/13.
 */
var segment = require("nodejieba");
var redis_mask_word_wrapper = require('../nosql/redis_mask_word_wrapper');
var async = require('async');

var mask_word_wrapper = function() {
    this.load();
    redis_mask_word_wrapper.init();
};

mask_word_wrapper.prototype.load = function(){
    segment.loadDict("./node_modules/nodejieba/dict/jieba.dict.utf8", "./node_modules/nodejieba/dict/hmm_model.utf8");
};

mask_word_wrapper.prototype.analysis = function(sentence,cb){
    if(sentence){
        //  first floor, split sentence by key word, and replace for some thing!
        var sentence_new = sentence;
        var word_list =  segment.cutSync(sentence_new);
        var count = 0;
        async.whilst(
            function () { return count < word_list.length; },
            function (callback) {
                async.waterfall([
                        function(callback){
                            redis_mask_word_wrapper.get(word_list[count],function(reply){
                                callback(null,reply,word_list[count]);
                            });
                        },
                        function(find_result,word,callback){
                            if(find_result){
                                //  find and replace it
                                var index = sentence_new.indexOf(word);
                                if(index >= 0){
                                    var word_src = word;
                                    var word_des = '';
                                    var word_length = word_src.length;
                                    for(var i = 0; i < word_length; ++i){
                                        word_des += '*';
                                    }
                                    sentence_new = sentence_new.replace(word_src,word_des);
                                }
                            }
                            callback(null);
                        }
                    ],
                    // optional callback
                    function(err){
                        if(err){
                            console.error(err);
                        }
                        ++count;
                        callback(null);
                    });
            },
            function (err) {
                //  whilst end,do nothing
                if(err){
                    console.error(err);
                }
                //  second floor,match the key word which update online
                redis_mask_word_wrapper.get_all_online(function(reply){
                    for(var i = 0; i < reply.length; ++i){
                        if(reply[i]){
                            var index = sentence_new.indexOf(reply[i],0);
                            if(index >= 0){
                                var word_src = reply[i];
                                var word_des = '';
                                var word_length = word_src.length;
                                for(var i = 0; i < word_length; ++i){
                                    word_des += '*';
                                }
                                sentence_new = sentence_new.replace(word_src,word_des);
                            }
                        }
                    }
                    cb(sentence_new);
                });
            }
        );
    }
    else{
        cb(sentence);
    }
};

module.exports = mask_word_wrapper;