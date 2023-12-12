
const Tester = require('./tester.js');
const actTestCases = require('./testcases.json');
const testResults = require('./testResults.json');
const fs = require("fs");
const { withBrowser, withPage } = require('../src/utils/puppeteerUtils.js');

const results = {
    "a11y": {
        "passed": 0,
        "failed": 0,
        "untested": 0
    },
    "pa": {
        "passed": 0,
        "failed": 0,
        "untested": 0
    },
    "mv": {
        "passed": 0,
        "failed": 0,
        "untested": 0
    },
    "ac": {
        "passed": 0,
        "failed": 0,
        "untested": 0
    },
    "am": {
        "passed": 0,
        "failed": 0,
        "untested": 0
    },
    "lh": {
        "passed": 0,
        "failed": 0,
        "untested": 0
    }
}

const atLeast = {
    1:0,
    2:0,
    3:0,
    4:0,
    5:0,
    6:0
}

for(const test of testResults){

    results.a11y[test.a11y]++;
    results.pa[test.pa]++;
    results.mv[test.mv]++;
    results.ac[test.ac]++;
    results.am[test.am]++;
    results.lh[test.lh]++;

    const passedCount = Object.values(test).filter(value => value === "passed").length;
    if (passedCount >= 1) {
        atLeast[1]++;
    }
    if (passedCount >= 2) {
        atLeast[2]++;
    }
    if (passedCount >= 3) {
        atLeast[3]++;
    }
    if (passedCount >= 4) {
        atLeast[4]++;
    }
    if (passedCount >= 5) {
        atLeast[5]++;
    }
    if (passedCount == 6) {
        atLeast[6]++;
    }
}

console.log(atLeast);

console.log(results);

// Get all attribute keys
const attributeKeys = Object.keys(testResults[0]);

// Function to get the count of passed values for a given attribute combination
function getPassedCount(combination) {
    let count = 0;
    for (const test of testResults) {
        const passedValues = combination.filter(attr => test[attr] === "passed");
        if (passedValues.length >= 1) {
            count++;
        }
    }
    return count;
}

let combinationsData = [];

// Generate all possible combinations of attributes
for (let i = 1; i <= attributeKeys.length; i++) {
    const combinations = getCombinations(attributeKeys, i);
    for (const combination of combinations) {
        const count = getPassedCount(combination);
        combinationsData.push({ combination, count });
    }
}

combinationsData.sort((a, b) => b.count - a.count);

for (const data of combinationsData) {
    console.log("Attribute Combination:", data.combination);
    console.log("Number of Passed Values:", data.count);
    console.log("-----------------------------");
}

// Function to generate combinations of attributes
function getCombinations(arr, k) {
    const result = [];
    const combinations = [];

    // Generate all possible combinations
    generateCombinations(arr, k, 0, result, combinations);

    return combinations;
}

// Recursive function to generate combinations
function generateCombinations(arr, k, start, result, combinations) {
    if (result.length === k) {
        combinations.push([...result]);
        return;
    }

    for (let i = start; i < arr.length; i++) {
        result.push(arr[i]);
        generateCombinations(arr, k, i + 1, result, combinations);
        result.pop();
    }
}

/*const tests = actTestCases.testcases;

const pattern = /^\d+\.\d+\.\d+$/;

const results = [];

for(const test of tests){

    if(test.ruleAccessibilityRequirements === null) continue;

    const successCriteria = Object.keys(test.ruleAccessibilityRequirements);

    const criterias = [];

    successCriteria.forEach((criteria) => {
        const successCriterionNumber = criteria.split(':')[1];
        if (pattern.test(successCriterionNumber)) {
            criterias.push(successCriterionNumber);
        }
    });

    if(criterias.length > 0){

        const expectedOutcome = test.expected;
        const url = test.url;

        const testResult = {}

        await Promise.all(["am", "ac", "mv", "a11y", "pa", "lh"].map(async (evaluator) => { 
            const tester =  new Tester(evaluator, criterias, expectedOutcome);
        
            try{

                let result;

                switch (evaluator) {
                    case "lh":
                        await withBrowser(async (browser) => {
                            result = await tester.test({url}, null, browser);
                        });
                        break;
        
                    case "pa":
                        result = await tester.test({url});
                        break;
        
                    default:
                        await withBrowser(async (browser) => {
                            await withPage(browser)(async (page) => {
                                result = await tester.test({url}, page);
                            });
                        });
                        break;
                }

                if(result === 1){
                    testResult[evaluator] = "passed";
                }else if(result === 0){
                    testResult[evaluator] = "failed";
                }else{
                    testResult[evaluator] = "untested";
                }
            }catch(error){
                testResult[evaluator] = "untested";
            }
        }));

        results.push(testResult);

        if(results.length % 50) console.log(results.length + " tests made")
        
    }

    

}

fs.writeFile('./testResults.json', JSON.stringify(results, null, 2), err => {
    if (err) console.log('Error writing file', err)
});*/
