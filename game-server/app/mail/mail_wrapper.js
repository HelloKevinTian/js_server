/**
 * Created by King Lee on 2014/6/19.
 * reference form https://github.com/andris9/Nodemailer
 */
var nodemailer = require("nodemailer");
var redis_mail_wrapper = require('../nosql/redis_mail_wrapper');
var cluster = require('cluster');

var mail_wrapper = function(mail_config) {
    this.service = mail_config.transport.service;
    this.user = mail_config.transport.user;
    this.pass = mail_config.transport.pass;
    this.from = mail_config.mail.from;
    this.to = mail_config.mail.to;
    this.trigger_time_hour = mail_config.trigger_time_hour;
    this.trigger_time_minutes = mail_config.trigger_time_minutes;
    this.time_interval = 1000*mail_config.time_interval;

    this.smtpTransport = nodemailer.createTransport("SMTP",{
        service: this.service,
        auth: {
            user: this.user,
            pass: this.pass
        }
    });
    if(mail_config.switch){
        this.tick();
    }
};

mail_wrapper.prototype.send = function(title,content,channel,version){
    var json_context = {
        content:content,
        channel:channel,
        version:version
    };
    var max_count = 20;
    //  for html format
    var template_html = "<br>" +  JSON.stringify(json_context) + "</br>";
    var all_mails_html = "";
    for(var i = 0; i < max_count; ++i){
        all_mails_html = all_mails_html + template_html;
    }

    //  for text format
    var all_mails_text = "";
    for(var j = 0; j < max_count; ++j){
        if((max_count - 1) == j){
            all_mails_text = all_mails_text + JSON.stringify(json_context);
        }
        else{
            all_mails_text = all_mails_text + JSON.stringify(json_context) + "\n";
        }
    }
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: this.from, // sender address
        to: this.to, // list of receivers
        subject: "玩玩车神玩家反馈", // Subject line
        text: all_mails_text // plaintext body
    };

    // send mail with defined transport object
    this.smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
};

mail_wrapper.prototype.batch_send = function(all_mails){

    //  transform the execl format first
    var all_mails_json = JSON.parse(all_mails);
    var all_mails_execl_format = "";
    for(var i = 0; i < all_mails_json.length; ++i){
        if((all_mails_json.length - 1) == i){
            all_mails_execl_format = all_mails_execl_format + JSON.stringify(all_mails_json[i]);
        }
        else{
            all_mails_execl_format = all_mails_execl_format + JSON.stringify(all_mails_json[i]) + "\n";
        }
    }

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: this.from, // sender address
        to: this.to, // list of receivers
        subject: "all", // Subject line
        text: all_mails_execl_format // plaintext body
    };
    // send mail with defined transport object
    this.smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
};

mail_wrapper.prototype.tick = function(){
    var self = this;
    setInterval(function(){
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        if(hours == self.trigger_time_hour && minutes == self.trigger_time_minutes)
        {
            if (cluster.isMaster){
                redis_mail_wrapper.get_all_mail(function(reply){
                    if(0){
                        for( var v in reply){
                            var json_reply = JSON.parse(reply[v]);
                            self.send(json_reply.title,json_reply.content,json_reply.channel,json_reply.version);
                            redis_mail_wrapper.del_mail(v);
                        }
                    }else{
                        var all_mails = [];
                        for( var v in reply){
                            all_mails.push(JSON.parse(reply[v]));
                            redis_mail_wrapper.del_mail(v);
                        }
                        if(0 != all_mails.length){
                            self.batch_send(JSON.stringify(all_mails));
                        }
                    }
                })
            }
        }
    },this.time_interval);
};

module.exports = mail_wrapper;