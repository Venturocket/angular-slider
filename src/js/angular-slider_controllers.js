/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .controller('SliderCtrl', ['$scope', function($scope) {

        var knobs = [];
		
		var currentKnob = null;

        var options = {
            precision:  0,
            buffer:     0,
            steps:      0,
            stickiness: 3,
            translate: 	function(val) { return val; },
            scale: 		function(val) { return val; },
			
			disabled: 	false
        };
		this.options = options;

        function updateKnobs() {

        }

        this.registerKnob = function(knob) {
			if(knobs.length > 0) {
				for(var i = 0; i < knobs.length; i++) {
					if(knob.ngModel.$modelValue > knobs[i].$modelValue) {
						knobs.splice(i, 0, knob);
						break;
					}
				}
			} else {
				knobs.push(knob);
			}
			
			$scope.$watch(function() { return knob.ngModel.$modelValue; }, function(value) {
				var normalized = Math.min($scope.ceiling, Math.max(value, $scope.floor));
				if(normalized == value) {
					knob.onChange(value, (((value-$scope.floor) / ($scope.ceiling-$scope.floor)) * 100) + "%");
				} else if(!isNaN(normalized)) {
					knob.ngModel.$setViewValue(normalized);
				}
			});

            updateKnobs();
			
			return {
				start: function() {
					if(!currentKnob) {
						currentKnob = knob.elem;
					}
				},
				destroy: function() {
					var index = knobs.indexOf(elem);
					knobs.splice(index, 1);
					knobs.splice(index, 1);
		
					updateKnobs();
				},
				disable: function() {},
				enable: function() {},
				
			}
        };
    }])
	.controller('SliderKnobCtrl', ['$scope', function($scope) {
		$scope.scope = 'blah';
	}]);
