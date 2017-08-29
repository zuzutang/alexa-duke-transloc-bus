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
    if (self.event.context !== undefined && self.event.context.System.user.permissions !== undefined && self.event.context.System.user.permissions.consentToken !== undefined){
      var deviceId = self.event.context.System.device.deviceId;
      var consentToken = self.event.context.System.user.permissions.consentToken;
    }
    self.getAmazonAddress(deviceId, consentToken).then(function(response){{
      console.log(response);
      // need to figure out what part of response to put into geocode api call
      /*
      self.geocodeLocation(location).then(function(response){
        console.log(response);
        var lat = response.
      })
      */
    }).catch(err){
      console.log(err);
      console.log("error grabbing amazon address");
    }
    //test values because google api call not done yet
    var lat = '36.008119';
    var long = '-78.914224';
    var self = this;
    var uri = "https://transloc-api-1-2.p.mashape.com/stops.json?agencies=12%2C16%2C+20&callback=call&geo_area=" + lat  + "%2C+" + long + "%7C805"; // given address, return stop
    busHelper.requestStopData(uri).then(function(response){
      if (stop.data.length == 0){
        this.emit(':tell', "There are no stops within one mile. For more information, check duke.transloc.com");
      } else {
        var minIndex = busHelper.getMinDistance(lat, long, response);
        var stop = response.data[minIndex].name;
        var stopID = response.data[minIndex].stop_id;
      }
      var uri = "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&stops=" + stopID; // stop, return time
      var self = this;
      busHelper.requestTimeData(uri).then(function(response){
        if (response.data.length > 0){
          var busTimeArray = [];
          var routeNameArray = [];
          for (var k = 0; k < 2; k++){
              busTimeArray[k] = busHelper.formatTimeString(new Date(response.data[0].arrivals[k].arrival_at));
              routeNameArray[k] = BUSROUTE_IDS[response.data[0].arrivals[k].route_id];
          }
          var answer = busHelper.formatBusTimes(busTimeArray, routeNameArray);
          self.emit(':tell', answer);
        } else {
          self.emit(':tell', 'There are no buses.');
        }
      }).catch(function(err){
        console.log(err);
      });
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

function getAmazonAddress(deviceId, consentToken){
  var options = {
    url: 'https://api.amazonalexa.com/v1/devices/' + deviceID + '/settings/address/countryAndPostalCode',
    qs: {}, //Query string data
    method: 'GET', //Specify the method
    json: true,
    simple: false,
    timeout: 3000,
    resolveWithFullResponse: true,
    headers: { //We can define headers too
      'Authorization': 'Bearer ' + consentToken
    }
  };
  return rp(options);
};

function geocodeLocation(location){
  var options = {
    url: // google maps api
    json: true,
    simple: false,
    resolveWithFullResponse: true
  }
  return rp(options);
};
