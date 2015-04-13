/**
 * Created by King Lee on 14-4-15.
 */
var _ = require('underscore');
var handlerMgr = module.exports;

handlerMgr.container = [];

handlerMgr.handler = function( mid,cb ) {
    this.container[mid] = cb;
};

handlerMgr.trigger = function(mid,msg,session,next ) {
    if( _.isString(mid) ){
        mid = parseInt(mid);
    }
    if( this.container[mid] ){
        this.container[mid](msg,session,next);
    }
};