'use strict';

/*
 * A simple library for creating a flipbook of questions to answer.
 *
 * @author Kevin Hayes Wilson and Trevor Summers Smith
 * @date Feb 2013
 */

/*
 * How to use:
 *
 * Your html file calling this should have a div called questions and a table
 * called results. The questions will be filled in in the div and the results
 * in the table.
 *
 * To add questions, you should make a variable called questions which looks
 * like this:
 * 
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
       "required": false,
       "text": "What is your favorite nonnegative integer?"}
    ],
    "next": function() {
      return "DONE";
    }
  }
};
 * The global variable firstQuestion should point to the first question to ask.
 * The function next() should return the name of another question OR the string
 * DONE to indicate that all of the form has been filled out.
 *
 * You should also implement a function called computeResults which will
 * populate a list called results. For example:
 *
function computeResults() {
  results.push({"name": "myname", "label": "NAME", "text": answers.name.myname});
  results.push({"name": "myint", "label": "INT", "text": answers.int.myint});
}
 *
 * The file which defines these should be sourced *before* this file as they
 * are necessary for the init function.
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

    var $input;
    switch(field.type) {
      case "int":
      case "string":
      case "float":
        var $input = $("<input type='text' class='" + validationClass + "' id='" + questionId + "'/>");
        if(field.name in answerData && answerData[field.name] !== null)
          $input.val(answerData[field.name]);
        $p.append($input);
        break;

      case "yesorno":
        var $yes = $("<label class='checkbox'><input type='radio' value='true' name='" + questionId + "'>Yes</label>")
        var $no = $("<label class='checkbox'><input type='radio' value='false' name='" + questionId + "'>No</label>");
        if(field.name in answerData && answerData[field.name] !== null)
          if(answerData[field.name])
            $yes.attr("checked", "checked");
          else
            $no.attr("checked", "checked");
        $p.append($yes).append($no);
        break;
    }
    $questionForm.append($p);
  }
  $questionForm.validate();
  $("#questions").append($questionForm);
}

function showResults() {

  // Hide buttons
  $(".continue-button").hide();
  $(".back-button").hide();
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
    var type = field.type;
    switch(field.type) {
      case "string":
        var value = $("#question-" + field.name).val();
        if(value.length > 0)
          answers[globalQuestionId][field.name] = value;
        else
          answers[globalQuestionId][field.name] = null;
        break;

      case "int":
        var value = $("#question-" + field.name).val();
        if(value.length > 0)
          answers[globalQuestionId][field.name] = value;
        else
          answers[globalQuestionId][field.name] = null;
        break;

      case "float":
        var value = $("#question-" + field.name).val();
        if(value.length > 0)
          answers[globalQuestionId][field.name] = parseFloat(value);
        else
          answers[globalQuestionId][field.name] = null;
        break;

      case "yesorno":
        var value = $("input:radio[name=" + field.name + "]:checked").val();
        if(value == "true")
          answers[globalQuestionId][field.name] = true;
        else
          answers[globalQuestionId][field.name] = false;
        break;
    }
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
