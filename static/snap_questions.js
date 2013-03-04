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
       "text": "Is anyone in your household elderly or disabled?"},
      {"name": "disabledCare",
       "type": "yesorno",
       "required": true,
       "text": "Does someone in your household pay dependent care expenses?"}
    ],
    "next": function() {
      return "resources";
    }
  },
  "resources": {
    "fields": [
      {"name": "totalResources",
       "type": "float",
       "required": true,
       "text": "What are your total resources, e.g., cash, checking, savings?"}
    ],
    "next": function() {
      return "income";
    }
  },
  "howOften": {
    "fields": [
      {"name": "howOften",
       "type": "radio",
       "required": true",
       "How often are you paid?"}
    ],
    "next": function() {
        return "income"; 
      }
    }
  },
  "income": {
    "fields": [
      {"name": "howOften",
       "type": "radio",
       "required": true,
       "text": "How often are you paid?",
       "radioOptions": ["Monthly", "Semimonthly", "Biweekly", "Weekly"]}
      {"name": "check1",
       "type": "float",
       "required": false,
       "text": "How much did you earn in your first paycheck of the month?"},
      {"name": "check2",
       "type": "float",
       "required": false,
       "text": "Your second paycheck?"}
      {"name": "check3",
       "type": "float",
       "required": false,
       "text": "Your third paycheck?"}
      {"name": "check4",
       "type": "float",
       "required": false,
       "text": "Your fourth paycheck?"}
    ],
    "next": function() {
      return "unearned";
    }
  },
  "unearned": {
    "fields": [
      {"name": "howOften",
       "type": "radio",
       "required": true,
       "text": "How often do you receive unearned income, e.g., SSI, TANF, child support, unemployment, social security?",
       "radioOptions": ["Monthly", "Semimonthly", "Biweekly", "Weekly"]}
      {"name": "check1",
       "type": "float",
       "required": false,
       "text": "How much did you earn in your first check of the month?"},
      {"name": "check2",
       "type": "float",
       "required": false,
       "text": "Your second check?"}
      {"name": "check3",
       "type": "float",
       "required": false,
       "text": "Your third check?"}
      {"name": "check4",
       "type": "float",
       "required": false,
       "text": "Your fourth check?"}
    ],
    "next": function() {
      return "dependents";
    }
  },
  "dependents": {
    "fields": [
      {"name": "dependentCare",
       "type": "float",
       "required": false,
       "text": "How much do you pay monthly in dependent care costs?"},
      {"name": "childSupport",
       "type": "float",
       "required": false,
       "text": "Court ordered child support?"},
      {"name": "medicalExpenses",
       "type": "float",
       "required": false,
       "text": "Medical expenses for elderly or disabled dependents?"}
    ],
    "next": function() { return "shelter"; }
  },
  "shelter": {
    "fields": [
      {"name": "rent",
       "type": "float",
       "required": false,
       "text": "What is your monthly rent or mortgage payment?"},
       {"name": "fire",
        "type": "float",
        "required": false,
        "text": "What is your monthly fire insurance premium?"},
       {"name": "propertyTax",
        "type": "float",
        "required": false,
        "text": "What is your monthly property tax?"}
       ],
    "next": function() {
      if(parseFloat($("#question-rent").val()) > 0)
        return "DONE";
      else
        return "shelterExtra";
    }
  },
  "shelterExtra": {
    "fields": [
      {"name": "heating",
       "type": "float",
       "required": false,
       "text": "What is your monthly heating bill?"},
      {"name": "electric",
       "type": "float",
       "required": false,
       "text": "What is your monthly electric bill?"},
      {"name": "telephone",
       "type": "float",
       "required": false,
       "text": "What is your monthly telephone bill?"},
    ],
    "next": function() { return "DONE"; }
  }
};

/**
 * Given an object obj, check obj.hasOwnProperty. If true, return the property,
 * else return 0.
 *
 * @param obj
 * @param prop
 * @return
 **/
function getPropertyOrZero(obj, prop) {
  if(obj.hasOwnProperty(prop))
    return obj.hasOwnProperty[prop];
  return 0;
}

/*
 * Actually compute the results from the answers to the questions.
 * Uses the answers associative array to get data and stores results to be
 * displayed in the results associative array.
 */
function computeResults() {
  var earnedIncome = 0.0;
  var unearnedIncome = 0.0;
  for(i=1; i<5; ++i) {
    checkName = 'check' + i;
    earnedIncome += getPropertyOrZero(answers.income, checkName);
    unearnedIncome += getPropertyOrZero(answers.unearned, checkName);
  }

  var deductions = 0.0;
  deductions +=   deductions += 
  deductions += getPropertyOrZero(answers.dependents, 'medicalExpenses');

  var adjustedIncome = 0.0;
  adjustedIncome += 0.8 * earnedIncome;
  adjustedIncome += unearnedIncome;
  adjustedIncome -= getPropertyOrZero(answers.dependents, 'dependentCare');
  adjustedIncome -= getPropertyOrZero(answers.dependents, 'childSupport');

  var medicalExpenses = getPropertyOrZero(answers.dependents, 'medicalExpenses');
  if(medicalExpenses != 0) medicalExpenses -= 35;
  adjustedIncome -= medicalExpenses;

  var sua = 0.0;
  if(getPropertyOrZero(answers.shelter, 'rent') > 0) {
    sua += 725;
  } else {
    if(getPropertyOrZero(answers.shelterExtra, 'heating') > 0)
      sua += 725;
    if(getPropertyOrZero(answers.shelterExtra, 'electric') > 0)
      sua += 287;
    if(getPropertyOrZero(answers.shelterExtra, 'telephone') > 0)
      sua += 33;
  }

  var excessShelter = 0.0;
  excessShelter = sua + getPropertyOrZero(answers.shelter, 'rent');
  excessShelter += getPropertyOrZero(answers.shelter, 'fire');
  excessShelter += getPropertyOrZero(answers.shelter, 'propertyTaxes');
  excessShelter -= 0.5 * adjustedIncome;
  if(excessShelter < 0)
    excessShelter = 0.0;

  if(!answers.people.elderlyOrDisabled)
    if(excessShleter > 469)
      excessShelter = 469;

  var netIncome = adjustedIncome - excessShelter;
  results.push({"name": "peopleInHousehold", "label": "PEEPS", "text": answers.people.totalNumber});
  results.push({"name": "elderlyOrDisabled", "label": "HELP", "text": answers.people.elderlyOrDisabled});
}
