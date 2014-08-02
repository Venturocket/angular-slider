/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .directive('ngSlider', ['$document', '$timeout', function($document, $timeout) {
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
					
					scope.dimensions = function() {
						return {
							sliderSize: ctrl.options.vertical?elem[0].offsetHeight:elem[0].offsetWidth,
							sliderOffset: ctrl.options.vertical?elem[0].offsetTop:elem[0].offsetLeft
						}
					};
		
					ctrl.valueToPercent = function(value, knob) {
						var knobSize = ctrl.options.vertical?knob[0].offsetHeight:knob[0].offsetWidth;
						var knobPercent = knobSize / scope.dimensions().sliderSize * 100;
						return (((value - scope.floor) / (scope.ceiling - scope.floor)) * (100 - knobPercent)) + "%";
					};
					
					scope.onStart = function(ev) {
						onMove(ev);
					};
					
					function onMove(ev) {
						var dimensions = scope.dimensions();
						var position = (ctrl.options.vertical?ev.clientY:ev.clientX) - scope.dimensions().sliderOffset;
						var knobSize = ctrl.options.vertical?scope.currentKnob.elem[0].offsetHeight:scope.currentKnob.elem[0].offsetWidth;
						var percent = Math.max(0, Math.min((position-(knobSize/2)) / (dimensions.sliderSize-knobSize), 1));
						var value = ((percent * (scope.ceiling - scope.floor)) + scope.floor).toFixed(ctrl.options.precision);
						scope.currentKnob.ngModel.$setViewValue(value);
						scope.$apply();
					}
					
					function onEnd() {
						scope.sliding = false;
					}
					
                    scope.$watch(function() { return scope.$eval(attr.ngDisabled); }, function(disabled) {
                        scope.disabled = angular.isDefined(disabled) && disabled;
						if(scope.disabled) {
							elem.addClass('disabled');
						} else {
							elem.removeClass('disabled');
						}
                    });
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
					
					var moveEvents = ['mousemove', 'touchmove'];
                    var cancelEvents = ['mousecancel', 'touchcancel'];
                    var endEvents = ['mouseup', 'touchend'];
					
					if(window.PointerEvent) {
						moveEvents = ['pointermove'];
						cancelEvents = ['pointercancel'];
						endEvents = ['pointerup'];
					} else if(window.navigator.msPointerEnabled) {
						moveEvents = ['MSPointerMove'];
						cancelEvents = ['MSPointerCancel'];
						endEvents = ['MSPointerUp'];
					}
					
					// handle move
                    angular.forEach(moveEvents, function(event) {
						$document.bind(event, function(ev) {
							if(scope.sliding) {
								ev.preventDefault();
								onMove(ev);
							}
						});
					});
					
					// handle cancel and end
                    angular.forEach(cancelEvents.concat(endEvents), function(event) {
						$document.bind(event, function() {
							if(scope.sliding) {
								onEnd();
							}
						});
					});
                };
            }
        }
    }])
    .directive('ngSliderKnob', ['$parse', function($parse) {
        return {
            restrict: 'EA',
            require: ['^ngSlider', '^ngModel'],
			scope: true,
            compile: function(elem, attr) {
                if(angular.isUndefined(attr.ngModel)) {
                    throw "ngSliderKnob Error: ngModel not specified";
                }
                elem.addClass('ng-slider-knob');

                return function(scope, elem, attr, ctrls) {
					var ngSliderCtrl = ctrls[0];
					var ngModelCtrl = ctrls[1];
					
					var enabled = true;
					
					function updateModel(value) {
						$parse(attr.ngModel).assign(scope.$parent.$parent, value);
						if(!scope.$$phase) {
							scope.$apply();
						}
					}
					
                    scope.knob = ngSliderCtrl.registerKnob({
						ngModel: ngModelCtrl,
						elem: elem,
						onChange: function(value) {
							updateModel(value);
							scope.$viewValue = value;
							elem.css(ngSliderCtrl.options.vertical?'top':'left', ngSliderCtrl.valueToPercent(value, elem));
						},
						onStart: function() {
							elem.addClass('active');
						},
						onEnd: function() {
							elem.removeClass('active');
						}
					});
                    elem.bind('$destroy', function() {
                        scope.knob.destroy();
                    });
					
					scope.$watch(function() { return scope.$eval(attr.ngDisabled); }, function(disabled) {
						enabled = !disabled;
						if(disabled) {
							elem.addClass('disabled');
						} else {
							elem.removeClass('disabled');
						}
					});
					
					var events = ['mousedown', 'touchstart'];
					if(window.PointerEvent) {
						events = ['pointerdown'];
					} else if(window.navigator.MSPointerEnabled) {
						events = ['MSPointerDown']
					}

					// Start events
                    angular.forEach(events, function(event) {
                        elem.bind(event, function(ev) {
							ev.preventDefault();
							scope.knob.start(ev)
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
				elem.addClass('ng-slider-bar');
				
				return function(scope, elem, attr, ngSliderCtrl) {
					var bar = ngSliderCtrl.registerBar({
						scope: scope,
						attr: attr
					});

					elem.bind('$destroy', function() {
						bar.destroy();
					});
					
					attr.$observe('low', function(low) {
						bar.updateLow(low);
					});
					attr.$observe('high', function(high) {
						bar.updateHigh(high);
					});
				}
			}
        }
    });
