//Justin Carbonara (jmc543)
//CS575
/////////////////////////////
//app.js (angular controller)
/////////////////////////////

//var cs575Trivia = angular.module('cs575Trivia', []).controller("cs575TriviaController", function($scope){});
var cs575Trivia = angular.module('cs575Trivia', [])
    .controller("cs575TriviaController", function cs575TriviaController($scope, $http){
        $scope.formData = {};
        $scope.answerIsSubmitted = false;
        $scope.answerIsCorrect = false;
        $scope.numCorrect = 0;
        $scope.numAnswered = 0;
        $scope.lastAnsweredQ = "";
        $scope.numToDisplay = 5;
        $scope.currentPage = 0;

        //retrieve all trivia questions for http GET:
        $http.get('/api/questions')
            .success(function(data){
                $scope.questions = data;
                console.log(data);
            })
            .error(function(data){
                console.log('Error: ' + data);
            });

        //send data to rest api when frontend submits POST
        $scope.createTriviaQuestion = function(){
            $http.post('/api/questions', $scope.newTriviaForm)
                .success(function(data){
                    $scope.questions = data;
                    console.log(data);
                })
                .error(function(data){
                    console.log('Error: ' + data);
                });
            console.log($scope.newTriviaForm);
            //clear form for user to submit another question:
            $scope.newTriviaForm = {};
            //uncheck radio buttons w/ jquery:
            $('input[name=ansToQ]').attr('checked', false);
        };

        //delete trivia question when frontend submits DELETE
        $scope.deleteTriviaQuestion = function(id){
            $http.delete('/api/questions/' + id)
                .success(function(data){
                    $scope.questions = data;
                    console.log(data);
                })
                .error(function(data){
                    console.log('Error: ' + data);
                });
        };

        //check answer to trivia question when frontend button is pressed:
        $scope.verifyQuestion = function(question, selMade){
            console.log("question submitted: ");
            console.log(question);
            console.log("selection made: " + selMade);

            //determine if this is the first time question was answered:
            var firstGuess = true;
            if($scope.lastAnsweredQ == question.question){
                firstGuess = false;
            }
            $scope.lastAnsweredQ = question.question;

            $scope.answerIsCorrect = question.answer.toUpperCase() == selMade.toUpperCase();
            //if this is the first time answering question, increment stats:
            if(firstGuess){
                if($scope.answerIsCorrect){
                    $scope.numCorrect++;
                }
                $scope.numAnswered++;
            }

            $scope.answerIsSubmitted = true;
        }

        //give random trivia question to frontend:
        $scope.randomTriviaQ = function(){
            $scope.randomQuestion = $scope.questions[Math.floor(Math.random() * $scope.questions.length)];
            $scope.answerIsSubmitted = false;
            //uncheck radio buttons w/ jquery:
            $('input[name=guess]').attr('checked', false);
            //reset answer status to update gui:
            $scope.answerIsCorrect = false;
        }

        $scope.numberOfPages=function(){
            return Math.floor($scope.questions.length/$scope.numToDisplay);
        };
});

//define custom filter for ng-repeat:
cs575Trivia.filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    };
});