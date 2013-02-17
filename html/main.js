'use strict';

var answers = {};
var askedStack = [];
var globalQuestionId;
var firstQuestion = "income";
var questions = {
  "income": {
    "fields" : [
      {"name": "myname",
       "type": "string",
       "text": "What is your name?"},
      {"name": "myint",
       "type": "int",
       "text": "What is your favorite color?"}
    ],
    "next": function() {
      return "DONE";
    }
  }
};

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
  var questionData = questions[globalQuestionId];
  $("#questions").remove(".question")
  for(var fieldNum = 0; fieldNum < questionData.fields.length; ++fieldNum) {
    var field = questionData.fields[fieldNum];
    var $newDiv = $("<div class='question'/>");
    $newDiv.append($("<div class='label'/>").text(field.text));
    $newDiv.append(
      $("<div class='field'/>")
        .append("<input type='text' id='question-" + field.name + "'/>"));
    $("#questions").append($newDiv);
  }
}

function recordAnswers() {
  var questionData = questions[globalQuestionId];
  for(var fieldNum = 0; fieldNum < questionData.fields.length; ++fieldNum) {
    var field = questionData.fields[fieldNum];
    var value = $("#question-" + field.name).val();
    var type = field.type
    answers[globalQuestionId][field.name] = castAnswer(value, type, field);
  }
}

function nextQuestion() {
  return questions[globalQuestionId].next();
}

function castAnswer(value, type, field) {
  // TODO(kevin): Check if the value is allowed. Else print error.
    switch(type) {
      case "string":
        return value;
        break;

      case "int":
        return parseInt(value);
        break;

      case "float":
        return parseFloat(value);
        break;
    }
}


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
