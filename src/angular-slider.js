angular.module('vr.directives.slider',['ngTouch'])
	.directive('slider', ['$timeout', '$document', '$interpolate', '$swipe', function($timeout, $document, $interpolate, $swipe) {
		var angularize, bindHtml, gap, halfWidth, hide, offset, offsetLeft, pixelize, roundStep, stepBuffer, expression, show, width, STRETCH_RESISTANCE, startSymbol, endSymbol;

		STRETCH_RESISTANCE = 3;
		
		startSymbol = $interpolate.startSymbol();
		endSymbol = $interpolate.endSymbol();

		angularize = function(element) {
			return angular.element(element);
		};

		pixelize = function(position) {
			return "" + position + "px";
		};

		hide = function(element) {
			return element.css({
				opacity: 0
			});
		};

		show = function(element) {
			return element.css({
				opacity: 1
			});
		};

		offset = function(element, position) {
			return element.css({
				left: position
			});
		};

		halfWidth = function(element) {
			return width(element) / 2;
		};

		offsetLeft = function(element) {
			try {return element.offset().left;} catch(e) {}
			return element[0].getBoundingClientRect().left; // + scrollX;
		};

		width = function(element) {
			var width = parseFloat(element.css('width'));
			return isNaN(width) ? element[0].offsetWidth : width;
		};

		gap = function(element1, element2) {
			return offsetLeft(element2) - offsetLeft(element1) - width(element1);
		};

		bindHtml = function(element, html) {
			return element.attr('ng-bind-template', html);
		};

		roundStep = function(value, precision, step, floor, ceiling) {
			var decimals, remainder, roundedValue, steppedValue;

			if(step == null || step == 0) {
				step = 1 / Math.pow(10, precision);
			}
			if(floor == null) {
				floor = 0;
			}
			if(value == null || isNaN(value)) {
				value = 0;
			}
			remainder = (value - floor) % step;
			steppedValue = remainder > (step / 2) ? value + step - remainder : value - remainder;
			decimals = Math.pow(10, precision);
			roundedValue = steppedValue * decimals / decimals;
			if(ceiling == null) {
				ceiling = roundedValue;
			}
			roundedValue = roundedValue < floor ? floor : roundedValue > ceiling ? ceiling : roundedValue;
			return parseFloat(roundedValue.toFixed(precision));
		};

		stepBuffer = function(step, buffer) {
			if(step > 0 && !isNaN(buffer)) {
				return Math.ceil(buffer / step) * step;
			}
			return buffer;
		};
		
		expression = function(exp) {
			return startSymbol + " " + exp + " " + endSymbol;
		};

		return {
			restrict: 'EA',
			scope   : {
				floor      : '@',
				ceiling    : '@',
				step       : '@',
				precision  : '@',
				buffer     : '@',
				stretch    : '@',
				ngModel    : '=',
				ngModelLow : '=',
				ngModelHigh: '=',
				translate  : '&'
			},
			template: "<span class='bar full'></span><span class='bar selection'></span><span class='bar unselected low'></span><span class='bar unselected high'></span><span class='pointer low'></span><span class='pointer high'></span><span class='bubble low'></span><span class='bubble high'></span><span class='bubble middle'></span><span class='bubble selection'></span><span class='bubble limit floor'></span><span class='bubble limit ceiling'></span><input type='range' class='input low' /><input type='range' class='input high' /><input type='range' class='input selection' />",
			compile : function(element, attributes) {
				var ceilBub, cmbBub, e, flrBub, fullBar, highBub, lowBub, maxPtr, minPtr, range, inputs, refHigh, refLow, refSel, selBar, unSelBarLow, unSelBarHigh, selBub, minInput, maxInput, selInput, watchables, _i, _len, _ref, _ref1;

				if(attributes.translate) {
					attributes.$set('translate', "" + attributes.translate + "(value)");
				}
				range = (attributes.ngModel == null) && ((attributes.ngModelLow != null) && (attributes.ngModelHigh != null));
				inputs = Modernizr.inputtypes.range || false;
				_ref = (function() {
					var _i, _len, _ref, _results;

					_ref = element.children();
					_results = [];
					for(_i = 0, _len = _ref.length; _i < _len; _i++) {
						e = _ref[_i];
						e = angularize(e);
						e.css({
							'white-space': 'nowrap',
							position:    'absolute',
							display:     'block',
							'z-index': 1
						});
						_results.push(e);
					}
					return _results;
				})(), fullBar = _ref[0], selBar = _ref[1], unSelBarLow = _ref[2], unSelBarHigh = _ref[3], minPtr = _ref[4], maxPtr = _ref[5], 
					lowBub = _ref[6], highBub = _ref[7], cmbBub = _ref[8], selBub = _ref[9], flrBub = _ref[10], ceilBub = _ref[11], 
					minInput = _ref[12], maxInput = _ref[13], selInput = _ref[14];
				
				fullBar.css({
					left: 0,
					right: 0
				});
				
				refLow = range ? 'ngModelLow' : 'ngModel';
				refHigh = 'ngModelHigh';
				refSel = 'selectBar';
				if(inputs) {
					var inputStyles = {
						position: 'absolute',
						margin: 0,
						padding: 0,
						opacity: 0,
						height: '100%'
					};
					
					minInput.attr('step',expression("inputSteps()"));
					minInput.attr('min',expression("floor"));
					minInput.css(inputStyles);
					minInput.css('left',0);
					if(range) {
						minInput.attr('max',expression("ngModelHigh - (buffer / 2)"));
						maxInput.attr('step',expression("inputSteps()"));
						maxInput.attr('min',expression("ngModelLow + (buffer / 2)"));
						maxInput.attr('max',expression("ceiling"));
						maxInput.css(inputStyles);
						selInput.attr('step',expression("inputSteps()"));
						selInput.attr('min',expression("ngModelLow"));
						selInput.attr('max',expression("ngModelHigh"));
						selInput.css(inputStyles);
					} else {
						minInput.attr('max',expression("ceiling"));
						minInput.css({
							width: '100%'
						});
						maxInput.remove();
						selInput.remove();
					}
				} else {
					minInput.remove();
					maxInput.remove();
					selInput.remove();
				}
				bindHtml(ceilBub, expression("translation(ceiling)"));
				bindHtml(flrBub, expression("translation(floor)"));
				bindHtml(selBub, "Range: "+expression("translation(diff)"));
				bindHtml(lowBub, expression("translation(" + refLow + ")"));
				bindHtml(highBub, expression("translation(" + refHigh + ")"));
				bindHtml(cmbBub, expression("translation(" + refLow + ")")+" - "+expression("translation(" + refHigh + ")"));
				if(!range) {
					_ref1 = [selBar, unSelBarLow, unSelBarHigh, maxPtr, selBub, highBub, cmbBub];
					for(_i = 0, _len = _ref1.length; _i < _len; _i++) {
						element = _ref1[_i];
						element.remove();
					}
				}
				watchables = [refLow, 'floor', 'ceiling'];
				if(range) {
					watchables.push(refHigh);
					watchables.push('buffer');
				}
				return {
					post: function(scope, element, attributes) {

						scope.translation = function(value) {
							value = parseFloat(value).toFixed(scope.precision);
							if(angular.isUndefined(attributes.translate)) {
								return ''+value;
							}
							return scope.translate({value: value});
						};
						
						scope.inputSteps = function() {
							return Math.pow(10,scope.precision*-1);
						};

						var barWidth, boundToInputs, dimensions, maxOffset, maxValue, minOffset, minValue, offsetRange, pointerHalfWidth, updateDOM, valueRange, w, _j, _len1, stickyOffsetLow = 0, stickyOffsetHigh = 0;

						boundToInputs = false;
						pointerHalfWidth = barWidth = minOffset = maxOffset = minValue = maxValue = valueRange = offsetRange = void 0;
						dimensions = function() {
							var value, _j, _len1, buffer;

							if(angular.isUndefined(scope.precision)) {
								scope.precision = 0;
							}
							if(angular.isUndefined(scope.step)) {
								scope.step = 0;
							}
							scope.buffer = buffer = stepBuffer(parseFloat(scope.step), parseFloat(scope.buffer));
							scope.floor = parseFloat(scope.floor);
							scope.ceiling = parseFloat(scope.ceiling);
							for(_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
								value = watchables[_j];
								if(value == refLow || value == refHigh) {
									scope[value] = roundStep(parseFloat(scope[value]), parseFloat(scope.precision), parseFloat(scope.step),
										parseFloat(scope.floor), parseFloat(scope.ceiling));
								}
							}
							if(range && parseFloat(scope[refHigh]) < parseFloat(scope[refLow])) {
								var temp = scope[refHigh];
								scope[refHigh] = scope[refLow];
								scope[refLow] = temp;
							}
							if(range) {
								scope.diff = roundStep(scope[refHigh] - scope[refLow], parseFloat(scope.precision), parseFloat(scope.step));
								if(buffer > 0 && scope.diff < buffer) {
									var avg = (parseFloat(scope[refLow]) + parseFloat(scope[refHigh])) / 2;
									scope[refLow] = roundStep(avg - (buffer / 2), parseFloat(scope.precision), parseFloat(scope.step),
										parseFloat(scope.floor), parseFloat(scope.ceiling));
									scope[refHigh] = parseFloat(scope[refLow]) + buffer;
									if(scope[refHigh] > scope.ceiling) {
										scope[refLow] -= buffer;
										scope[refHigh] = scope.ceiling;
									}
									scope.diff = buffer;
								}
							}
							pointerHalfWidth = halfWidth(minPtr);
							barWidth = width(fullBar);
							minOffset = offsetLeft(fullBar);
							maxOffset = minOffset + barWidth - width(minPtr);
							minValue = parseFloat(attributes.floor);
							maxValue = parseFloat(attributes.ceiling);
							valueRange = maxValue - minValue;
							return offsetRange = maxOffset - minOffset;
						};
						updateDOM = function() {
							var adjustBubbles, fitToBar, percentFromOffset, valueOffset, percentToOffset, percentValue, setBindings, setPointers, percentStretch, onEnd, onMove, onStart, dragRange, lowOffset, highOffset, newLow, newHigh, pointer, ref;
							
							dimensions();

							offset(flrBub,0);
							offset(ceilBub,pixelize(barWidth - width(ceilBub)));

							percentFromOffset = function(offset) {
								return ((offset - minOffset) / offsetRange) * 100;
							};
							valueOffset = function(value) {
								return (((value - minValue) / valueRange) * offsetRange) + minOffset;
							};
							percentValue = function(value) {
								return ((value - minValue) / valueRange) * 100;
							};
							percentToOffset = function(percent) {
								return pixelize(percent * offsetRange / 100);
							};
							fitToBar = function(element) {
								return offset(element, percentToOffset(percentFromOffset(Math.min(Math.max(minOffset, offsetLeft(element)), maxOffset))));
							};
							percentStretch = function(percent, maxPercent, end) {
								var sign = percent > 0 ? 1 : -1;
								maxPercent = maxPercent == 0 ? 100 : maxPercent;
								if(end) {
									return (
										Math.sin(
											(Math.min(Math.abs(percent / maxPercent), 1) * Math.PI) -
											(Math.PI / 2)
										) + 1
									) * sign * maxPercent / 6;
								}
								var stretch = parseInt(scope.stretch) || STRETCH_RESISTANCE;
								return sign * Math.pow(Math.min(Math.abs(percent / maxPercent * 2), 1), stretch) * maxPercent / 2;
							};
							setPointers = function() {
								var newHighValue, newLowValue, newLowPercent, newHighPercent, maxPercent, bufferPercent, ptrWidthPercent;

								maxPercent = percentValue(parseFloat(scope.step) + minValue);
								bufferPercent = percentValue(stepBuffer(parseFloat(scope.step), parseFloat(scope.buffer)) + minValue);

								newLowValue = percentValue(scope[refLow]);
								newLowPercent = newLowValue + percentStretch(stickyOffsetLow, maxPercent);
								offset(minPtr, percentToOffset(newLowPercent));
								offset(lowBub, percentToOffset(percentFromOffset(offsetLeft(minPtr) - halfWidth(lowBub) + pointerHalfWidth)));
								if(range) {
									newHighValue = percentValue(scope[refHigh]);
									if(newLowPercent > newHighValue - bufferPercent) {
										newLowPercent = newLowValue + percentStretch(stickyOffsetLow, bufferPercent, true);
										offset(minPtr, percentToOffset(newLowPercent));
										offset(lowBub, percentToOffset(percentFromOffset(offsetLeft(minPtr) - halfWidth(lowBub) + pointerHalfWidth)));
									}
									newHighPercent = newHighValue + percentStretch(stickyOffsetHigh, maxPercent);
									if(newHighPercent < newLowValue + bufferPercent) {
										newHighPercent = newHighValue + percentStretch(stickyOffsetHigh, bufferPercent, true);
									}
									offset(maxPtr, percentToOffset(newHighPercent));
									offset(highBub, percentToOffset(percentFromOffset(offsetLeft(maxPtr) - halfWidth(highBub) + pointerHalfWidth)));
									ptrWidthPercent = percentFromOffset(pointerHalfWidth + minOffset);
									offset(selBar, percentToOffset(newLowPercent + ptrWidthPercent));
									selBar.css({
										width: percentToOffset(newHighPercent - newLowPercent)
									});
									selInput.css({
										left: percentToOffset(newLowPercent + (ptrWidthPercent * 2)),
										width: percentToOffset(newHighPercent - newLowPercent - (ptrWidthPercent * 2))
									});
									unSelBarLow.css({
										left : 0,
										width: percentToOffset(newLowPercent + ptrWidthPercent)
									});
									offset(unSelBarHigh, percentToOffset(newHighPercent + ptrWidthPercent));
									unSelBarHigh.css({
										right: 0
									});
									offset(selBub, percentToOffset(newLowPercent + percentFromOffset(halfWidth(selBar) - halfWidth(selBub) + minOffset)));
									offset(cmbBub, percentToOffset(newLowPercent + percentFromOffset(halfWidth(selBar) - halfWidth(cmbBub) + minOffset)));
									if(inputs) {
										minInput.css({
											width: (newHighPercent - (bufferPercent / 2))+'%'
										});
										var maxInputLowPercent = newLowPercent + (bufferPercent / 2); 
										maxInput.css({
											left: maxInputLowPercent+'%',
											width: (100 - maxInputLowPercent)+'%'
										});
									}
								}
							};
							adjustBubbles = function() {
								var bubToAdjust;

								fitToBar(lowBub);
								bubToAdjust = highBub;
								if(range) {
									fitToBar(highBub);
									fitToBar(selBub);
									if(gap(lowBub, highBub) < 10) {
										hide(lowBub);
										hide(highBub);
										fitToBar(cmbBub);
										show(cmbBub);
										bubToAdjust = cmbBub;
									} else {
										show(lowBub);
										show(highBub);
										hide(cmbBub);
										bubToAdjust = highBub;
									}
								}
								if(gap(flrBub, lowBub) < 5) {
									hide(flrBub);
								} else {
									if(range) {
										if(gap(flrBub, bubToAdjust) < 5) {
											hide(flrBub);
										} else {
											show(flrBub);
										}
									} else {
										show(flrBub);
									}
								}
								if(gap(lowBub, ceilBub) < 5) {
									return hide(ceilBub);
								} else {
									if(range) {
										if(gap(bubToAdjust, ceilBub) < 5) {
											return hide(ceilBub);
										} else {
											return show(ceilBub);
										}
									} else {
										return show(ceilBub);
									}
								}
							};

							// element event bindings
							onEnd = function() {
								stickyOffsetLow = 0;
								stickyOffsetHigh = 0;
								if(pointer) {
									setPointers();
									adjustBubbles();
									pointer.removeClass('active');
								}
								pointer = null;
								ref = null;
								dragRange = false;
							};
							onMove = function(event) {
								if(pointer) {
									var eventX, newOffset, newPercent, newValue, buffer;

									buffer = stepBuffer(parseFloat(scope.step), parseFloat(scope.buffer));

									eventX = event.clientX || event.x;
									if(dragRange) {
										newLow = eventX - lowOffset;
										newHigh = eventX + highOffset;
										if(newLow < minOffset) {
											newHigh += minOffset - newLow;
											newLow = minOffset;
										} else if(newHigh > maxOffset) {
											newLow -= newHigh - maxOffset;
											newHigh = maxOffset;
										}
										newLow = percentFromOffset(newLow);
										newHigh = percentFromOffset(newHigh);
										stickyOffsetLow = newLow;
										newLow = minValue + (valueRange * newLow / 100.0);
										newHigh = minValue + (valueRange * newHigh / 100.0);
										newLow = roundStep(newLow, parseFloat(scope.precision), parseFloat(scope.step), parseFloat(scope.floor),
											parseFloat(scope.ceiling));
										newHigh = roundStep(newHigh, parseFloat(scope.precision), parseFloat(scope.step), parseFloat(scope.floor),
											parseFloat(scope.ceiling));
										scope[refLow] = newLow;
										scope[refHigh] = newHigh;
										stickyOffsetLow = stickyOffsetHigh = stickyOffsetLow - percentValue(newLow);
									} else {
										newOffset = eventX + minOffset - offsetLeft(element) - halfWidth(pointer);
										newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
										newPercent = percentFromOffset(newOffset);
										stickyOffsetLow = newPercent;
										newValue = minValue + (valueRange * newPercent / 100.0);
										if(range) {
											if(buffer > 0) {
												if(ref === refLow) {
													newValue = newValue > parseFloat(scope[refHigh]) - buffer ? parseFloat(scope[refHigh]) - buffer :
															   newValue;
												} else {
													newValue = newValue < parseFloat(scope[refLow]) + buffer ? parseFloat(scope[refLow]) + buffer :
															   newValue;
												}
											} else {
												if(ref === refLow) {
													if(newValue > scope[refHigh]) {
														ref = refHigh;
														minPtr.removeClass('active');
														maxPtr.addClass('active');
													}
												} else {
													if(newValue < scope[refLow]) {
														ref = refLow;
														maxPtr.removeClass('active');
														minPtr.addClass('active');
													}
												}
											}
										}
										newValue = roundStep(newValue, parseFloat(scope.precision), parseFloat(scope.step), parseFloat(scope.floor),
											parseFloat(scope.ceiling));
										scope[ref] = newValue;
										if(ref === refLow) {
											stickyOffsetLow = stickyOffsetLow - percentValue(newValue);
										} else {
											stickyOffsetHigh = stickyOffsetLow - percentValue(newValue);
											stickyOffsetLow = 0;
										}
									}
									setPointers();
									adjustBubbles();
									scope.$apply();
								}
							};
							onStart = function(event, ptr, rf) {
								pointer = ptr;
								ref = rf;
								pointer.addClass('active');
								var eventX = event.clientX || event.x;
								if(ref == refSel) {
									dragRange = true;
									lowOffset = eventX - valueOffset(scope[refLow]) - halfWidth(minPtr);
									highOffset = valueOffset(scope[refHigh]) - eventX + halfWidth(maxPtr);
								}
								var newOffset = eventX + minOffset - offsetLeft(element);
								newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
								var newValue = minValue + (valueRange * percentFromOffset(newOffset) / 100.0);
								newValue = roundStep(newValue, parseFloat(scope.precision), parseFloat(scope.step), parseFloat(scope.floor),
									parseFloat(scope.ceiling));
								scope[ref] = newValue;
								setPointers();
								adjustBubbles();
								scope.$apply();
								dimensions();
							};
							setBindings = function() {
								if(inputs) {
									var bindSlider = function(elem, rf, ptr) {
										elem = angular.element(elem);
										
										var start = function(ev) { onStart(ev, ptr, rf); };
										var end = function(ev) { onMove(ev); onEnd(); };
										
										if(window.navigator.pointerEnabled) {
											elem.on('pointerdown', start)
												.on('pointermove', onMove)
												.on('pointerup', end)
												.on('pointercancel', onEnd);
										} else if(window.navigator.msPointerEnabled) {
											elem.on('MSPointerDown', start)
												.on('MSPointerMove', onMove)
												.on('MSPointerUp', end)
												.on('MSPointerCancel', onEnd);
										} else {											
											$swipe.bind(elem, {
												start: start,
												move: onMove,
												end: end,
												cancel: onEnd
											});
										}
									};
									bindSlider(minInput, refLow, minPtr);
									if(range) {
										bindSlider(maxInput, refHigh, maxPtr);
										bindSlider(selInput, refSel, selBar);
									}
								} else {
									var bindSwipeStart = function(elem, rf, ptr) {
										elem = angular.element(elem);
										if(angular.isUndefined(ptr)) {
											ptr = elem;
										} else {
											ptr = angular.element(ptr);
										}
										$swipe.bind(elem, { start: function(ev) { onStart(ev,ptr,rf); } });
									};
									var bindSwipe = function(elem) {
										elem = angular.element(elem);
										$swipe.bind(elem, {
											move: onMove,
											end: function(ev) { onMove(ev); onEnd(); },
											cancel: onEnd
										});
									};
									bindSwipeStart(minPtr, refLow);
									bindSwipeStart(maxPtr, refHigh);
									bindSwipeStart(lowBub, refLow);
									bindSwipeStart(highBub, refHigh);
									bindSwipeStart(flrBub, refLow, minPtr);
									if(range) {
										bindSwipeStart(ceilBub, refHigh, maxPtr);
										bindSwipeStart(selBar, refSel);
										bindSwipeStart(selBub, refSel, selBar);
										bindSwipeStart(unSelBarLow, refLow, minPtr);
										bindSwipeStart(unSelBarHigh, refHigh, maxPtr);
									} else {
										bindSwipeStart(ceilBub, refLow, minPtr);
										bindSwipeStart(fullBar, refLow, minPtr);
									}
									bindSwipe($document);
								}
							};
							setPointers();
							adjustBubbles();
							if(!boundToInputs) {
								setBindings();
								boundToInputs = true;
							}
						};
						$timeout(updateDOM);
						for(_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
							w = watchables[_j];
							scope.$watch(w, updateDOM);
						}
						angular.element(window).bind("resize", updateDOM);
						scope.$on('refreshSlider', function() { $timeout(updateDOM); });
					}
				};
			}
		}
	}]);
