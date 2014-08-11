/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider', []);

/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .directive('ngSlider', ['$document', '$compile', function($document, $compile) {
        return {
            restrict: 'EA',
            controller: 'SliderCtrl',
			scope: true,
            compile: function(elem, attr) {
				// check requirements
                if(angular.isUndefined(attr.floor)) {
                    throw "ngSlider Error: Floor not specified";
                }
                if(angular.isUndefined(attr.ceiling)) {
                    throw "ngSlider Error: Ceiling not specified";
                }

				// add a class so we can style it
                elem.addClass('ng-slider');

                return function (scope, elem, attr, ctrl) {
					
					// add the bars
					elem.prepend($compile("<ng-slider-bar low='{{ bar.low() }}' high='{{ bar.high() }}' ng-repeat='bar in bars'></ng-slider-bar>")(scope));

					/**
					 * What to do when the user starts sliding
					 * @param ev {Event}
					 */
					scope.onStart = function(ev) {
						// fire a "move"
						scope.onMove(ev);
					};

					/**
					 * What to do when a knob is moved
					 * @param ev {Event}
					 */
					scope.onMove = function(ev) {
						// get the current dimensions
						var dimensions = scope.dimensions();

                        // get the current mouse position
                        var position = -scope.dimensions().sliderOffset;
                        if(ctrl.options.vertical) {
                            position += ev.clientY || ev.touches[0].clientY;
                        } else {
                            position += ev.clientX || ev.touches[0].clientX;
                        }
						
						// get the size of the knob being dragged
						var knobSize = ctrl.options.vertical?scope.currentKnob.elem[0].offsetHeight:scope.currentKnob.elem[0].offsetWidth;
						
						// get the current mouse/finger position as a percentage
						var percent = Math.max(0, Math.min((position-(knobSize/2)) / (dimensions.sliderSize-knobSize), 1));
						
						// compute the value from the percentage
						var value = ((percent * (scope.ceiling - scope.floor)) + scope.floor).toFixed(ctrl.options.precision);
						
						// update the model for the knob being dragged
						scope.currentKnob.ngModel.$setViewValue(value);
						if(!scope.$$phase) {
							scope.$apply();
						}
					};

					/**
					 * What to do when the slide is finished
					 */
					scope.onEnd = function() {
						// we're no longer sliding
						scope.sliding = false;
						
						// fire the knob's onEnd callback
						scope.currentKnob.onEnd();
					};
					
					// set the default events
					var moveEvents = ['mousemove', 'touchmove'];
                    var cancelEvents = ['mousecancel', 'touchcancel'];
                    var endEvents = ['mouseup', 'touchend'];
					
					if(window.PointerEvent) {
						// the browser supports javascript Pointer Events (currently only IE11), use those
						moveEvents = ['pointermove'];
						cancelEvents = ['pointercancel'];
						endEvents = ['pointerup'];
					} else if(window.navigator.msPointerEnabled) {
						// the browser supports M$'s javascript Pointer Events (IE10), use those
						moveEvents = ['MSPointerMove'];
						cancelEvents = ['MSPointerCancel'];
						endEvents = ['MSPointerUp'];
					}
					
					// bind the move events
                    angular.forEach(moveEvents, function(event) {
						$document.bind(event, function(ev) {
							if(scope.sliding) {
								// they see me slidin', they hatin'
								ev.preventDefault();
                                ev.stopPropagation();
								scope.onMove(ev);
							}
						});
					});
					
					// bind the end and cancel events
                    angular.forEach(cancelEvents.concat(endEvents), function(event) {
						$document.bind(event, function() {
							if(scope.sliding) {
								// it's electric, boogie woogie, woogie
								scope.onEnd();
							}
						});
					});
					
					// watch for disabilities
                    scope.$watch(function() { return scope.$eval(attr.ngDisabled); }, function(disabled) {
						// do we have disabilities?
                        scope.disabled = angular.isDefined(disabled) && disabled;
						
						// tell the DOM
						if(scope.disabled) {
							elem.addClass('disabled');
						} else {
							elem.removeClass('disabled');
						}
						
						if(scope.sliding) {
							// I wanna wake up where you are, I won't say anything at all
							onEnd();
						}
                    });
					
					// watch the attributes and update as necessary
                    attr.$observe('ceiling', function(ceiling) {
                        ceiling = angular.isDefined(ceiling)?parseFloat(ceiling):0;
                        scope.ceiling = isNaN(ceiling)?0:ceiling;
                    });
                    attr.$observe('floor', function(floor) {
                        floor = angular.isDefined(floor)?parseFloat(floor):0;
                        scope.floor = isNaN(floor)?0:floor;
                    });
					scope.$watch(function() { return scope.$eval(attr.ngSliderOptions); }, function(opts) {
						angular.extend(ctrl.options, angular.isDefined(opts) && angular.isObject(opts)?opts:{});
						if(ctrl.options.vertical) {
							elem.addClass('ng-slider-vertical').removeClass('ng-slider-horizontal');
						} else {
							elem.addClass('ng-slider-horizontal').removeClass('ng-slider-vertical');
						}
					}, true);
                };
            }
        }
    }])
    .directive('ngSliderKnob', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            restrict: 'EA',
            require: ['^ngSlider', '^ngModel'],
			scope: true,
            compile: function(elem, attr) {
				// make sure we have a model
                if(angular.isUndefined(attr.ngModel)) {
                    throw "ngSliderKnob Error: ngModel not specified";
                }
				
				// add a class so we can style it
                elem.addClass('ng-slider-knob');

                return function(scope, elem, attr, ctrls) {
					// get the controllers
					var ngSliderCtrl = ctrls[0];
					var ngModelCtrl = ctrls[1];
					
					// is the knob enabled?
					var enabled = true;

					/**
					 * Make sure the value gets applied up the hierarchy
					 * @param value {number}
					 */
					function updateModel(value) {
						$parse(attr.ngModel).assign(scope.$parent.$parent, parseFloat(value));
						if(!scope.$$phase) {
							scope.$apply();
						}
					}
					
					// register the knob
                    var knob = ngSliderCtrl.registerKnob({
						ngModel: ngModelCtrl,			// the model
						elem: elem,						// the knob DOM element
						onChange: function(value) {		// what to do when the model changes
							// sync the model
							updateModel(value);
							
							// expose the value to the scope
							scope.$viewValue = value;
							
							// set the CSS as needed
							elem.css(ngSliderCtrl.options.vertical?'top':'left', ngSliderCtrl.valueToPercent(value, elem) + '%');
						},
						onStart: function() {			// what to do when the user starts dragging this knob
							elem.addClass('active');
						},
						onEnd: function() {				// what to do when the user stops dragging this knob
							elem.removeClass('active');
						}
					});
					
					// watch for disabilities
					scope.$watch(function() { return scope.$eval(attr.ngDisabled); }, function(disabled) {
						// is the knob disabled?
						enabled = !disabled;
						
						// tell the DOM
						if(disabled) {
							elem.addClass('disabled');
						} else {
							elem.removeClass('disabled');
						}
						
						// tell the slider this knob is disabled
						knob.disabled()
					});
					
					// set the default events
					var events = ['mousedown', 'touchstart'];
					if(window.PointerEvent) {
						// the browser supports javascript Pointer Events (currently only IE11), use those
						events = ['pointerdown'];
					} else if(window.navigator.MSPointerEnabled) {
						// the browser supports M$'s javascript Pointer Events (IE10), use those
						events = ['MSPointerDown']
					}

					// bind the start events
                    angular.forEach(events, function(event) {
                        elem.bind(event, function(ev) {
                            console.log(event);
							ev.preventDefault();
                            ev.stopPropagation();
							knob.start(ev)
                        });
                    });
                };
            }
        }
    }])
    .directive('ngSliderBar', function() {
        return {
            restrict: 'EA',
            require: '^ngSlider',
			compile: function(elem, attr) {
				// add the class so we can style it
				elem.addClass('ng-slider-bar');
				
				return function(scope, elem, attr, ngSliderCtrl) {
					// set up the defaults
					scope.low = 0;
					scope.high = 0;
					scope.lowKnob = null;
					scope.highKnob = null;

					/**
					 * keep the bar the correct size
					 */
					function updateBar() {
						// get the bar's offset
						var offset = ngSliderCtrl.valueToPercent(scope.low, scope.lowKnob, true);
						
						// compute the size of the bar
						var size = ngSliderCtrl.valueToPercent(scope.high, scope.highKnob, true) - offset;
						
						// set the CSS
						elem.css(ngSliderCtrl.options.vertical?'top':'left', offset+"%");
						elem.css(ngSliderCtrl.options.vertical?'height':'width', size+"%");
					}
					
					// register this bar with the slider
					ngSliderCtrl.registerBar({
						elem: elem,
						scope: scope,
						onChange: function() {
							updateBar();
						}
					});
					
					// watch the attributes for updates
					attr.$observe('low', function(low) {
						scope.low = low;
						updateBar();
					});
					attr.$observe('high', function(high) {
						scope.high = high;
						updateBar();
					});
				}
			}
        }
    });

