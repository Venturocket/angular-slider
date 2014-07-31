/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .controller('SliderCtrl', ['$scope', function($scope) {

        var knobs = [];
        var scopes = [];

        this.opts = {
            precision:  0,
            buffer:     0,
            steps:      0,
            stickiness: 3,
            translate: function(val) { return val; },
            scale: {
                encode: function(val) { return val; },
                decode: function(val) { return val; }
            }
        };

        function updateKnobs() {

        }

        this.registerKnob = function(scope, elem) {
            var index = 0;

            angular.forEach(scopes, function(sc, index) {
                if(scope.ngModel < sc.ngModel) {

                }
            })
            knobs.push(elem);
            scopes.push(scope);

            updateKnobs();
        };

        this.destroyKnob = function(elem) {
            var index = knobs.indexOf(elem);
            knobs.splice(index, 1);
            scopes.splice(index, 1);

            updateKnobs();
        }
    }]);