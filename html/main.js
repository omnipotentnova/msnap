'use strict';

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

function computeResults() {
  results.push({"name": "myname", "label": "NAME", "text": answers.income.myname});
}

/*
 * Everything after here should generally be left alone.
 */
var answers = {};
var results = [];
var askedStack = [];
var globalQuestionId;

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
  // Remove the current question
  $(".question").remove();

  // If we're done display the results
  if(globalQuestionId == "DONE") {
    computeResults();
    showResults();
    return;
  }

  // We're not done. Logic to show the question programatically
  var questionData = questions[globalQuestionId];
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

function showResults() {
  var $resultsTable = $("#resultsTable");
  for(var resultNum=0; resultNum < results.length; ++resultNum) {
    var result = results[resultNum];
    alert("HI!");
    var $tr = $("<tr>");
    alert("HI!!");
    $tr.append($("<td>").text(result.label));
    alert("HI!!!");
    $tr.append($("<td>").text(result.text));
    $resultsTable.append($tr);
  }
  $resultsTable.show();
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
