/**
 * Created by King Lee on 2014/8/13.
 */
var http = require("http");
var fs = require('fs');
var qs = require('querystring');
var handlerMgr = require('../servers/connector/handlerMgr');
var session = require('../util/session');
var pomelo = require('pomelo');
var log4js = require('log4js');
var cluster = require('cluster');
var log_json = require('../../config/log.json');
log4js.configure(log_json);
var http_logger = log4js.getLogger('http-logger');
var redis_pools = require("../nosql/redis_pools");
var utils = require('../util/util');

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
    cosole.log('http connectors stop');
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

    // if (url !== '/favicon.ico') {
    //     console.log('url data:', url, data);
    // }


    if (url == "/status") {
        var pool_info = redis_pools.info();
        var result = {
            code: 200,
            status: "ok",
            redis: pool_info
        }
        return res.end(JSON.stringify(result) + '\n', 'utf8');
    } else if (url == "/favicon.ico") {
        //  do nothing
        return;
    } else if (url == "/gv_gameicon") {
        var img = fs.readFileSync('./gv_gameicon.png');
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        return res.end(img, 'binary');
    } else if (url == "/pay_callback") { //GameView安卓支付回调
        return res.end("success", 'utf-8');
    } else if (url == "/ios_pay_callback") { //GameView苹果支付回调
        //Redis set {Amount,Extraparam1,Time,Sign,RoleID,Gold,MerchantRef,ZoneID,pay_Type}
        if (data && data.Extraparam1) {
            redis_pools.execute('pool_1', function(client, release) {
                client.hset('h_apple_iap', data.Extraparam1.toString(), JSON.stringify(data), function(err, reply) {
                    if (err) {
                        http_logger.debug('apple iap callback error: ' + err);
                        return res.end("fail", 'utf-8');
                    }
                    release();
                    return res.end("success", 'utf-8');
                });
            });
            return;
        } else {
            return res.end("fail", 'utf-8');
        }
    } else if (url == "/video_ad_reward") { //GameView看完视频广告给奖励
        //Redis set {orderid,app_id,time,idn,roleID,zoneID,item,quantity,extraParams,sign}
        if (data && data.idn) {
            redis_pools.execute('pool_1', function(client, release) {
                client.hset('h_vedio_ad_reward', data.idn.toString(), JSON.stringify(data), function(err, reply) {
                    if (err) {
                        http_logger.debug('vedio ad reward redis error: ' + err);
                        return res.end("fail", 'utf-8');
                    }
                    release();
                    return res.end("success", 'utf-8');
                });
            });
            return;
        } else {
            return res.end("fail", 'utf-8');
        }
    } else if (url == '/anqu_callback') { //安趣支付回调

        res.end('success', 'utf-8');
        return;

        // var appId = 'G100369';
        // var appsecret = '50a93cbd4d207fcb4c4df93710ff3d30';

        // if (data && data.uid && data.cporder && data.cpappid && data.money && data.order && data.sign) {
        //     var str = utils.md5(data.uid + data.cporder + data.money + data.order + appsecret);

        //     if (appId !== data.cpappid) {
        //         return res.end('fail', 'utf-8');
        //     }
        //     if (data.sign !== str) {
        //         return res.end('success', 'utf-8');
        //     } else {
        //         return res.end('fail', 'utf-8');
        //     }
        // } else {
        //     return res.end('fail', 'utf-8');
        // }

    }


    if (!data.msg) {
        return res.end("success", 'utf-8');
    }
    var msg = JSON.parse(data.msg);

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