/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .controller('SliderCtrl', ['$scope', '$element', function($scope, $element) {

		// keep track of the registered knobs
        $scope.knobs = [];
		
		// keep track of the bars that have been created
		$scope.bars = [];
		
		// store the bars registered
		var registeredBars = [];
		
		// we'll use this to tell which knob is currently being moved
		$scope.currentKnob = null;
		$scope.sliding = false;

		// set the default options
		this.options = {
            precision:  	0,
            buffer:     	0,
            steps:      	0,
			addStepNumbers:	false,
            stickiness: 	3,
            scale: 			function(val) { return val; },
			continuous: 	false,
			vertical: 		false
        };
		// reference the options locally to avoid any scoping issues
		var options = this.options;

		/**
		 * Get the current slider size and offset
		 * @returns {{sliderSize: number, sliderOffset: number}}
		 */
		$scope.dimensions = function() {
            var offset = options.vertical?$element[0].offsetTop:$element[0].offsetLeft;

            if($element[0].offsetParent) {
                offset = options.vertical?$element[0].offsetParent.offsetTop:$element[0].offsetParent.offsetLeft
            }

			return {
				sliderSize: options.vertical?$element[0].offsetHeight:$element[0].offsetWidth,
				sliderOffset: offset
			}
		};

		/**
		 * Sort the knobs by model value
		 */
        function updateKnobs() {
			$scope.knobs.sort(function(a, b) {
				var a_val = a.ngModel.$modelValue;
				var b_val = b.ngModel.$modelValue;
				return a_val > b_val?1:(b_val > a_val?-1:0);
			});
        }

		/**
		 * Add a bar
		 */
		function addBar() {
			$scope.bars.push({
				low: function() { return 0; },
				high: function() { return 0; }
			});
		}

		/**
		 * Remove a bar
		 */
		function removeBar() {
			$scope.bars.splice(0,1);
		}

		/**
		 * Make sure the correct number of bars exist and all have the right data 
		 */
		function updateBars() {
			// get the knob count
			var numKnobs = $scope.knobs.length;

			// add bars so we have one more bar than knobs
			while($scope.bars.length < numKnobs + 1) {
				addBar();
			}
			
			// remove bars so we have one more bar than knobs
			while($scope.bars.length > numKnobs + 1) {
				removeBar();
			}

			/**
			 * Isolate the index from the for loop below so the low value is always correct
			 * @param index {number}
			 * @returns {Function}
			 */
			function lowFn(index) {
				/**
				 * Get the low value for the bar
				 * @returns {number}
				 */
				return function() {
					return index > 0 ? $scope.knobs[index - 1].ngModel.$modelValue : $scope.floor;
				}
			}

			/**
			 * Isolate the index from the for loop below so the high value is always correct
			 * @param index {number}
			 * @returns {Function}
			 */
			function highFn(index) {
				/**
				 * Get the high value for the bar
				 * @returns {number}
				 */
				return function() {
					return index < $scope.knobs.length ? $scope.knobs[index].ngModel.$modelValue : $scope.ceiling;
				}
			}

			// update the low and high values for the bars
			angular.forEach($scope.bars, function(bar, b) {
				bar.low = lowFn(b);
				bar.high = highFn(b);
			});

			// update the knobs and fire the change callback for all registered bars
			angular.forEach(registeredBars, function(bar, index) {
				bar.scope.lowKnob = index>0?$scope.knobs[index-1].elem:null;
				bar.scope.highKnob = index<$scope.knobs.length?$scope.knobs[index].elem:null;
				bar.onChange && bar.onChange();
			});
		}

		/**
		 * Call this to refresh the slider
		 */
		$scope.fix = function() {
			updateKnobs();
			updateBars();
		};

		/**
		 * Convert a value to the correct percentage for display purposes
		 * @param value {number}
		 * @param knob {Element}
		 * @param bar {boolean}
		 * @returns {number}
		 */
		this.valueToPercent = function(value, knob, bar) {
			// default the knob to a size of 0
			var knobSize = 0;
			
			if(knob) {
				// we've been given a knob, get the size
				knobSize = this.options.vertical?knob[0].offsetHeight:knob[0].offsetWidth;
			}
			
			// compute the percentage size of the knob
			var knobPercent = knobSize / $scope.dimensions().sliderSize * 100;
			
			// compute the percent offset of the knob taking into account he size of the knob
			var percent = (((parseFloat(value) - $scope.floor) / ($scope.ceiling - $scope.floor)) * (100 - knobPercent));
			
			if(bar && knob) {
				// we're computing this for a bar and we've been given a knob, add half of the knob back to keep the bar in the middle of the knob
				percent += knobPercent/2;
			}
			
			return percent;
		};

		/**
		 * Add the knob to the slider and return some useful functions
		 * @param knob {object}
		 * @returns {{start: start, destroy: destroy}}
		 */
        this.registerKnob = function(knob) {
			
			// is this knob enabled?
			var enabled = true;
			
			// add the knob to the list
			$scope.knobs.push(knob);

			/**
			 * Normalize the value so it adheres to these criteria:
			 * 	- within bounds of the slider
			 * 	- if not continuous, previous and next knobs are <= or >=, respectively
			 * 	- if > 1 step, falls on a step
			 * 	- has the given decimal precision
			 * Then fire this knob's onChange callback if the normalized value is the same as the given value
			 * @param value {number}
			 */
			function normalizeModel(value) {
				
				// initialize the bounds
				var ceiling = $scope.ceiling;
				var floor = $scope.floor;
				
				// start with the original value
				var normalized = parseFloat(value);
				
				// get the index of the knob so we know the surrounding knobs
				var index = $scope.knobs.indexOf(knob);
				
				if(!options.continuous) {
					// keep the knobs contained to their section of the slider
					
					if(index > 0) {
						// this isn't the knob with the lowest value, set the floor to the value of the knob lower than this
						floor = parseFloat($scope.knobs[index - 1].ngModel.$modelValue) + (options.buffer > 0?options.buffer:0);
					}
					if(index < $scope.knobs.length - 1) {
						// this isn't the knob with the highest value, set the ceiling to the value of the knob higher than this
						ceiling = parseFloat($scope.knobs[index + 1].ngModel.$modelValue) - (options.buffer > 0?options.buffer:0);
					}
				}
				
				if(options.steps > 1) {
					// there should be more than one step
					
					// get the width of a step
					var stepWidth = ($scope.ceiling - $scope.floor) / (options.steps-1);
					
					if(index > 0) {
						// this isn't the knob with the lowest value, make sure the floor aligns with a step
						var floorMod = (floor - $scope.floor) % stepWidth;
						if(floorMod > 0) {
							floor += stepWidth - floorMod;
						}
					}
					
					if(index < $scope.knobs.length - 1) {
						// this isn't the knob with the highest value, make sure the ceiling aligns with a step
						var ceilingMod = (ceiling - $scope.floor) % stepWidth;
						if(ceilingMod > 0) {
							ceiling -= ceilingMod;
						}
					}
					
					// align the value with a step
					var mod = (normalized - $scope.floor) % stepWidth;
					if(mod < stepWidth/2) {
						normalized -= mod;
					} else {
						normalized += stepWidth - mod;
					}
				}
				
				// ensure the value is within the bounds
				normalized = Math.min(ceiling, Math.max(normalized, floor));
				
				if(options.precision >= 0) {
					// format the value to the correct decimal precision
					normalized = parseFloat(normalized.toFixed(options.precision));
				}
				
				if(normalized === value) {
					// the normalized value is the same as the original, fire the onChange callback for this knob
					knob.onChange && knob.onChange(value);
				} else if(!isNaN(normalized)) {
					// the normalized value is different than the original (an it's a number), update the model
					knob.ngModel.$setViewValue(normalized);
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}
			}

			/**
			 * Do what's needed to update the DOM
			 * @param value
			 */
			function update(value) {
				if(enabled) {
					// normalize
					normalizeModel(value);

					// fix the DOM
					$scope.fix();

					// make sure the changes are digested
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}
			}

			// watch this knob's model for changes
			$scope.$watch(function() { return knob.ngModel.$modelValue; }, function(value) {
				update(value);
				
			});

			// watch for updates on the slider and update accordingly
			$scope.$watch('floor', function() {
				update(knob.ngModel.$modelValue);
			});
			$scope.$watch('ceiling', function() {
				update(knob.ngModel.$modelValue);
			});
			$scope.$watch(function() { return options; }, function() {
				update(knob.ngModel.$modelValue);
			}, true);

			// initialize the bars
			updateBars();
			
			// listen for when this knob is removed from the DOM, remove it from the list and set to disabled
			knob.elem.on('$destroy', function() {
				$scope.knobs.splice($scope.knobs.indexOf(knob), 1);
				enabled = false;
			});

			// give the knob some useful functions
			return {
				start  : function(ev) {
					if(!$scope.sliding && !$scope.disabled) {
						$scope.currentKnob = knob;
						$scope.sliding = true;
						$scope.onStart(ev);
						knob.onStart();
					}
				},
				disabled: function() {
					if($scope.sliding && $scope.currentKnob == knob) {
						$scope.onEnd();
					}
				}
			}
        };

		/**
		 * Add the bar to the slider
		 * @param bar {object}
		 */
		this.registerBar = function(bar) {
			// add the bar to the list
			registeredBars.push(bar);
			
			// listen for when this bar is removed from the DOM and remove it from the list
			bar.elem.on('$destroy', function() {
				var index = registeredBars.indexOf(bar);
				if(index >= 0) {
					registeredBars.splice(index, 1);
				}
			})
		}
    }]);
