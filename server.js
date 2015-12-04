//Justin Carbonara (jmc543)
//CS575
///////////////////////////
//server.js (node backend)
///////////////////////////

//set up and configuration items:///////////////////////////////////////////////////////////////////
var express = require('express'); //use express node framework
var app = express();
var morgan = require('morgan'); //used to log to console
var bodyParser = require('body-parser'); //used to gather info from POST
var methodOverride = require('method-override'); //simulate DELETE and PUT
var mongoose = require('mongoose'); //used for connection to mongodb
var Schema = mongoose.Schema;
var fs = require('fs'); //used to communicate with server-side filesystem
mongoose.connect('mongodb://localhost/jmc543-cs575'); //database to use for trivia question storage
app.use(express.static(__dirname + '/public')); //static files location for app
app.use(morgan('dev')); //log all requests to the console for development
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
///////////////////////////////////////////////////////////////////////////////////////////////////


//define model of trivia questions:
var triviaQuestionSchema = new Schema({
    question: {type: String, required: true},
    optionA: {type: String, required: true},
    optionB: {type: String, required: true},
    optionC: {type: String, required: true},
    optionD: {type: String, required: true},
    answer: {type: String, required: true}
});
//create model using schema:
var TriviaQuestionModel = mongoose.model('TriviaQuestionModel', triviaQuestionSchema);

//import initial data into mongodb from the json file, if this is not the 1st run:
fs.stat('ran_already.txt', function(err, stat){
    if(err == null){
        console.log('Not the first run, detected ran_already.txt, skipping db population...');
    }
    else{
        //import initial data, then write file sentinel:
        var data = require('./trivia_questions.json');
        console.log('beginning initial data import from JSON...');
        TriviaQuestionModel.collection.insertMany(data, function(err, r){
            if(err != null){
                console.log("db population failed: " + err);
            }
            else{
                console.log('initial db import from JSON complete');
            }
        });
        fs.writeFile('ran_already.txt', 'This file exists to alert node that this is not the first run. Please do not delete.');
    }
})

//create RESTful API for creating/updating/deleting user-made trivia questions://////////////////////
//get all trivia questions from server:
app.get('/api/questions', function(req, res){
    //use model to get all trivia questions from mongodb:
    TriviaQuestionModel.find(function(err, questions){
        if(err){
            res.send(err); //error retrieving questions
        }
        res.json(questions); //return all questions to frontend as JSON
    })
});

//create new trivia question, and receive updated list of trivia questions:
app.post('/api/questions', function(req, res) {
    //create new trivia question, using info provided by frontend:
    console.log("received new req from client:");
    console.log(req.body);
    TriviaQuestionModel.create({
        question: req.body.question,
        optionA: req.body.optionA,
        optionB: req.body.optionB,
        optionC: req.body.optionC,
        optionD: req.body.optionD,
        answer: req.body.answer
    }, function(err, questions){
        if(err){
            res.send(err);
        }
        //return all trivia questions after successful creation:
        TriviaQuestionModel.find(function(err, questions){
            if(err){
                res.send(err);
            }
            res.send(questions);
        });
    });
});

//delete a trivia question, then return all remaining trivia questions:
app.delete('/api/questions/:questions_id', function(req, res){
    console.log('beginning deletion...');
    TriviaQuestionModel.remove({
        _id: req.params.questions_id
    }, function(err, question){
        if(err){
            res.send(err);
        }
        TriviaQuestionModel.find(function(err, questions){
            if(err){
                res.send(err);
            }
            res.json(questions);
        });
    });
});
//end of RESTful api setup//////////////////////////////////////////////////////////////////////

//set up route for frontend Angular SPA:
app.get('*', function(req, res){ //the asterisk catches all other routes
    res.sendfile('./public/index.html'); //load the Angular view file
});


//start listening port://///////////////////////////////////////////////////////////////////////
var port = 3000;
app.listen(port);
console.log("App listening on port " + port);