var http = require("http");
var qs = require( 'querystring' );
var handlerMgr = require('./handlerMgr');
var session = require('../../util/session');
var pomelo = require('pomelo');
var log4js = require('log4js');
var log_json = require('../../../config/log.json');
log4js.configure(log_json);
var http_logger = log4js.getLogger('http-logger');
/**
 * construct function
 * @param host
 * @param port
 */
var connector = function(host,port) {
	this.server = null;
	this.host = host;
	this.port = port;
    //  a temp variable
    this.session = null;
    this.requests_in_all = 0;
    this.requests_per_day = 0;
    this.requests_per_hour = 0;
    this.requests_per_minute = 0;
    this.requests_sign_in_all = 0;
};

/**
 * create a http server
 */
connector.prototype.createHttpServer = function() {
    var self = this;
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
    http_logger.debug("server listen at " + this.port);
};

/**
 * paese data for http get
 * @param req
 * @param res
 * @returns {*}
 */
connector.prototype.parseGet = function(req, res){
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
connector.prototype.parsePost = function(req,res,cb){
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

/**
 * dispatch message for the format : account=king_lee&account=king_lee
 * @param data
 * @param url
 * @param req
 * @param res
 */
connector.prototype.dispatchMessage = function(data,url,req,res){
    if(url == "/test")
    {
        //  date for test
        data = qs.parse('msg={"context": "context", "msg_id": 2}&account=king_lee');
    }
    var msg = JSON.parse(data.msg);
    var token = data.token;
    ++this.requests_in_all;
    ++this.requests_per_day;
    ++this.requests_per_hour;
    ++this.requests_per_minute;
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

connector.prototype.requestsInAll = function() {
    return this.requests_in_all;
};

connector.prototype.requestsPerDay = function() {
    return this.requests_per_day;
};

connector.prototype.requestsPerDayClear = function() {
    this.requests_per_day = 0;
};

connector.prototype.requestsPerHour = function() {
    return this.requests_per_hour;
};

connector.prototype.requestsPerHourClear = function() {
    this.requests_per_hour = 0;
};

connector.prototype.requestsPerMinute = function() {
    return this.requests_per_minute;
};

connector.prototype.requestsPerMiniuteClear = function() {
    this.requests_per_minute = 0;
};

connector.prototype.requestsSignInAll = function() {
    return this.requests_sign_in_all;
};

connector.prototype.requestsSignInAllInc = function() {
    ++this.requests_sign_in_all;
};
module.exports = connector;