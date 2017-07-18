'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var BusHelper = require('./bus_helper');
var rp = require('request-promise');
//require('./jsDate.js')();

var APP_ID = "amzn1.ask.skill.8e12def7-38d1-4ec0-8b60-9d054d631b7a";

/*
long_name: "Duke University"
name: "duke"
short_name: "Duke Transit"
agency_id: 176;

stop_id: "4146366"
name: "Duke Chapel"

route ids:
4008330 - C1: East-West
4005486 - CCX: Central Campus Express

add this functionality later... and holidays...
4007592 - C1: East-West Weekends
4008336 - CCX: Central Campus Express Weekend
*/

var APP_STATES = {
  BUS : '_BUS'
};

var GOOGLE_STATE_IDS = {
  BASE: 'UA-97014541-1'
};

var BUSROUTE_IDS = {
  '4008330': 'C1',
  '4005486': 'CCX',
  '4007592': 'C1 Weekend',
  '40008336': 'CCX Weekend',

  '4003714': 'PR1 Bassett-Research',
  '4003718': 'H2 Hospital Loop',
  '4003722': 'H5 Broad-Erwin',
  '4003726': 'H6 Remote Lot-Hospital',
  '4003734': 'LL LaSalle Loop',
  '4007670': 'H2 Tripper',
  '4008900': 'CCX Holiday',
  '4009300': 'LL Tripper',
  '4009768': 'CCX Summer'
}

var welcomeMessage = 'This skill tracks the bus times for Dukes Chapel Drive bus stop. Ask me when the next bus is.';
var welcomeReprompt = 'Ask me when the next bus is.';

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(newSessionHandlers);
  alexa.execute();
};

var newSessionHandlers = {
  'LaunchRequest': function () {
    this.emit(':ask', welcomeMessage, welcomeReprompt);
  },

  'BusIntent': function() {
    var busHelper = new BusHelper();
    var uri = "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&stops=4146366"; // given address, return stop
    var self = this;
    busHelper.requestTimeData(uri).then(function(response){
      if (response.data.length > 0){
        var busTimeArray = [];
        var routeNameArray = [];
        for (var k = 0; k < 2; k++){
            console.log("@@@@@@@@@@@@@@@@@" + response.data[0].arrivals[k].arrival_at);
            busTimeArray[k] = busHelper.formatTimeString(new Date(response.data[0].arrivals[k].arrival_at));
            routeNameArray[k] = BUSROUTE_IDS[response.data[0].arrivals[k].route_id];
        }
        console.log(busTimeArray);
        var answer = busHelper.formatBusTimes(busTimeArray, routeNameArray);
        self.emit(':tell', answer);
      } else{
        self.emit(':tell', 'There are no buses.');
      }
    }).catch(function(err){
      console.log(err);
    });
  },

  'AMAZON.HelpIntent': function() {
    this.emit(':tell', 'Ask me what time the bus is. For more information, please visit duke.transloc.com');
  },

  'AMAZON.StopIntent': function () {
    this.emit(':tell', 'Goodbye');
  },

  'AMAZON.CancelIntent': function () {
    this.emit(':tell', 'Goodbye');
  },

  'Unhandled': function () {
    var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
    this.emit(':ask', prompt, prompt);
  }
};
