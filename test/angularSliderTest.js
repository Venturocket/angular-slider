/* global describe, beforeEach, spyOn, it, expect, inject  */
/* jshint jquery: true */
describe('Unit: Slider Directive', function() {
	'use strict';

	var $compile;
	var $rootScope;
	var $timeout;
	var $document;
	var element;

	beforeEach(module('vr.directives.slider'));

	beforeEach(inject(function(_$compile_, _$rootScope_,_$timeout_,_$document_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$timeout = _$timeout_;
		$document = _$document_;
	}));

	describe('without range inputs and', function() {
		beforeEach(function() {
			window.AngularSlider = { inputtypes: { range: false } };
		});

		describe('with non-range data', function() {

			beforeEach(function() {
				$rootScope.skill = {
					value: 1,
					translate: function(value) {
						return '#'+value+'%';
					}
				};
				spyOn($rootScope.skill,'translate').andCallThrough();
				element = $compile('<slider floor="1" ceiling="3" step="0.25" precision="2" translate-fn="skill.translate" ng-model="skill.value"></slider>')($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar').width(500);
				$rootScope.$apply(function() { $rootScope.skill.value = 2; });
			});


			it('should create a new non-range slider', function() {
				expect(element.find('span').length).toBe(6);

				// should be only one bar
				var bar = element.find('.bar');
				expect(bar.length).toBe(2);
				expect(bar).toHaveClass('full');

				// should be only one pointer, and it should be in the right position
				var pointer = element.find('.pointer');
				expect(pointer.length).toBe(1);
				expect(pointer).toHaveClass('low');
				expect($(pointer).css('left')).toBe('250px');

				// should be 3 bubbles and should apply the precision and translate function to their texts
				expect(element.find('.bubble').length).toBe(3);
				expect(element.find('.bubble.floor').text()).toBe('#1.00%');
				expect(element.find('.bubble.ceiling').text()).toBe('#3.00%');
				expect(element.find('.bubble.low').text()).toBe('#2.00%');
			});

			it('should update the value when the pointer is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.pointer');

				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousemove',{clientX: 125}));
				$(document).trigger($.Event('mouseup',{clientX: 125}));

				expect($rootScope.skill.value).toBe(1.5);
				expect(pointer.css('left')).toBe('125px');
				expect(element.find('.bubble.low').text()).toBe('#1.50%');
			});

			it('should update the value when the pointer is tapped and slid (touch)', function() {
				var pointer = $(element).find('.pointer');

				// tap and slide
				pointer.trigger($.Event('touchstart',{clientX: 250}));
				$(document).trigger($.Event('touchstart',{clientX: 250}));
				$(document).trigger($.Event('touchmove',{clientX: 125}));
				$(document).trigger($.Event('touchend',{clientX: 125}));

				expect($rootScope.skill.value).toBe(1.5);
				expect(pointer.css('left')).toBe('125px');
				expect(element.find('.bubble.low').text()).toBe('#1.50%');
			});

			it('should update the value when the bar is clicked', function() {

				// click the bar
				$(element).find('.bar').trigger($.Event('mousedown',{ clientX: 375 }));

				expect($rootScope.skill.value).toBe(2.5);
				expect(element.find('.pointer').css('left')).toBe('375px');
				expect(element.find('.bubble.low').text()).toBe('#2.50%');

			});

			it('should respect the step', function() {
				var pointer = $(element).find('.pointer');

				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousemove',{clientX: 200}));
				$(document).trigger($.Event('mouseup',{clientX: 200}));

				expect($rootScope.skill.value).toBe(1.75);
				expect(pointer.css('left')).toBe('187.5px');
				expect(element.find('.bubble.low').text()).toBe('#1.75%');
			});

		});
		describe('with range data', function() {

			beforeEach(function() {
				window.AngularSlider = { inputtypes: { range: false } };
				$rootScope.skill = {
					low: 2,
                    high: 2.5
				};
				element = $compile('<slider floor="1" ceiling="3" step="0.25" buffer="0.5" precision="3" ng-model="skill.low" ng-model-range="skill.high"></slider>')($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar.full').width(500);
				$rootScope.$apply(function() { $rootScope.skill.low = 1.5; });
			});


			it('should create a new range slider', function() {

				var bars = $(element).find('.bar');
				expect(bars.length).toEqual(5);

				// full bar
				expect(bars.eq(0)).toHaveClass('full');

                // steps bar
                expect(bars.eq(1)).toHaveClass('steps');

				// selection bar
				expect(bars.eq(2)).toHaveClass('selection');
				expect($(bars[2]).css('left')).toBe('125px');

				// low unselection bar
				expect(bars.eq(3)).toHaveClass('unselected');
				expect(bars.eq(3)).toHaveClass('low');
				expect($(bars[3]).css('left')).toBe('0px');
				expect($(bars[3]).width()).toBe(125);

				// high unselection bar
				expect(bars.eq(4)).toHaveClass('unselected');
				expect(bars.eq(4)).toHaveClass('high');
				expect($(bars[4]).css('left')).toBe('375px');
				expect($(bars[4]).css('right')).toBe('0px');

				var pointers = element.find('.pointer');
				expect(pointers.length).toEqual(2);
				expect(pointers.eq(0)).toHaveClass('low');
				expect($(pointers[0]).css('left')).toBe('125px');
				expect(pointers.eq(1)).toHaveClass('high');
				expect($(pointers[1]).css('left')).toBe('375px');

				var bubbles = element.find('.bubble');
				expect(bubbles.length).toEqual(6);
				expect(element.find('.bubble.floor').text()).toBe('1.000');
				expect(element.find('.bubble.ceiling').text()).toBe('3.000');
				expect(element.find('.bubble.low').text()).toBe('1.500');
			});

			it('should update the value when the low pointer is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.pointer.low');

				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 125}));
				$(document).trigger($.Event('mousedown',{clientX: 125}));
				$(document).trigger($.Event('mousemove',{clientX: 250}));
				$(document).trigger($.Event('mouseup',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.low').text()).toBe('2.000');
			});

			it('should update the value when the low pointer is tapped and slid (touch)', function() {
				var pointer = $(element).find('.pointer.low');

				// tap and slide
				pointer.trigger($.Event('touchstart',{clientX: 125}));
				$(document).trigger($.Event('touchstart',{clientX: 125}));
				$(document).trigger($.Event('touchmove',{clientX: 250}));
				$(document).trigger($.Event('touchend',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.low').text()).toBe('2.000');
			});

			it('should update the value when the high pointer is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.pointer.high');

				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 375}));
				$(document).trigger($.Event('mousedown',{clientX: 375}));
				$(document).trigger($.Event('mousemove',{clientX: 250}));
				$(document).trigger($.Event('mouseup',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.high).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.high').text()).toBe('2.000');
			});

			it('should update the value when the high pointer is tapped and slid (touch)', function() {
				var pointer = $(element).find('.pointer.high');

				// tap and slide
				pointer.trigger($.Event('touchstart',{clientX: 375}));
				$(document).trigger($.Event('touchstart',{clientX: 375}));
				$(document).trigger($.Event('touchmove',{clientX: 250}));
				$(document).trigger($.Event('touchend',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.high).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.high').text()).toBe('2.000');
			});

			it('should respect the buffer', function() {
				var pointer = $(element).find('.pointer.low');

				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 125}));
				$(document).trigger($.Event('mousedown',{clientX: 125}));
				$(document).trigger($.Event('mousemove',{clientX: 375}));
				$(document).trigger($.Event('mouseup',{clientX: 375}));

				$rootScope.$digest();

				expect($rootScope.skill.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
			});

			it('should update both values when the selection bar is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.bar.selection');

				var diff = $rootScope.skill.high - $rootScope.skill.low;

				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousemove',{clientX: 125}));
				$(document).trigger($.Event('mouseup',{clientX: 125}));

				$rootScope.$digest();

				expect($rootScope.skill.high - $rootScope.skill.low).toBe(diff);

				expect($rootScope.skill.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});

			it('should update both values when the selection bar is tapped and slid (mouse)', function() {
				var pointer = $(element).find('.bar.selection');

				var diff = $rootScope.skill.high - $rootScope.skill.low;

				// click and drag
				pointer.trigger($.Event('touchstart',{clientX: 250}));
				$(document).trigger($.Event('touchstart',{clientX: 250}));
				$(document).trigger($.Event('touchmove',{clientX: 125}));
				$(document).trigger($.Event('touchend',{clientX: 125}));

				$rootScope.$digest();

				expect($rootScope.skill.high - $rootScope.skill.low).toBe(diff);

				expect($rootScope.skill.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});

			it('should update the value when the low unselection bar is clicked', function() {

				// click the bar
				$(element).find('.bar.unselected.low').trigger($.Event('mousedown',{ clientX: 62 }));

				expect($rootScope.skill.low).toBe(1.25);
				expect(parseFloat(element.find('.pointer.low').css('left'))).toBeCloseTo(62.5);
				expect(element.find('.bubble.low').text()).toBe('1.250');

			});

			it('should update the value when the high unselection bar is clicked', function() {

				// click the bar
				$(element).find('.bar.unselected.high').trigger($.Event('mousedown',{ clientX: 437.5 }));

				expect($rootScope.skill.high).toBe(2.75);
				expect(element.find('.pointer.high').css('left')).toBe('437.5px');
				expect(element.find('.bubble.high').text()).toBe('2.750');

			});

		});
	});

	describe('with range inputs and', function() {

		beforeEach(function() {
			window.AngularSlider = { inputtypes: { range: true } };
		});

		describe('non-range data', function() {

			beforeEach(function() {
				$rootScope.skill = {
					value: 1,
					translate: function(value) {
						return '#'+value+'%';
					}
				};
				spyOn($rootScope.skill,'translate').andCallThrough();
				element = $compile('<slider floor="1" ceiling="3" step="0.25" precision="2" translate-fn="skill.translate" ng-model="skill.value"></slider>')($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar').width(500);
				$rootScope.$apply(function() { $rootScope.skill.value = 2; });
			});


			it('should create a new non-range slider', function() {
				expect(element.find('span').length).toBe(6);
				expect(element.find('input').length).toBe(1);

				// should be only one bar
				var bar = element.find('.bar');
				expect(bar.length).toBe(2);
				expect(bar).toHaveClass('full');

				// should be only one pointer, and it should be in the right position
				var pointer = element.find('.pointer');
				expect(pointer.length).toBe(1);
				expect(pointer).toHaveClass('low');
				expect($(pointer).css('left')).toBe('250px');

				// should be 3 bubbles and should apply the precision and translate function to their texts
				expect(element.find('.bubble').length).toBe(3);
				expect(element.find('.bubble.floor').text()).toBe('#1.00%');
				expect(element.find('.bubble.ceiling').text()).toBe('#3.00%');
				expect(element.find('.bubble.low').text()).toBe('#2.00%');
			});

			it('should update the value when the pointer is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.pointer');
				var slider = $(element).find('input');

				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 250}));
				slider.trigger($.Event('mousemove',{clientX: 125}));
				slider.trigger($.Event('mouseup',{clientX: 125}));

				expect($rootScope.skill.value).toBe(1.5);
				expect(pointer.css('left')).toBe('125px');
				expect(element.find('.bubble.low').text()).toBe('#1.50%');
			});

			it('should update the value when the pointer is tapped and slid (touch)', function() {
				var pointer = $(element).find('.pointer');
				var slider = $(element).find('input');

				// tap and slide
				slider.trigger($.Event('touchstart',{clientX: 250}));
				slider.trigger($.Event('touchmove',{clientX: 125}));
				slider.trigger($.Event('touchend',{clientX: 125}));

				expect($rootScope.skill.value).toBe(1.5);
				expect(pointer.css('left')).toBe('125px');
				expect(element.find('.bubble.low').text()).toBe('#1.50%');
			});

			it('should update the value when the bar is clicked', function() {

				// click the bar
				$(element).find('input').trigger($.Event('mousedown',{ clientX: 375 }));

				expect($rootScope.skill.value).toBe(2.5);
				expect(element.find('.pointer').css('left')).toBe('375px');
				expect(element.find('.bubble.low').text()).toBe('#2.50%');

			});

			it('should respect the step', function() {
				var pointer = $(element).find('.pointer');
				var slider = $(element).find('input');

				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 250}));
				slider.trigger($.Event('mousemove',{clientX: 200}));
				slider.trigger($.Event('mouseup',{clientX: 200}));

				expect($rootScope.skill.value).toBe(1.75);
				expect(pointer.css('left')).toBe('187.5px');
				expect(element.find('.bubble.low').text()).toBe('#1.75%');
			});

		});

		describe('range data', function() {

			beforeEach(function() {
				$rootScope.skill = {
					low: 2,
                    high: 2.5
				};
				element = $compile('<slider floor="1" ceiling="3" step="0.25" buffer="0.5" precision="3" ng-model="skill.low" ng-model-range="skill.high"></slider>')($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar.full').width(500);
				$rootScope.$apply(function() { $rootScope.skill.low = 1.5; });
			});


			it('should create a new range slider', function() {

				var bars = $(element).find('.bar');
				expect(bars.length).toEqual(5);

				// full bar
				expect(bars.eq(0)).toHaveClass('full');

                // steps bar
                expect(bars.eq(1)).toHaveClass('steps');

				// selection bar
				expect(bars.eq(2)).toHaveClass('selection');
				expect($(bars[2]).css('left')).toBe('125px');

				// low unselection bar
				expect(bars.eq(3)).toHaveClass('unselected');
				expect(bars.eq(3)).toHaveClass('low');
				expect($(bars[3]).css('left')).toBe('0px');
				expect($(bars[3]).width()).toBe(125);

				// high unselection bar
				expect(bars.eq(4)).toHaveClass('unselected');
				expect(bars.eq(4)).toHaveClass('high');
				expect($(bars[4]).css('left')).toBe('375px');
				expect($(bars[4]).css('right')).toBe('0px');

				var pointers = element.find('.pointer');
				expect(pointers.length).toEqual(2);
				expect(pointers.eq(0)).toHaveClass('low');
				expect($(pointers[0]).css('left')).toBe('125px');
				expect(pointers.eq(1)).toHaveClass('high');
				expect($(pointers[1]).css('left')).toBe('375px');

				var inputs = element.find('input');
				expect(inputs.length).toEqual(3);
				expect(inputs.eq(0)).toHaveClass('low');
				expect(inputs.eq(1)).toHaveClass('high');
				expect(inputs.eq(2)).toHaveClass('selection');

				var bubbles = element.find('.bubble');
				expect(bubbles.length).toEqual(6);
				expect(element.find('.bubble.floor').text()).toBe('1.000');
				expect(element.find('.bubble.ceiling').text()).toBe('3.000');
				expect(element.find('.bubble.low').text()).toBe('1.500');
			});

			it('should update the value when the low pointer is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.pointer.low');
				var slider = $(element).find('.input.low');

				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 125}));
				slider.trigger($.Event('mousemove',{clientX: 250}));
				slider.trigger($.Event('mouseup',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.low').text()).toBe('2.000');
			});

			it('should update the value when the low pointer is tapped and slid (touch)', function() {
				var pointer = $(element).find('.pointer.low');
				var slider = $(element).find('.input.low');

				// tap and slide
				slider.trigger($.Event('touchstart',{clientX: 125}));
				slider.trigger($.Event('touchmove',{clientX: 250}));
				slider.trigger($.Event('touchend',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.low').text()).toBe('2.000');
			});

			it('should update the value when the high pointer is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.pointer.high');
				var slider = $(element).find('.input.high');

				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 375}));
				slider.trigger($.Event('mousemove',{clientX: 250}));
				slider.trigger($.Event('mouseup',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.high).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.high').text()).toBe('2.000');
			});

			it('should update the value when the high pointer is tapped and slid (touch)', function() {
				var pointer = $(element).find('.pointer.high');
				var slider = $(element).find('.input.high');

				// tap and slide
				slider.trigger($.Event('touchstart',{clientX: 375}));
				slider.trigger($.Event('touchmove',{clientX: 250}));
				slider.trigger($.Event('touchend',{clientX: 250}));

				$rootScope.$digest();

				expect($rootScope.skill.high).toBe(2);
				expect(pointer.css('left')).toBe('250px');
				expect(element.find('.bubble.high').text()).toBe('2.000');
			});

			it('should respect the buffer', function() {
				var pointer = $(element).find('.pointer.low');
				var slider = $(element).find('.input.low');

				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 125}));
				slider.trigger($.Event('mousemove',{clientX: 375}));
				slider.trigger($.Event('mouseup',{clientX: 375}));

				$rootScope.$digest();

				expect($rootScope.skill.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
			});

			it('should update both values when the selection bar is clicked and dragged (mouse)', function() {
				var slider = $(element).find('.input.selection');

				var diff = $rootScope.skill.high - $rootScope.skill.low;

				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 250}));
				slider.trigger($.Event('mousemove',{clientX: 125}));
				slider.trigger($.Event('mouseup',{clientX: 125}));

				$rootScope.$digest();

				expect($rootScope.skill.high - $rootScope.skill.low).toBe(diff);

				expect($rootScope.skill.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});

			it('should update both values when the selection bar is tapped and slid (touch)', function() {
				var slider = $(element).find('.input.selection');

				var diff = $rootScope.skill.high - $rootScope.skill.low;

				// click and drag
				slider.trigger($.Event('touchstart',{clientX: 250}));
				slider.trigger($.Event('touchmove',{clientX: 125}));
				slider.trigger($.Event('touchend',{clientX: 125}));

				$rootScope.$digest();

				expect($rootScope.skill.high - $rootScope.skill.low).toBe(diff);

				expect($rootScope.skill.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});

			it('should update the value when the low unselection bar is clicked', function() {

				// click the bar
				$(element).find('.input.low').trigger($.Event('mousedown',{ clientX: 62 }));

				expect($rootScope.skill.low).toBe(1.25);
				expect(parseFloat(element.find('.pointer.low').css('left'))).toBeCloseTo(62.5);
				expect(element.find('.bubble.low').text()).toBe('1.250');

			});

			it('should update the value when the high unselection bar is clicked', function() {

				// click the bar
				$(element).find('.input.high').trigger($.Event('mousedown',{ clientX: 437.5 }));

				expect($rootScope.skill.high).toBe(2.75);
				expect(element.find('.pointer.high').css('left')).toBe('437.5px');
				expect(element.find('.bubble.high').text()).toBe('2.750');

			});

		});
	});

    describe('with a scaling function', function() {

        beforeEach(function() {
            window.AngularSlider = { inputtypes: { range: true } };
            $rootScope.skill = {
                value: 1.5,
                values: {
                    low: 3,
                    high: 16
                },
                sq   : function(value) {
                    return Math.pow(value, 2);
                },
                sqRt : function(value) {
                    return Math.sqrt(value);
                }
            };
        });

        describe('and non-range data', function() {

            beforeEach(function() {
                element = $compile('<slider floor="1" ceiling="9" precision="2" scale-fn="skill.sq" inverse-scale-fn="skill.sqRt" ng-model="skill.value"></slider>')($rootScope);
                $rootScope.$digest();
                $(element).find('span').css({'display':'block','position':'absolute'});
                $(element).find('.bar.full').width(400);
                $rootScope.$apply(function() { $rootScope.skill.value = 1; });
            });

            it('should scale the value according to a squaring function', function() {
                var input = $(element).find('.input.low');

                input.trigger($.Event('mousedown',{ clientX: 0 }));
                input.trigger($.Event('mousemove',{ clientX: 200 }));
                input.trigger($.Event('mouseup',{clientX: 200}));

                expect($rootScope.skill.value).toBe(4.00);
                expect($(element).find('.bubble.low').text()).toBe('4.00');
            });

        });

        describe('and range data', function() {

            beforeEach(function() {
                element = $compile('<slider floor="1" ceiling="25" precision="2" scale-fn="skill.sq" inverse-scale-fn="skill.sqRt" ng-model="skill.values.low" ng-model-range="skill.values.high"></slider>')($rootScope);
                $rootScope.$digest();
                $(element).find('span').css({'display':'block','position':'absolute'});
                $(element).find('.bar.full').width(400);
                $rootScope.$apply(function() { $rootScope.skill.values.low = 4; });
            });

            it('should scale the value according to a squaring function', function() {
                var input = $(element).find('.input.selection');

                input.trigger($.Event('mousedown',{ clientX: 200 }));
                input.trigger($.Event('mousemove',{ clientX: 100 }));
                input.trigger($.Event('mouseup',{clientX: 100}));

                expect($rootScope.skill.values.low).toBe(1.00);
                expect($rootScope.skill.values.high).toBe(13.00);

                expect($(element).find('.bubble.low').text()).toBe('1.00');
                expect($(element).find('.bubble.high').text()).toBe('13.00');
            });

        });
    });

    describe('in an ngRepeat', function() {

        beforeEach(function() {
            window.AngularSlider = { inputtypes: { range: true } };
            $rootScope.skills = [
                {
                    floor: 1,
                    ceiling: 3,
                    value: 1.5,
                    precision: 2
                },
                {
                    floor: 1,
                    ceiling: 3,
                    value: 1.5,
                    precision: 2
                }
            ];
            element = $compile(
                '<div><div ng-repeat="skill in skills">' +
                    '<slider id="slider{{ $index+1 }}" floor="{{ skill.floor }}" ceiling="{{ skill.ceiling }}" precision="{{ skill.precision }}" ng-model="skill.value"></slider>' +
                '</div></div>')($rootScope);
            $rootScope.$digest();
            $(element).find('span').css({'display':'block','position':'absolute'});
            $(element).find('.bar.full').width(400);
            $rootScope.$apply(function() { $rootScope.skills[0].value = 2; });
        });

        it('should only move the first slider', function() {

            var slider = $(element).find('#slider1');
            var input = slider.find('.input.low');

            // click the first slider
            input.trigger($.Event('mousedown',{ clientX: 300 }));

            expect($rootScope.skills[0].value).toBe(2.50);
            expect(slider.find('.pointer.low').css('left')).toBe('300px');
            expect(slider.find('.bubble.low').text()).toBe('2.50');

            expect($rootScope.skills[1].value).toBe(1.5);

        });
    });

    describe('with stickiness', function() {

        beforeEach(function() {
            window.AngularSlider = { inputtypes: { range: true } };
            $rootScope.skill = 1.5;
            element = $compile('<slider floor="1" ceiling="3" stickiness="4" precision="2" step="0.5" ng-model="skill"></slider>')($rootScope);
            $rootScope.$digest();
            $(element).find('span').css({'display':'block','position':'absolute'});
            $(element).find('.bar.full').width(400);
            $rootScope.$apply(function() { $rootScope.skill = 2; });
        });

        it('should apply some stickiness when dragged', function() {
            var input = $(element).find('.input.low');

            input.trigger($.Event('mousedown',{ clientX: 200 }));
            input.trigger($.Event('mousemove',{ clientX: 245 }));

            expect($rootScope.skill).toBe(2.00);
            var left = parseFloat($(element).find('.pointer.low').css('left'));
            expect(left).toBeLessThan(245);
            expect(left).toBeGreaterThan(200);
            expect($(element).find('.bubble.low').text()).toBe('2.00');
        });
    });

    describe('with non-range data', function() {
        beforeEach(function() {
            window.AngularSlider = { inputtypes: { range: true } };
            $rootScope.skill = 1.5;
            $rootScope.change = function() {};
            element = $compile('<slider floor="1" ceiling="3" precision="2" step="0.5" ng-model="skill" ng-change="change()"></slider>')($rootScope);
            $rootScope.$digest();
            $(element).find('span').css({'display':'block','position':'absolute'});
            $(element).find('.bar.full').width(400);
            $rootScope.$apply(function() { $rootScope.skill = 2; });
        });

		it('should be pristine', function() {
			expect(element).toHaveClass('ng-pristine');
		});

		it('should be dirty after moving the knob', function() {

            var input = $(element).find('.input.low');

            input.trigger($.Event('mousedown',{ clientX: 200 }));
            input.trigger($.Event('mousemove',{ clientX: 245 }));

			expect(element).toHaveClass('ng-dirty');
		});

		it('should fire the change event', function() {
			spyOn($rootScope, 'change');
			var input = $(element).find('.input.low');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 245 }));

			expect($rootScope.change).toHaveBeenCalled();
		});

	});

	describe('with range data', function() {

		beforeEach(function() {
			window.AngularSlider = { inputtypes: { range: true } };
			$rootScope.skill = { low: 1.5, high: 2 };
			$rootScope.change = function() {};
			element = $compile('<slider floor="1" ceiling="3" precision="2" step="0.5" ng-model="skill.low" ng-model-range="skill.high" ng-change="change(skill)"></slider>')($rootScope);
			$rootScope.$digest();
			$(element).find('span').css({'display':'block','position':'absolute'});
			$(element).find('.bar.full').width(400);
			$rootScope.$apply(function() { $rootScope.skill.low = 1; });
		});

		it('should be pristine', function() {
			expect(element).toHaveClass('ng-pristine');
		});

		it('should be dirty after moving the knob', function() {

			var input = $(element).find('.input.high');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 245 }));

			expect(element).toHaveClass('ng-dirty');
		});

		it('should fire the change event', function() {
			spyOn($rootScope, 'change');
			var input = $(element).find('.input.high');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 245 }));

			expect($rootScope.change).toHaveBeenCalledWith({ low: 1, high: 2 });
		});
	});

	describe('with non-range data', function() {

		beforeEach(function() {
			window.AngularSlider = { inputtypes: { range: true } };
			$rootScope.skill = 1.5;
			$rootScope.disabled = false;
			element = $compile('<slider floor="1" ceiling="3" precision="2" ng-model="skill" ng-disabled="disabled"></slider>')($rootScope);
			$rootScope.$digest();
			$(element).find('span').css({'display':'block','position':'absolute'});
			$(element).find('.bar.full').width(400);
			$rootScope.$apply(function() { $rootScope.skill = 2; });
		});

		it('should move when disabled is false', function() {

			var input = $(element).find('.input.low');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 300 }));

			expect($rootScope.skill).toBeCloseTo(2.5);
		});

		it('should not move when disabled is true', function() {
			$rootScope.disabled = true;
			$rootScope.$digest();
			var input = $(element).find('.input.low');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 300 }));

			expect($rootScope.skill).toBe(2);
		});

	});

	describe('with range data', function() {

		beforeEach(function() {
			window.AngularSlider = { inputtypes: { range: true } };
			$rootScope.skill = { low: 1.5, high: 2 };
			$rootScope.disabled = false;
			element = $compile('<slider floor="1" ceiling="3" precision="2" ng-model="skill.low" ng-model-range="skill.high" ng-disabled="disabled"></slider>')($rootScope);
			$rootScope.$digest();
			$(element).find('span').css({'display':'block','position':'absolute'});
			$(element).find('.bar.full').width(400);
			$rootScope.$apply(function() { $rootScope.skill.low = 1; });
		});

		it('should move when disabled is false', function() {

			var input = $(element).find('.input.high');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 300 }));

			expect($rootScope.skill.high).toBeCloseTo(2.5);
		});

		it('should not move when disabled is true', function() {
			$rootScope.disabled = true;
			$rootScope.$digest();
			var input = $(element).find('.input.high');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 300 }));

			expect($rootScope.skill.high).toBe(2);
		});

	});

	describe('with "step-width" attribute', function() {

		beforeEach(function() {
			window.AngularSlider = { inputtypes: { range: true } };
			$rootScope.skill = 1.5;
			$rootScope.disabled = false;
			element = $compile('<slider floor="1" ceiling="3" precision="2" step-width="0.25" show-steps="true" ng-model="skill"></slider>')($rootScope);
			$rootScope.$digest();
			$(element).find('span').css({'display':'block','position':'absolute'});
			$(element).find('.bar.full').width(400);
			$rootScope.$apply(function() { $rootScope.skill = 2; });
		});

		it('should respect the step width', function() {

			var input = $(element).find('.input.low');

			input.trigger($.Event('mousedown',{ clientX: 200 }));
			input.trigger($.Event('mousemove',{ clientX: 320 }));

			expect($rootScope.skill).toBe(2.5);
		});

	});

});
