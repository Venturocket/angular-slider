/* global beforeEach */
beforeEach(function(){
    'use strict';
    this.addMatchers({
        toHaveClass: function(cls){
            this.message = function(){
                return 'Expected "' + angular.mock.dump(this.actual) + '"'+(this.isNot?' not':'')+' to have class "' + cls + '".';
            };
            return this.actual.hasClass(cls);
        }
    });
});
