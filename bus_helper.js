'use strict';
var _ = require('lodash');
var rp = require('request-promise');
//var HelperClass = require('./helper_functions.js');

function BusHelper() { }

BusHelper.prototype.requestTimeData = function(uri) {
  return this.getTranslocData(uri).then(function(response) {
    console.log(response);
    console.log("LENGHT ISSSSSSSSSSSSSSSSSSSSS" + response.data.length);
    return response;
  }).catch(function(error){
    console.log(error);
    console.log('error in getting time');
  })
};

BusHelper.prototype.getTranslocData = function(uri) {
  var options = {
    method: 'GET',
    uri: uri,
    headers: {"X-Mashape-Key": 'vZaDXZpB9XmshtY2Yriw2Tnxs2i6p1ZJfuzjsnrNvwlrRQ19EU'},
    resolveWithFullResponse: false,
    json: true,
    timeout: 3000
  };
  return rp(options);
};

BusHelper.prototype.formatBusTimes = function(busTimeArray, routeNameArray) {
  var times = '';
  var numel = busTimeArray.length;
  for (var k = 0; k < numel; k++){
    times += _.template("the ${routeName} will arrive at ${busTime}${sentenceEnd}")({ //i.e. the CCX will arrive at 8:00.
      routeName: routeNameArray[k],
      //busTime: this.formatTimeString(busTimeArray[k]),
      busTime: busTimeArray[k],
      sentenceEnd: (k === numel - 1) ? "." : " and, "
    });
  }
  return times;
};

BusHelper.prototype.formatTimeString = function(date){
  if ((typeof(date) !== 'object') || (date.constructor !== Date)) {
    throw new Error('argument must be a Date object');
  }
  function pad(m) { return (('' + m).length < 2 ? '0' : '') + m; }
  function fixHour(h) { return (h == 0 ? '12' : (h > 12 ? h - 12 : h)); }

  var h = date.getHours(), m = date.getMinutes(), timeStr = [pad(fixHour(h)), pad(m)].join(':');
  return timeStr + ' ' + (h < 12 ? 'AM' : 'PM');
};


module.exports = BusHelper;
