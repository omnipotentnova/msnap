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
       "required": false,
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
