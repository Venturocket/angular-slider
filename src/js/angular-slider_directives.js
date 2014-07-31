/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .directive('ngSlider', ['$log', '$swipe', function($log, $swipe) {
        return {
            restrict: 'EA',
            controller: 'SliderCtrl',
            compile: function(elem, attr) {
                if(angular.isUndefined(attr.floor)) {
                    throw "ngSlider Error: Floor not specified";
                }
                if(angular.isUndefined(attr.ceiling)) {
                    throw "ngSlider Error: Ceiling not specified";
                }

                elem.addClass('ng-slider');

                return function (scope, elem, attr, ctrl) {
                    scope.$watch(function() { return $parse(attr.ngSliderOptions); }, function(opts) {
                        ctrl.opts.extend(angular.isDefined(opts)?opts:{});
                    }, true);
                    
                    scope.$watch(function () { return $parse(attr.floor); }, function(floor) {
                        floor = angular.isDefined(floor)?parseFloat(floor):0;
                        ctrl.floor = isNaN(floor)?0:floor;
                    });
                    scope.$watch(function () { return $parse(attr.ceiling); }, function(ceiling) {
                        ceiling = angular.isDefined(ceiling)?parseFloat(ceiling):0;
                        ctrl.ceiling = isNaN(ceiling)?0:ceiling;
                    });
                };
            }
        }
    }])
    .directive('ngSliderKnob', function() {
        return {
            restrict: 'EA',
            require: ['^ngSlider', '^ngModel'],
            controller: 'SliderKnobCtrl',
            compile: function(elem, attr) {
                if(angular.isUndefined(attr.ngModel)) {
                    throw "ngSliderKnob Error: ngModel not specified";
                }

                elem.addClass('ng-slider-knob');

                return function(scope, elem, attr, ctrls) {
                    ctrls[1].registerKnob(scope, elem);

                    elem.$destroy(function() {
                        ctrls[1].destroyKnob(elem);
                    });

                    scope.$watch(function() { return attr.knobOptions; }, function(opts) {
                        ctrls[0].opts = angular.isDefined(opts)?opts:{};
                    }, true);

                    var startEvents = ['mousedown', 'touchstart', 'MSPointerStart', 'pointerdown'];
                    var moveEvents = ['mousemove', 'touchmove', 'MSPointerMove', 'pointermove'];
                    var cancelEvents = ['mousecancel', 'touchcancel', 'MSPointerCancel', 'pointercancel'];
                    var endEvents = ['mouseup', 'touchend', 'MSPointerUp', 'pointerup'];

                    startEvents.each(function(event) {
                        elem.bind(event, function(ev) {

                        })
                    })
                };
            }
        }
    })
    .directive('ngSliderBar', function() {
        return {
            restrict: 'EA',
            require: ['^ngSlider'],
            link: function(scope, elem, attr, ctrl) {
                ctrl.registerBar(scope, elem);

                elem.$destroy(function() {
                    ctrl.destroyBar(elem);
                });
            }
        }
    })
    .directive('vrSliderGroup', function() {
        return {
            restrict: 'EA'
        }
    });