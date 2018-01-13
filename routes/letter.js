var express = require('express');
var router = express.Router();
var prompt  = require('prompt');
var keys= require('./api_keys.js');
var Lob =require('Lob')(keys.lobKey);
var opn = require('opn');
var request = require('request');


prompt.get(['name', 'address line 1', 'address line 2', 'city', 'state', 'zip', 'message'],
    (err, details) => {
      if (err) { return; }
      else{
        requestSenator(details);
        
      }
    });

//Google Civic Info API to check name and address of legislatorUpperBody
function requestSenator(details){

  var data = { method: 'GET',
  url: 'https://www.googleapis.com/civicinfo/v2/representatives',
  qs: 
   { address: details.zip,
     key: keys.civicinfoKey,
     roles: 'legislatorUpperBody',
      } };


  request(data, function (error, response,body) {
    //Parsing the response 
     const data= JSON.parse(body);
     const receiver=data.officials[0];
      letter(details,receiver);
  });
  process.on('uncaughtException', function (err) {
    console.error(new Error("Sorry, The Address you entered seems to be invalid"));
  }); 
  }

//Lob API to send the letter
function letter(result,receiver){
  const receiverAddress = receiver.address[0];
  Lob.letters.create({
  description: 'Letter to legislator',
  to: {
    name: receiver['name'],
    address_line1: receiverAddress.line1,
    address_line2: receiverAddress.line2,
    address_city:  receiverAddress.city,
    address_state: receiverAddress.state,
    address_zip:  receiverAddress.zip,
    address_country:  'US',
  },
  from: {
    name: result['name'],
    address_line1: result['address line 1'],
    address_line2: result['address line 2'],
    address_city: result['city'],
    address_state: result['state'],
    address_zip: result['zip'],
    address_country: 'US',
  },
    file: keys.templateID,
    merge_variables: {
   message: result['message']
  },
  color: true
}, function (err, res) {
  if (err) {
      console.error(new Error("Sorry, could not produce a letter for the information provided."));
    }
    else{
  console.log("Congrats!!Your letter can be viewed at URL");
  console.log(res.url);
  setTimeout(function () {
    //opn to open the PDF in browser
        opn(res.url);
      }, 100);
}
});
}

module.exports = router;
module.exports.requestSenator=requestSenator;


