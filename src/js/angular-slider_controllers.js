/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .controller('SliderCtrl', ['$scope', function($scope) {

        var knobs = [];
		
		// we'll use this to tell which knob is currently being moved
		$scope.slideVars = {
			mousePosition: 0,
			sliderSize: 0,
			sliderOffset: 0
		};
		$scope.currentKnob = null;
		$scope.sliding = false;

		// set the default options
		this.options = {
            precision:  0,
            buffer:     0,
            steps:      0,
            stickiness: 3,
            scale: 		function(val) { return val; },
			continuous: false,
			vertical: 	false,
			addBars: 	true
        };
		var options = this.options;

		// make sure the knobs are all up to date
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
			if(options.addBars) {
				
			}
			
			function normalizeModel(value) {
				var normalized = Math.min($scope.ceiling, Math.max(value, $scope.floor));
				if(normalized == value) {
					knob.onChange(value);
				} else if(!isNaN(normalized)) {
					knob.ngModel.$setViewValue(normalized);
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}
			}
			
			$scope.$watch(function() { return knob.ngModel.$modelValue; }, function(value) {
				normalizeModel(value);
			});
			
			$scope.$watch('floor', function() {
				normalizeModel(knob.ngModel.$modelValue);
			});
			$scope.$watch('ceiling', function() {
				normalizeModel(knob.ngModel.$modelValue);
			});
			
			return {
				start: function(ev) {
					if(!$scope.sliding && !$scope.disabled) {
						$scope.currentKnob = knob;
						$scope.sliding = true;
						$scope.onStart(ev);
					}
				},
				destroy: function() {
					var index = knobs.indexOf(knob);
					knobs.splice(index, 1);
				}
				
			}
        };
		
		this.registerBar = function(bar) {
			
		}
    }]);
