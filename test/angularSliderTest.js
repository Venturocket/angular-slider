describe("Unit: Slider Directive", function() {

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
	
	describe('without sliders and', function() {
		
		beforeEach(function() {
			Modernizr = { inputtypes: { range: false }};
		});
		
		describe('with non-range data', function() {

			beforeEach(function() {
				$rootScope.skill = {
					floor: 1,
					ceiling: 3,
					step: 0.25,
					precision: 2,
					value: 1,
					translate: function(value) {
						return '#'+value+'%';
					}
				};
				spyOn($rootScope.skill,'translate').andCallThrough();
				element = $compile("<slider floor='{{ skill.floor }}' ceiling='{{ skill.ceiling }}' step='{{ skill.step }}' precision='{{ skill.precision }}' translate='skill.translate' ng-model='skill.value'></slider>")($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar').width(500);
				$rootScope.$apply(function() { $rootScope.skill.value = 2; });
			});


			it('should create a new non-range slider', function() {
				expect(element.find('span').length).toBe(5);

				// should be only one bar
				var bar = element.find('.bar');
				expect(bar.length).toBe(1);
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
				Modernizr = { inputtypes: { range: false }};
				$rootScope.skill = {
					floor: 1,
					ceiling: 3,
					step: 0.25,
					buffer:0.5,
					stretch: 4,
					precision: 3,
					values: {
						low: 2,
						high: 2.5
					}
				};
				element = $compile("<slider floor='{{ skill.floor }}' ceiling='{{ skill.ceiling }}' step='{{ skill.step }}' buffer='{{ skill.buffer }}' precision='{{ skill.precision }}' ng-model-low='skill.values.low' ng-model-high='skill.values.high'></slider>")($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar.full').width(500);
				$rootScope.$apply(function() { $rootScope.skill.values.low = 1.5; });
			});
	
	
			it('should create a new range slider', function() {
	
				var bars = $(element).find('.bar');
				expect(bars.length).toEqual(4);
	
				// full bar
				expect(bars.eq(0)).toHaveClass('full');
	
				// selection bar
				expect(bars.eq(1)).toHaveClass('selection');
				expect($(bars[1]).css('left')).toBe('125px');
	
				// low unselection bar
				expect(bars.eq(2)).toHaveClass('unselected');
				expect(bars.eq(2)).toHaveClass('low');
				expect($(bars[2]).css('left')).toBe('0px');
				expect($(bars[2]).width()).toBe(125);
	
				// high unselection bar
				expect(bars.eq(3)).toHaveClass('unselected');
				expect(bars.eq(3)).toHaveClass('high');
				expect($(bars[3]).css('left')).toBe('375px');
				expect($(bars[3]).css('right')).toBe('0px');
	
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
	
				expect($rootScope.skill.values.low).toBe(2);
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
	
				expect($rootScope.skill.values.low).toBe(2);
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
	
				expect($rootScope.skill.values.high).toBe(2);
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
	
				expect($rootScope.skill.values.high).toBe(2);
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
	
				expect($rootScope.skill.values.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
			});
	
			it('should update both values when the selection bar is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.bar.selection');
	
				var diff = $rootScope.skill.values.high - $rootScope.skill.values.low;
	
				// click and drag
				pointer.trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousedown',{clientX: 250}));
				$(document).trigger($.Event('mousemove',{clientX: 125}));
				$(document).trigger($.Event('mouseup',{clientX: 125}));
	
				$rootScope.$digest();
	
				expect($rootScope.skill.values.high - $rootScope.skill.values.low).toBe(diff);
	
				expect($rootScope.skill.values.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.values.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});
	
			it('should update both values when the selection bar is tapped and slid (mouse)', function() {
				var pointer = $(element).find('.bar.selection');
	
				var diff = $rootScope.skill.values.high - $rootScope.skill.values.low;
	
				// click and drag
				pointer.trigger($.Event('touchstart',{clientX: 250}));
				$(document).trigger($.Event('touchstart',{clientX: 250}));
				$(document).trigger($.Event('touchmove',{clientX: 125}));
				$(document).trigger($.Event('touchend',{clientX: 125}));
	
				$rootScope.$digest();
	
				expect($rootScope.skill.values.high - $rootScope.skill.values.low).toBe(diff);
	
				expect($rootScope.skill.values.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.values.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});
	
			it('should update the value when the low unselection bar is clicked', function() {
	
				// click the bar
				$(element).find('.bar.unselected.low').trigger($.Event('mousedown',{ clientX: 62 }));
	
				expect($rootScope.skill.values.low).toBe(1.25);
				expect(element.find('.pointer.low').css('left')).toBe('62.5px');
				expect(element.find('.bubble.low').text()).toBe('1.250');
	
			});
	
			it('should update the value when the high unselection bar is clicked', function() {
	
				// click the bar
				$(element).find('.bar.unselected.high').trigger($.Event('mousedown',{ clientX: 437.5 }));
	
				expect($rootScope.skill.values.high).toBe(2.75);
				expect(element.find('.pointer.high').css('left')).toBe('437.5px');
				expect(element.find('.bubble.high').text()).toBe('2.750');
	
			});
	
		});
	});

	describe('with sliders and', function() {
		
		beforeEach(function() {
			Modernizr = { inputtypes: { range: true }};
		});
		
		describe('with non-range data', function() {

			beforeEach(function() {
				$rootScope.skill = {
					floor: 1,
					ceiling: 3,
					step: 0.25,
					precision: 2,
					value: 1,
					translate: function(value) {
						return '#'+value+'%';
					}
				};
				spyOn($rootScope.skill,'translate').andCallThrough();
				element = $compile("<slider floor='{{ skill.floor }}' ceiling='{{ skill.ceiling }}' step='{{ skill.step }}' precision='{{ skill.precision }}' translate='skill.translate' ng-model='skill.value'></slider>")($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar').width(500);
				$rootScope.$apply(function() { $rootScope.skill.value = 2; });
			});


			it('should create a new non-range slider', function() {
				expect(element.find('span').length).toBe(5);
				expect(element.find('input').length).toBe(1);

				// should be only one bar
				var bar = element.find('.bar');
				expect(bar.length).toBe(1);
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
	
		describe('with range data', function() {

			beforeEach(function() {
				$rootScope.skill = {
					floor: 1,
					ceiling: 3,
					step: 0.25,
					buffer:0.5,
					stretch: 4,
					precision: 3,
					values: {
						low: 2,
						high: 2.5
					}
				};
				element = $compile("<slider floor='{{ skill.floor }}' ceiling='{{ skill.ceiling }}' step='{{ skill.step }}' buffer='{{ skill.buffer }}' precision='{{ skill.precision }}' ng-model-low='skill.values.low' ng-model-high='skill.values.high'></slider>")($rootScope);
				$rootScope.$digest();
				$(element).find('span').css({'display':'block','position':'absolute'});
				$(element).find('.bar.full').width(500);
				$rootScope.$apply(function() { $rootScope.skill.values.low = 1.5; });
			});
	
	
			it('should create a new range slider', function() {
	
				var bars = $(element).find('.bar');
				expect(bars.length).toEqual(4);
	
				// full bar
				expect(bars.eq(0)).toHaveClass('full');
	
				// selection bar
				expect(bars.eq(1)).toHaveClass('selection');
				expect($(bars[1]).css('left')).toBe('125px');
	
				// low unselection bar
				expect(bars.eq(2)).toHaveClass('unselected');
				expect(bars.eq(2)).toHaveClass('low');
				expect($(bars[2]).css('left')).toBe('0px');
				expect($(bars[2]).width()).toBe(125);
	
				// high unselection bar
				expect(bars.eq(3)).toHaveClass('unselected');
				expect(bars.eq(3)).toHaveClass('high');
				expect($(bars[3]).css('left')).toBe('375px');
				expect($(bars[3]).css('right')).toBe('0px');
	
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
	
				expect($rootScope.skill.values.low).toBe(2);
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
	
				expect($rootScope.skill.values.low).toBe(2);
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
	
				expect($rootScope.skill.values.high).toBe(2);
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
	
				expect($rootScope.skill.values.high).toBe(2);
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
	
				expect($rootScope.skill.values.low).toBe(2);
				expect(pointer.css('left')).toBe('250px');
			});
	
			it('should update both values when the selection bar is clicked and dragged (mouse)', function() {
				var pointer = $(element).find('.bar.selection');
				var slider = $(element).find('.input.selection');
	
				var diff = $rootScope.skill.values.high - $rootScope.skill.values.low;
	
				// click and drag
				slider.trigger($.Event('mousedown',{clientX: 250}));
				slider.trigger($.Event('mousemove',{clientX: 125}));
				slider.trigger($.Event('mouseup',{clientX: 125}));
	
				$rootScope.$digest();
	
				expect($rootScope.skill.values.high - $rootScope.skill.values.low).toBe(diff);
	
				expect($rootScope.skill.values.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.values.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});
	
			it('should update both values when the selection bar is tapped and slid (touch)', function() {
				var pointer = $(element).find('.bar.selection');
				var slider = $(element).find('.input.selection');
	
				var diff = $rootScope.skill.values.high - $rootScope.skill.values.low;
	
				// click and drag
				slider.trigger($.Event('touchstart',{clientX: 250}));
				slider.trigger($.Event('touchmove',{clientX: 125}));
				slider.trigger($.Event('touchend',{clientX: 125}));
	
				$rootScope.$digest();
	
				expect($rootScope.skill.values.high - $rootScope.skill.values.low).toBe(diff);
	
				expect($rootScope.skill.values.low).toBe(1);
				expect($(element).find('.pointer.low').css('left')).toBe('0px');
				expect($rootScope.skill.values.high).toBe(2);
				expect($(element).find('.pointer.high').css('left')).toBe('250px');
			});
	
			it('should update the value when the low unselection bar is clicked', function() {
	
				// click the bar
				$(element).find('.input.low').trigger($.Event('mousedown',{ clientX: 62 }));
	
				expect($rootScope.skill.values.low).toBe(1.25);
				expect(element.find('.pointer.low').css('left')).toBe('62.5px');
				expect(element.find('.bubble.low').text()).toBe('1.250');
	
			});
	
			it('should update the value when the high unselection bar is clicked', function() {
	
				// click the bar
				$(element).find('.input.high').trigger($.Event('mousedown',{ clientX: 437.5 }));
	
				expect($rootScope.skill.values.high).toBe(2.75);
				expect(element.find('.pointer.high').css('left')).toBe('437.5px');
				expect(element.find('.bubble.high').text()).toBe('2.750');
	
			});
	
		});
	});

});
