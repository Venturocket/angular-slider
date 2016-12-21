/* global beforeEach */
beforeEach(function(){
    'use strict';
    jasmine.addMatchers({
        toHaveClass: function(){
            return  {
                compare: function(actual, expected){
                    var result = {};
                    result.pass = actual.hasClass(expected);
                    result.message =  'Expected "' + angular.mock.dump(actual) + '"'+' to have class "' + expected + '".';
                    return result;
                },
                negativeCompare: function(actual, expected){
                    var result = {};
                    result.pass = !actual.hasClass(expected);
                    result.message =  'Expected "' + angular.mock.dump(actual) + '"'+'not to have class "' + expected + '".';
                    return result;
                }
            }
        }
    });
});
