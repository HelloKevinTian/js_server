/**
 * Created by King Lee on 2014/8/13.
 */
var http = require("http");
var qs = require('querystring');
var handlerMgr = require('../servers/connector/handlerMgr');
var session = require('../util/session');
var pomelo = require('pomelo');
var log4js = require('log4js');
var cluster = require('cluster');
var crypto = require('crypto');
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
    this.port = opts.port;
    this.host = opts.host;
    this.cluster = opts.cluster;
    //  a temp variable
    this.session = null;
};

http_connectors.name = '__http_connectors__';

http_connectors.prototype.start = function(cb) {
    var cpu_num = require('os').cpus().length;
    if (this.cluster) {
        if (cluster.isMaster) {
            // Fork workers.
            for (var i = 0; i < cpu_num; i++) {
                cluster.fork();
            }

            cluster.on('exit', function(worker, code, signal) {
                http_logger.debug('worker ' + worker.process.pid + ' died');
            });
        } else {
            this.startHttpServer(cb);
        }
    } else {
        this.startHttpServer(cb);
    }
};

http_connectors.prototype.startHttpServer = function(cb) {
    var self = this;
    this.server = http.createServer(function(req, res) {
        var url = req.url;
        var client_ip = req.connection.remoteAddress;
        http_logger.debug("new client coming ip:" + client_ip + " method:" + req.method + " url:" + url);
        switch (req.method) {
            case 'GET':
                {
                    var args = self.parseGet(req, res);
                    args && self.dispatchMessage(args[1], args[0], req, res);
                    break;
                }
            case 'POST':
                {
                    self.parsePost(req, res, function(data) {
                        self.dispatchMessage(data, url, req, res);
                    });
                    break;
                }
            default:
                {
                    res.end();
                    break;
                }
        }
    });
    this.server.listen(this.port);
    http_logger.debug("server listen at " + this.port + " as a component!");
    process.nextTick(cb);
};

http_connectors.prototype.afterStart = function(cb) {
    console.log('http connectors after start');
    process.nextTick(cb);
};

http_connectors.prototype.stop = function(force, cb) {
    console.log('http connectors stop');
    process.nextTick(cb);
};

/**
 * paese data for http get
 * @param req
 * @param res
 * @returns {*}
 */
http_connectors.prototype.parseGet = function(req, res) {
    var str = req.url;
    if (str.indexOf('?') > -1) {
        var arr = String.prototype.split.call(req.url, '?');
        return [arr[0], qs.parse(arr[1])];
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
http_connectors.prototype.parsePost = function(req, res, cb) {
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
    req.on('error', function(err) {
        http_logger.debug('problem with request: ' + err.message);
    });
};

http_connectors.prototype.dispatchMessage = function(data, url, req, res) {
    if (url == "/status") {
        var result = {
            code: 200,
            status: "ok"
        }
        res.end(JSON.stringify(result) + '\n', 'utf8');
        return;
    } else if (url == "/favicon.ico") {
        //  do nothing
        return;
    }

    if (data === null) {
        return;
    }

    var msg = JSON.parse(data.msg);

    if (msg === null) {
        return;
    }

    //================ md5 verify begin =========================
    //must config here when you have a new version!!!
    var arr_version = ["2.4.0", "2.5.0", "2.6.0"];

    if (arr_version.indexOf(msg.version) > -1) {
        var md5key = '_ck_fatalrace_20150202'; //private key!!_ck_fatalrace_20150202
        var md5str = JSON.stringify(msg) + md5key;

        var md5sum = crypto.createHash('md5');
        md5sum.update(md5str); //默认是binary
        // md5sum.update(md5str,'binary');
        // md5sum.update(md5str,'ascii');
        // md5sum.update(md5str,'utf8');
        var server_str = md5sum.digest('hex'); // The encoding can be 'hex', 'binary' or 'base64'
        var client_str = data.token;
        // console.log(JSON.stringify(msg));
        // console.log("===================md==============111");
        // console.log("server_str: " + server_str);
        // console.log("client_str: " + client_str);
        // console.log("===================md==============222");
        http_logger.debug("server_str: " + server_str + " ### client_str: " + client_str);
        if (server_str !== client_str) {
            var result = {
                code: 200,
                des: "ERROR:invalid message!! --ck"
            }
            res.end(JSON.stringify(result) + '\n', 'utf8');
            http_logger.debug("verify fail!!!");
            return;
        }
        http_logger.debug("verify ok!!!");
    }

    //================ md5 verify end ===========================


    //  version mapping
    if (msg.version) {
        if ("1.2.9" == msg.version) {
            msg.version = "1.2.8";
        }
    }
    var statistics_wrapper = pomelo.app.get('statistics_wrapper');
    statistics_wrapper.requestsInAllInc();
    statistics_wrapper.requestsPerDayInc();
    statistics_wrapper.requestsPerHourInc();
    statistics_wrapper.requestsPerMinuteInc();
    statistics_wrapper.statistics_device(msg.deviceid);
    http_logger.debug("C2S: %j", msg);
    handlerMgr.trigger(msg.msg_id, msg, this.session, function(error, res_msg) {
        http_logger.debug("S2C: %j", res_msg);
        if (0) {
            //  by default the encoding is 'utf8'.
            res.write(JSON.stringify(res_msg));
            res.end();
        } else {
            //  res.end:Finishes sending the request. If any parts of the body are unsent, it will flush them to the stream.
            //  If the request is chunked, this will send the terminating '0\r\n\r\n'.
            //  If data is specified, it is equivalent to calling request.write(data, encoding) followed by request.end().
            res.end(JSON.stringify(res_msg));
        }
    });
};