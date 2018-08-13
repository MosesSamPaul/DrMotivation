'use strict';
 
const functions = require('firebase-functions');
const {dialogflow} = require ('actions-on-google');
const Datastore = require('@google-cloud/datastore');
// Instantiate a datastore client
const datastore = Datastore();

const WELCOME_INTENT = 'Default Welcome Intent';
const FALLBACK_INTENT = 'Default Fallback Intent';
const LOOKING_FOR_QUOTE_INTENT = 'LookingForQuote';
const QUOTE_TYPE_ENTITY = 'QuoteType';

const app = dialogflow();

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
