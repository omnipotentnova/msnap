'use strict';

var firstQuestion = "name"; // The key of the first question to be asked
var questions = { // The actual questions to be asked in json
  "name": {
    "fields": [
      {"name": "myname",
       "type": "string",
       "text": "What is your name?"}
    ],
    "next": function() {
      return "int";
    }
  },
  "int": {
    "fields": [
      {"name": "myint",
       "type": "int",
       "text": "What is your favorite nonnegative integer?"}
    ],
    "next": function() {
      return "DONE";
    }
  }
};

/*
 * Actually compute the results from the answers to the questions.
 * Uses the answers associative array to get data and stores results to be
 * displayed in the results associative array.
 */
function computeResults() {
  results.push({"name": "myname", "label": "NAME", "text": answers.name.myname});
  results.push({"name": "myint", "label": "INT", "text": answers.int.myint});
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
  var answerData = answers[globalQuestionId]; // In case we hit back

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
        validationClasses.push("digits"); break;

      case "float":
        validationClasses.push("number");
        break;
    }
    var validationClass = validationClasses.join(" ");

    var $input = $("<input type='text' class='" + validationClass + "' id='" + questionId + "'/>");
    if(field.name in answerData && answerData[field.name] !== null)
      $input.val(answerData[field.name]);
    $p.append($input);
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

    case "int":
      if(value.length > 0)
        return parseInt(value);
      return null;

    case "float":
      if(value.length > 0)
        return parseFloat(value);
      return null;
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
      recordAnswers();
      globalQuestionId = askedStack.pop();
      if(askedStack.length == 0) {
        $('.back-button').hide();
      }
      showQuestion();
    }).hide();

  $('.continue-button')
    .click(function(e) {
      e.preventDefault();
      $(".back-button").show();
      $("#question-form").submit();
    }).show();

  for(var prop in questions) {
    // Set up the dictionary which keeps track of the answers.
    answers[prop] = {};
  }
}
