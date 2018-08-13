'use strict';
 
const functions = require('firebase-functions');
const {dialogflow} = require ('actions-on-google');
const Datastore = require('@google-cloud/datastore');
const GoogleSpreadsheet = require('google-spreadsheet');

// Instantiate a datastore client
const datastore = Datastore();

const WELCOME_INTENT = 'Default Welcome Intent';
const FALLBACK_INTENT = 'Default Fallback Intent';
const LOOKING_FOR_QUOTE_INTENT = 'LookingForQuote';
const QUOTE_TYPE_ENTITY = 'QuoteType';

const app = dialogflow();

var async = require('async');
 
// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet('1HtRHLHKSob5OvvvN8zCbQG_NktnnSppaVqZ7Ubqs2Ps');
var sheet;

async.series([
function getInfoAndWorksheets(step) {
    doc.getInfo(function(err, info) {
    if(err){
      console.log('error');
    }
    else{
      console.log("inside getinfo worksheets");
      console.log('Loaded doc: '+info.title+' by '+info.author.email);
      console.log(info);
      sheet = info.worksheets[0];
      console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      step();  
    }
    })
},

function workingWithRows(step) {
    // google provides some query options
    console.log('inside working with rows funciton');
    sheet.getRows({
      offset: 1,
      limit: 20,
      orderby: 'col2'
    }, function( err, rows ){
        if(err){
      console.log('error');
    }
    else{
    
      console.log('Read '+rows.length+' rows');

      // the row is an object with keys set by the column headers
      //rows[0].colname = 'new val';
      //rows[0].save(); // this is async

      // deleting a row
      //rows[0].del();  // this is async

      step();
    }
    });
}], function(err){
    if( err ) {
      console.log('Error: '+err);
    }
});





app.intent(WELCOME_INTENT, (conv) => {
    conv.ask("welcome to Dr.Motivation! Ask for a quote about friendship or romance or motivation");
});

app.intent(FALLBACK_INTENT, (conv) => {
    conv.ask("Stop mumbling & speak up");
});

const query1 = datastore.createQuery('QuoteTable').filter('QuoteType', '=', 'Motivational');
const query2 = datastore.createQuery('QuoteTable').filter('QuoteType', '=', 'Friendship');
const query3 = datastore.createQuery('QuoteTable').filter('QuoteType', '=', "Romantic");


app.intent(LOOKING_FOR_QUOTE_INTENT, (conv) => {
     const quote_type = conv.parameters[QUOTE_TYPE_ENTITY].toLowerCase();
     if (quote_type === "motivational") { 
         //getQuote(query1)
         console.log("inside app intent");
         //getInfoAndWorksheets();
         console.log(sheet);
         console.log('inside app intent2');
         
         return datastore.runQuery(query1).then(results => {
            conv.ask(results[0][1].Quote);
            return true;
        });
     } else if (quote_type === "friendship") {
        return datastore.runQuery(query2).then(results => {
            conv.ask(results[0][1].Quote);
            return true;
        });
     } else if (quote_type === "romantic") {
     return datastore.runQuery(query3).then(results => {
            conv.ask(results[0][1].Quote);
            return true;
        });
     } else {
         conv.ask("get off your ass and work instead of talking to me");
     }
});


/* function getQuote(query){
  return new Promise(((resolve,reject) => {
  let randomQuoteNum = getRandomNumber(total);
  const key = datastore.key(['quote', 'quote_'+randomQuoteNum]);
  let readableQuote = '';
  datastore.get(key,(err,entity) => {
    console.log("inside datastore get function");
    if(!err){
      resolve(entity);
    }else{
     reject(console.log('Error occured'));
    }
  });
  }));
}
*/

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);