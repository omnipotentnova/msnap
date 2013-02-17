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
var globalQuestionId = firstQuestion;

init();
showQuestion();

function askQuestions() {

  recordAnswers();
  askedStack.push(globalQuestionId);
  globalQuestionId = nextQuestion();
  showQuestion();

}

function showQuestion() {
  // Remove the current question
  $("#question-form").remove();

  // If we're done display the results
  if(globalQuestionId == "DONE") {
    computeResults();
    showResults();
    return;
  }

  // We're not done. Logic to show the question programatically
  var questionData = questions[globalQuestionId];
  var $questionForm = $("<form id='question-form' action='javascript:askQuestions()' method='get'>");
  for(var fieldNum = 0; fieldNum < questionData.fields.length; ++fieldNum) {
    var $p = $("<p>");
    var field = questionData.fields[fieldNum];
    var questionId = "question-" + field.name;
    $p.append($("<label for='" + questionId + "'>").text(field.text));

    // Set up validation of types with jquery plugin
    var validationClasses = [];
    if(!("required" in field) || field.required) {
      validationClasses.push("required");
    }
    switch(field.type) {
      case "int":
        validationClasses.push("digits");
        break;

      case "float":
        validationClasses.push("number");
        break;
    }
    var validationClass = validationClasses.join(" ");

    $p.append($("<input type='text' class='" + validationClass + "' id='" + questionId + "'/>"));
    $questionForm.append($p);
  }
  $questionForm.validate();
  $("#questions").append($questionForm);
}

function showResults() {

  // Hide buttons
  $(".back-button").hide();
  $(".continue-button").hide();
  $(".start-over-button").show();

  var $resultsTable = $("#resultsTable");
  for(var resultNum=0; resultNum < results.length; ++resultNum) {
    var result = results[resultNum];
    var $tr = $("<tr>");
    $tr.append($("<td>").text(result.label));
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

function restart() {
  answers = {};
  results = [];
  $("#resultsTable").hide().children().remove();
  init();
  globalQuestionId = firstQuestion;
  showQuestion();
}

function init() {
  $('.start-over-button')
    .click(function(e) {
      e.preventDefault();
      restart();
    }).hide();

  $('.back-button')
    .click(function(e) {
      e.preventDefault();
      if(askedStack.length == 0) {
        showError('.back-button', "Already at the beginning");
        return;
      }
      globalQuestionId = askedStack.pop();
      askQuestions();
    }).show();

  $('.continue-button')
    .click(function(e) {
      e.preventDefault();
      $("#question-form").submit();
    }).show();

  for(var prop in questions) {
    // Set up the dictionary which keeps track of the answers.
    answers[prop] = {};
  }
}
