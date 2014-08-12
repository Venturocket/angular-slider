/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .directive('ngSlider', ['$document', '$compile', '$interpolate', function($document, $compile, $interpolate) {
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

					/**
					 * Get the current relative position of the cursor at the given index
					 * @param ev {Event}
					 * @param index {number}
					 * @returns {number}
					 */
					function cursorPosition(ev, index) {
						var position = -1 * scope.dimensions().sliderOffset;
						if(ctrl.options.vertical) {
							position += ev.touches[index].pageY || ev.pageY;
						} else {
							position += ev.touches[index].pageX || ev.pageX;
						}
						return position;
					}

					/**
					 * Get the current position of the given knob
					 * @param knob {angular.element}
					 * @returns {number}
					 */
					function knobPosition(knob) {
						var offset = ctrl.options.vertical?knob[0].offsetTop:knob[0].offsetLeft;
						return offset - scope.dimensions().sliderOffset;
					}
					
					// add the bars
					elem.prepend($compile("<ng-slider-bar low='"+$interpolate.startSymbol()+" bar.low() "+$interpolate.endSymbol()+"' high='"+$interpolate.startSymbol()+" bar.high() "+$interpolate.endSymbol()+"' ng-repeat='bar in bars'></ng-slider-bar>")(scope));

					/**
					 * What to do when the user starts sliding
					 * @param ev {Event}
					 */
					scope.onStart = function(ev) {
						// get the index of the touch/mouse
						var index = 0;
						if(ev.targetTouches) {
							index = ev.targetTouches[0].identifier;
						}
						
						// save the starting position(s)
						if(angular.isArray(scope.currentKnobs[index]) && scope.currentKnobs[index].length > 1) {
							var cursorPos = cursorPosition(ev, index);
							scope.startOffsets[index] = scope.currentKnobs[index].map(function(knob) {
								return knobPosition(knob.elem) - cursorPos;
							});
						} else {
							scope.startOffsets[index] = [0];
						}
						
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

						angular.forEach(scope.currentKnobs, function(knobs, index) {
							if(scope.currentKnobs[index]) {
								// get the current mouse position
								var position = cursorPosition(ev, index);

								var startOffsets = scope.startOffsets[index];

								if(!angular.isArray(knobs)) {
									knobs = [knobs];
								}

								// get the size of the knob(s) being dragged
								for(var i = 0; i < knobs.length; i++) {
									// get the size of the knob
									var knobSize = ctrl.options.vertical ? knobs[i].elem[0].offsetHeight : knobs[i].elem[0].offsetWidth;

									// get the current mouse/finger position as a percentage
									var percent = Math.max(0, Math.min((position + startOffsets[i] - (knobSize / 2)) /
																	   (dimensions.sliderSize - knobSize), 1));

									// compute the value from the percentage
									var value = ((percent * (scope.ceiling - scope.floor)) + scope.floor).toFixed(ctrl.options.precision);

									// update the model for the knob being dragged
									knobs[i].ngModel.$setViewValue(value);
									if(!scope.$$phase) {
										scope.$apply();
									}
								}
							}
						});
					};

					/**
					 * What to do when the slide is finished
					 */
					scope.onEnd = function(index) {
						// remove the knob from the list of knobs currently being dragged
						var knobs = scope.currentKnobs[index];
						delete scope.currentKnobs[index];
						
						if(!angular.isArray(knobs)) {
							knobs = [knobs];
						}
						
						console.log(knobs);
						
						angular.forEach(knobs, function(knob) {
							// fire the knob's onEnd callback
							knob.onEnd();
						});
						
						if(scope.currentKnobs.length == 0) {
							// we're no longer sliding
							scope.sliding = false;
						}
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
						$document.bind(event, function(ev) {
							if(scope.sliding) {
								// it's electric, boogie woogie, woogie
								
								// fire the end events for the drags that are ending
								if(ev.changedTouches) {
									for(var i=0; i<ev.changedTouches.length; i++) {
										scope.onEnd(ev.changedTouches[i].identifier);
									}
								} else {
									scope.onEnd(0);
								}
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
							angular.forEach(scope.currentKnobs.keys(), function(index) {
								scope.onEnd(index);
							});
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
							ev.preventDefault();
                            ev.stopPropagation();
							knob.start(ev);
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
						var offset = ngSliderCtrl.valueToPercent(scope.low, scope.lowKnob?scope.lowKnob.elem:null, true);
						
						// compute the size of the bar
						var size = ngSliderCtrl.valueToPercent(scope.high, scope.highKnob?scope.highKnob.elem:null, true) - offset;
						
						// set the CSS
						elem.css(ngSliderCtrl.options.vertical?'top':'left', offset+"%");
						elem.css(ngSliderCtrl.options.vertical?'height':'width', size+"%");
					}
					
					// register this bar with the slider
					var bar = ngSliderCtrl.registerBar({
						elem: elem,
						scope: scope,
						onStart: function() {
							elem.addClass('active');
						},
						onChange: function() {
							updateBar();
						},
						onEnd: function() {
							elem.removeClass('active');
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
							ev.preventDefault();
                            ev.stopPropagation();
							bar.start(ev);
                        });
                    });
				}
			}
        }
    });
