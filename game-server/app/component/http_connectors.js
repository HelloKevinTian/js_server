/**
 * Created by King Lee on 2014/8/13.
 */
var http = require("http");
var qs = require( 'querystring' );
var handlerMgr = require('../servers/connector/handlerMgr');
var session = require('../util/session');
var pomelo = require('pomelo');
var log4js = require('log4js');
var cluster = require('cluster');
var log_json = require('../../config/log.json');
log4js.configure(log_json);
var http_logger = log4js.getLogger('http-logger');

module.exports = function(app, opts) {
    return new http_connectors(app, opts);
};

var DEFAULT_PORT = 20000;

var http_connectors = function(app, opts) {
    this.app = app;
    this.server = null;
    this.port = opts.port | DEFAULT_PORT;
    this.host = opts.host;
    //  a temp variable
    this.session = null;
};

http_connectors.name = '__http_connectors__';

http_connectors.prototype.start = function(cb) {
    var self = this;
    var cpu_num = require('os').cpus().length;
    if (/*cluster.isMaster*/false) {
        // Fork workers.
        for (var i = 0; i < cpu_num; i++) {
            cluster.fork();
        }

        cluster.on('exit', function(worker, code, signal) {
            http_logger.debug('worker ' + worker.process.pid + ' died');
        });
    }
    else{
        this.server = http.createServer(function(req, res) {
            var url = req.url;
            var client_ip = req.connection.remoteAddress;
            http_logger.debug("new client coming ip:" + client_ip + " method:" + req.method + " url:" + url);
            switch(req.method){
                case 'GET':{
                    var args = self.parseGet(req, res);
                    args && self.dispatchMessage(args[1], args[0], req, res);
                    break;
                }
                case 'POST':{
                    self.parsePost(req,res,function(data){
                        self.dispatchMessage(data,url,req,res);
                    });
                    break;
                }
                default:{
                    res.end();
                    break;
                }
            }
        });
        this.server.listen( this.port );
        http_logger.debug("server listen at " + this.port + " as a component!");
        process.nextTick(cb);
    }
};

http_connectors.prototype.afterStart = function (cb) {
    console.log('http connectors after start');
    process.nextTick(cb);
};

http_connectors.prototype.stop = function(force, cb) {
    cosole.log('http connectors stop');
    process.nextTick(cb);
};

/**
 * paese data for http get
 * @param req
 * @param res
 * @returns {*}
 */
http_connectors.prototype.parseGet = function(req, res){
    var str = req.url;
    if (str.indexOf('?') > -1) {
        var arr = String.prototype.split.call(req.url, '?');
        return [arr[0],qs.parse(arr[1])];
    } else {
        return [str, null];
    }
};

/**
 * parse data for http post
 * @param req
 * @param res
 * @param cb
 */
http_connectors.prototype.parsePost = function(req,res,cb){
    var chunks = [];
    req.on('data', function(chunk) {
        chunks.push(chunk);
    });

    req.on('end', function() {
        //  convert array to string,delimiter is "";
        var data = chunks.join('');
        //  convert url format to normal!!
        cb(qs.parse(data));
    });
    req.on('error',function(err){
        http_logger.debug('problem with request: ' + err.message);
    });
};

http_connectors.prototype.dispatchMessage = function(data,url,req,res){
    if(url == "/test")
    {
        //  date for test
        data = qs.parse('msg={"context": "context", "msg_id": 2}&account=king_lee');
    }
    var msg = JSON.parse(data.msg);
    var token = data.token;
    //  version mapping
    if(msg.version){
        if("1.2.9" == msg.version || "1.3.0" == msg.version){
            msg.version = "1.2.8";
        }
    }
    var statistics_wrapper = pomelo.app.get('statistics_wrapper');
    statistics_wrapper.requestsInAllInc();
    statistics_wrapper.requestsPerDayInc();
    statistics_wrapper.requestsPerHourInc();
    statistics_wrapper.requestsPerMinuteInc();
    http_logger.debug("before dispatchMessage ... %j", msg);
    handlerMgr.trigger(msg.msg_id,msg,this.session,function(error,res_msg){
        http_logger.debug("after dispatchMessage ... %j", res_msg);
        if(0){
            //  by default the encoding is 'utf8'.
            res.write(JSON.stringify(res_msg));
            res.end();
        }
        else{
            //  res.end:Finishes sending the request. If any parts of the body are unsent, it will flush them to the stream.
            //  If the request is chunked, this will send the terminating '0\r\n\r\n'.
            //  If data is specified, it is equivalent to calling request.write(data, encoding) followed by request.end().
            res.end( JSON.stringify(res_msg));
        }
    });
};
