/* global beforeEach */
beforeEach(function(){
    'use strict';
    jasmine.addMatchers({
        toHaveClass: function(util, customEqualityTesters){
            return{
				compare: function(element, cls){
					return {
						message: 'Expected "' + angular.mock.dump(element) + '"'+(jasmine.isNot?' not':'')+' to have class "' + cls + '".',
						pass: element.hasClass(cls)
					}
				}
			};
        }
    });
});
