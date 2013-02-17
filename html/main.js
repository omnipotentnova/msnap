'use strict';

var answers = {};
var askedStack = [];
var globalQuestionId;
var firstQuestion = "income";

init();
askQuestions();

function askQuestions() {

  if(askedStack.length == 0) {
    globalQuestionId = firstQuestion;
    showQuestion();
    return;
  }

  recordAnswers();
  askedStack.push(globalQuestionId);
  globalQuestionId = nextQuestion();
  showQuestion();
}

function showQuestion() {
  questionData = questions[globalQuestionId];
  for(var field in questionData.fields) {
    // Remove the current question
    // Add this question
  }
}

function recordAnswers() {
  var questionData = questions[globalQuestionId];
  for(var field in questionData.fields) {
    var value = $("#question-" + field).value();
    var type = questionData.fields[field].type
    answers[globalQuestionId][field] = castAnswer(value, type, field);
  }
}

function nextQuestion() {
  return questions[globalQuestionId].next();
}

function castAnswer(value, type, field) {
  // TODO(kevin): Check if the value is allowed. Else print error.
    switch(questionData.fields[field]) {
      case "string":
        answers[globalQuestionId][field] = value;
        break;

      case "int":
        answers[globalQuestionId][field] = int(value);
        break;

      case "float":
        answers[globalQuestionId][field] = float(value);
        break;
    }
}

questions = {
  "income": {
    "fields" : [
      {"name": "myname",
       "type": "string",
       "label": "What is your name?"}
    ]
  }
};

function init() {
  $('.start-over-button')
    .click(function(e) {
      e.preventDefault();
      clearResults();
      askQuestions();
    });

  $('.back-button')
    .click(function(e) {
      e.preventDefault();
      if(askedStack.length == 0) {
        showError('.back-button', "Already at the beginning");
        return;
      }
      globalQuestionId = askedStack.pop();
      askQuestions();
    });

  $('.continue-button')
    .click(function(e) {
      e.preventDefault();
      askQuestions();
    });

  for(var prop in questions) {
    // Set up the dictionary which keeps track of the answers.
    answers[prop] = {};
  }
}
