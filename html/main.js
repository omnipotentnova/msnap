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

  if(!recordAnswers()) {
    return;
  }
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
  var $questionForm = $("<form id='question-form' action='#' method='get'>");
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

/*
 * Return true if form entries validate.
 */
function recordAnswers() {
  if(! $("#questions").validate().form()) return false;
  var questionData = questions[globalQuestionId];
  for(var fieldNum = 0; fieldNum < questionData.fields.length; ++fieldNum) {
    var field = questionData.fields[fieldNum];
    var value = $("#question-" + field.name).val();
    var type = field.type
    answers[globalQuestionId][field.name] = castAnswer(value, type, field);
  }
  return true;
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
