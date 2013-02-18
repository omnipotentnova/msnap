'use strict';

var CONSTANTS = {
  "poverty": [ // The maximum amount of money a family of size idx
               // can make per month 
    0, 932, 1262, 1592, 1922, 2252, 2582, 2912, 3242, 3572, 3902, 4232, 4562
  ],
  "maximumMonthlyBenefit": [ // Maximum SNAP benefit for a household of size (key)
    0, 200, 367, 526, 668, 793, 952, 1052, 1202, 1352, 1502, 1652, 1802
  ]
};

var firstQuestion = "people"; // The key of the first question to be asked
var questions = { // The actual questions to be asked in json
  "people": {
    "fields": [
      {"name": "totalNumber",
       "type": "int",
       "required": true,
       "text": "How many people are in your household?"},
      {"name": "elderlyOrDisabled",
       "type": "yesorno",
       "required": true,
       "text": "Is anyone in your household elderly or disabled?"}
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
  results.push({"name": "peopleInHousehold", "label": "PEEPS", "text": answers.people.totalNumber});
  results.push({"name": "elderlyOrDisabled", "label": "HELP", "text": answers.people.elderlyOrDisabled});
}
