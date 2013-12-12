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
    loadMaps();
    return;
  }

  // We're not done. Logic to show the question programatically
  var questionData = questions[globalQuestionId];
  var answerData = answers[globalQuestionId]; // In case we hit back

  var $questionForm = $("<form id='question-form' action='javascript:askQuestions()' method='get'>");
  var $instructionsWell = $("<div class='well well-small'>");
  $instructionsWell.text("If a question is blue, then you can click on the text for instructions (and click the text again to make instructions go away)!");
  $questionForm.append($instructionsWell);
  for(var fieldNum = 0; fieldNum < questionData.fields.length; ++fieldNum) {
    var $p = $("<p>");
    var field = questionData.fields[fieldNum];
    var questionId = "question-" + field.name;
    var $label = $("<label for='" + questionId + "'>").text(field.text);
    if('popover' in field) {
      var popoverOptions = {'placement' : 'bottom'};
      popoverOptions['content'] = field.popover;
      popoverOptions['title'] = "Instructions";
      $label.css('color', 'blue');
      $label.popover(popoverOptions);
    }
    $p.append($label);

    // Set up validation of types with jquery plugin
    var validationClasses = [];
    if(!("required" in field) || field.required) {
      validationClasses.push("required");
    }
    switch(field.type) {
      case "int":
        validationClasses.push("digits"); break;

      case "float":
      case "usd":
        validationClasses.push("number");
        break;
    }
    var validationClass = validationClasses.join(" ");

    var $input;
    switch(field.type) {
      case "string":
        var $inputString = $("<input type='text' class='" + validationClass + "' id='" + questionId + "'/>");
        if(field.name in answerData && answerData[field.name] !== null)
          $inputString.val(answerData[field.name]);
        $p.append($inputString);
        break;

      case "int":
        var $inputInt = $("<input type='number' min=0 class='" + validationClass + "' id='" + questionId + "'/>");
        if(field.name in answerData && answerData[field.name] !== null)
          $inputInt.val(answerData[field.name]);
        $p.append($inputInt);
        break;

      case "float":
      case "usd":
        var $inputNumber = $("<input type='number' class='" + validationClass + "' id='" + questionId + "' step='0.01' />");
        if(field.name in answerData && answerData[field.name] !== null)
          $inputNumber.val(answerData[field.name]);
        $p.append($inputNumber);
	// Add a dollar sign to the input box if it is usd
	if (field.type == "usd") {
	    $inputNumber.wrap("<div class='input-prepend' />");
	    $inputNumber.before("<span class='add-on'>$</span>");
	}
        break;

      case "yesorno":
        // First put together the hidden input field for the form
        var hiddenId = sprintf("%s-hidden", questionId);
        var hiddenHTML = sprintf(
          "<input type='hidden' value='' name='%s' id='%s' class='%s' />",
          questionId, hiddenId, validationClass);

        var $hidden = $(hiddenHTML);
        $p.append($hidden);

        // The wrapper
        var wrapperHTML = "<div class='btn-group' data-toggle='buttons-radio'>";
        var $wrapper = $(wrapperHTML);

        // Yes and No
        var yesId = sprintf("%s-yes", questionId);
        var yesHTML = sprintf("<button type='button' id='%s'>", yesId);
        var $yes = $(yesHTML).addClass('btn').addClass('btn-primary');
        $yes.text("Yes");
        $yes.click(function() {
          // Ugly hack because variable resolution seems broken in JS....
          var thisId = $(this).attr('id');
          var prefix = thisId.substr(0, thisId.lastIndexOf('-'));
          $("#" + prefix + "-hidden").val('true');
          $("#" + prefix + "-no").removeClass('active');
          $("#" + prefix + "-yes").addClass('active');
        });

        var noId = sprintf("%s-no", questionId);
        var noHTML = sprintf("<button type='button' id='%s'>", noId);
        var $no = $(noHTML).addClass('btn').addClass('btn-primary');
        $no.text("No");
        $no.click(function() {
          // Ugly hack because variable resolution seems broken in JS....
          var thisId = $(this).attr('id');
          var prefix = thisId.substr(0, thisId.lastIndexOf('-'));
          $("#" + prefix + "-hidden").val('false');
          $("#" + prefix + "-yes").removeClass('active');
          $("#" + prefix + "-no").addClass('active');
        });

        // And wrap them up
        $wrapper.append($yes).append($no);
        $p.append($wrapper);

        $p.append($yes).append($no);

        // Finally, add a jquery-validation error placeholder
        var errorDivHTML = sprintf('<div id="%s-error">', questionId);
        var labelHTML = sprintf('<label for="%s" class="error" generated="true">',
          questionId);
        $hidden.before(errorDivHTML + labelHTML + "</label></div>");

        // And check the current values
        if(field.name in answerData && answerData[field.name] !== null) {
          if(answerData[field.name] == true) {
            $hidden.val('true');
            $yes.addClass('active');
          } else {
            $hidden.val('false');
            $no.addClass('active');
          }
        }

        break;


      case "radio":
        // First put together the hidden input field for the form
        var hiddenId = sprintf("%s-hidden", questionId);
        var hiddenHTML = sprintf(
          "<input type='hidden' value='' name='%s' id='%s' class='%s' />",
          questionId, hiddenId, validationClass);

        var $hidden = $(hiddenHTML);
        $p.append($hidden);

        // The wrapper
        var wrapperHTML = "<div class='btn-group' data-toggle='buttons-radio'>";
        var $wrapper = $(wrapperHTML);

        // Put together the options.... 
        for(var optionIdx = 0; optionIdx < field.radioOptions.length; ++optionIdx) {
          var optionName = field.radioOptions[optionIdx];
          var optionId = sprintf("%s-%s", questionId, optionName);
          var buttonHTML = sprintf("<button type='button' id='%s'>", optionId);
          var $button = $(buttonHTML)
                           .addClass('btn')
                           .addClass('btn-primary')
                           .addClass(questionId)
                           .text(optionName);
          $button.click(function() {
            // Ugly hack because variable resolution seems broken in JS....
            var thisId = $(this).attr('id');
            var prefix = thisId.substr(0, thisId.lastIndexOf('-'));
            $("." + prefix).removeClass('active');
            $(this).addClass('active');
            $("#" + prefix + "-hidden").val(optionName);
          });

        if(field.name in answerData && answerData[field.name] !== null) {
	      if(answerData[field.name] == optionName) {
            $button.addClass('active');
            $hidden.val(optionName);
	      }
        }
        $p.append($button);
      }
      break;

    }
    $questionForm.append($p);
  }
  $questionForm.validate({ignore: []});
  $("#questions").append($questionForm);
}

function showResults() {

  // Hide buttons
  $(".continue-button").hide();
  $(".back-button").hide();
  $(".start-over-button").show();
  $("#panel").show();

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
      case "usd":
        var value = $("#question-" + field.name).val();
        if(value.length > 0)
          answers[globalQuestionId][field.name] = parseFloat(value);
        else
          answers[globalQuestionId][field.name] = null;
        break;

      case "yesorno":
        var itemName = 'question-' + field.name;
        var value = $("#" + itemName + '-hidden').val();
        if(value == "true")
          answers[globalQuestionId][field.name] = true;
        else
          answers[globalQuestionId][field.name] = false;
        break;

      case "radio":
        var itemName = 'question-' + field.name;
        var value = $("#" + itemName + "-hidden").val();
        answers[globalQuestionId][field.name] = value;
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
    case "usd":
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

  $("#panel").hide();

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
      if($("#question-form").valid())
        $(".back-button").show();
      $("#question-form").submit();
    }).show();

  for(var prop in questions) {
    // Set up the dictionary which keeps track of the answers.
    answers[prop] = {};
  }
}
