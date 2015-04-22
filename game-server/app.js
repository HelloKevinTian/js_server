var pomelo = require('pomelo');
var httpServer = require('./app/servers/connector/httpServer');
var mail_wrapper = require('./app/mail/mail_wrapper');
var activity_wrapper = require('./app/activity/activity_wrapper');
var notice_wrapper = require('./app/notice/notice_wrapper');
var statistics_wrapper = require('./app/statistics/statistics_wrapper');
var rank_wrapper = require('./app/rank/rank_wrapper');
var http_connectors = require('./app/component/http_connectors');
var random_prize_wrapper = require('./app/random_prize/random_prize_wrapper');
var fly_flow_wrapper = require('./app/pay_for/fly_flow_wrapper');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'srv');

app.configure('production|development', 'connector', function() {
    app.load(http_connectors, {host:app.get('curServer').host,port: app.get('curServer').httpClientPort});
});

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true
    });
    app.loadConfig('redis', app.getBase() + '/config/redis.json');
    console.log("config load for redis  %s", app.getBase() + '/config/redis.json');
    require('./app/nosql/redis_pools').configure(app.get('redis'));

/*
    //  create http server
    var http = new httpServer(app.get('curServer').host,app.get('curServer').httpClientPort);
    http.createHttpServer();
    app.set('httpServer',http);
*/
    //  for mail handler
    var __mail_wrapper = new mail_wrapper(require('./config/mail'));
    app.set('mail_wrapper',__mail_wrapper);

    //  for activity handler
    var __activity_wrapper = new activity_wrapper();
    app.set('activity_wrapper',__activity_wrapper);

    //  for notice handler
    var __notice_wrapper = new notice_wrapper();
    app.set('notice_wrapper',__notice_wrapper);

    //  for statistics handler
    var __statistics_wrapper = new statistics_wrapper();
    app.set('statistics_wrapper',__statistics_wrapper);

    //  for rank handler
    var __rank_wrapper = new rank_wrapper();
    app.set('rank_wrapper',__rank_wrapper);

    //  for random prize
    var __random_prize_wrapper = new random_prize_wrapper();
    app.set('random_prize_wrapper',__random_prize_wrapper);

    //  pay for
    var __fly_flow_wrapper = new fly_flow_wrapper();
    app.set('fly_flow_wrapper',__fly_flow_wrapper);
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
