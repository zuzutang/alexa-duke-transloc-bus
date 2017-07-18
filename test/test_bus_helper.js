'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var BusHelper = require('../bus_helper');
chai.config.includeStack = true;

describe('BusHelper', function(){
  var subject = new BusHelper();
  describe('#requestTimeData', function(){
    context('with closest stop', function(){
      it('returns times', function(){
        var uri = "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&stops=4146366"; // given stop, return time
        return subject.requestTimeData(uri).then(function(response){
          console.log("getting times @@@@@@@@@@@@@@@@@@@@@@@@@@@@");
          if (response.data.length > 1){
            for (var k = 0; k < 2; k++) { //number of agencies
              console.log(response.data[k].arrivals[0].arrival_at);
              console.log(response.data[k].agency_id);
              console.log(response.data[k].arrivals[0].route_id);
            }
          }
          expect(response.data[0].arrivals[0].route_id).to.equal('4009768');
        })
      })
    })
  })
  describe('#formatBusTimes', function(){
    context('single stop', function(){
      it('returns a formated time', function(){
        var routeNameArray = ['CCX'];
        var busTimeArray = [new Date('2017-07-10T12:35:58-04:00')];
        var value = subject.formatBusTimes(routeNameArray, busTimeArray);
        //    console.log(response);
        console.log(value);
        expect(value).to.equal('the CCX will arrive at 12:35 PM.');
      });
    });
  });
  describe('#formatBusTimes', function(){
    context('multiple stops', function(){
      it('returns formated times for multiple stops', function(){
        var routeNameArray = ['CCX', 'C1'];
        var busTimeArray = [new Date('2017-07-10T12:35:58-04:00'), new Date('2017-07-10T13:35:58-04:00')];
        var value = subject.formatBusTimes(routeNameArray, busTimeArray);
        console.log(value);
        expect(value).to.equal('the CCX will arrive at 12:35 PM and, the C1 will arrive at 01:35 PM.');
      });
    });
  });
});
