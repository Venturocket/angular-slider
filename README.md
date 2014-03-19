# angular-slider [![Build Status](https://secure.travis-ci.org/Venturocket/angular-slider.png?branch=master)](http://travis-ci.org/Venturocket/angular-slider)
Slider directive for AngularJS.
License: MIT

## Features
- Single or dual knob
- Fully Stylable
- Custom arbitrary scaling
- Adjustable knob "Stickiness"
- Adjustable minimum range width
- Draggable selection range
- Full touch and IE10+/Win8+ pointer event support

## Known Issues
- Doesn't work in IE8-

## Installation

```
bower install venturocket-angular-slider
```

## Usage
### Requirements

Add `<script>` to your `html` files for angular, [angular-touch](https://github.com/angular/bower-angular-touch) and angular-slider:

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.14/angular.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.14/angular-touch.min.js"></script>
<script src="build/angular-slider.min.js"></script>
```

And add `vr.directives.slider` as a dependency for your app:

```javascript
angular.module('myApp', ['vr.directives.slider', ...]);
```

**NOTE:** in IE10/11 an annoying tooltip will show up unless you add the following css:
```css
::-ms-tooltip {
	display: none;
}
```

### Single Knob
#### Markup
As an element:
```html
<slider
    ng-model="{string}"
    floor="{float}"
    ceiling="{float}"
    step="{float}"
    precision="{integer}"
    stretch="{integer}"
    translate="{string}"
    scale="{string}"
    inverse-scale="{string}">
</slider>
```
As an attribute:
```html
<div
    slider
    ng-model="{string}"
    floor="{float}"
    ceiling="{float}"
    step="{float}"
    precision="{integer}"
    stretch="{integer}"
    translate="{string}"
    scale="{string}"
    inverse-scale="{string}">
</div>
```

#### Parameters
|Param      |Type   |Required |Default |Details |
|-----------|-------|---------|--------|--------|
|ng-model   |string |Yes      |none    |Assignable angular expression to which to data-bind the value. |
|floor      |float  |Yes      |none    |The lowest value possible |
|ceiling    |float  |Yes      |none    |The highest value possible |
|step       |float  |No       |inf     |The width between each tick. |
|precision  |integer|No       |0       |The numerical precision to which to round the value. |
|stretch    |integer|No       |3       |How sticky the knobs will act. 1 = no stickiness |
|translate  |string |No       |none    |A translation function to apply to all view values. Be sure to omit the parentheses (e.g. "transFunc" instead of "transFunc()") |
|scale      |string |No       |none    |A scaling function to apply to the value. See the `Scaling` section below for more details. Be sure to omit the parentheses (e.g. "scaleFunc" instead of "scaleFunc()") |
|inverse-scale |string|No     |none    |The inverse of the scaling function. This is required if a scaling function is specified. See the `Scaling` section below for more details. Be sure to omit the parentheses (e.g. "scaleFunc" instead of "scaleFunc()") |
--
### Dual Knob
#### Markup
As an element:
```html
<slider
    ng-model-low="{string}"
    ng-model-high="{string}"
    floor="{float}"
    ceiling="{float}"
    step="{float}"
    precision="{integer}"
    stretch="{integer}"
    translate="{string}"
    translateRange="{string}"
    translateCombined="{string}"
    scale="{string}"
    inverse-scale="{string}">
</slider>
```
As an attribute:
```html
<div
    slider
    ng-model-low="{string}"
    ng-model-high="{string}"
    floor="{float}"
    ceiling="{float}"
    step="{float}"
    buffer="{float}"
    precision="{integer}"
    stretch="{integer}"
    translate="{string}"
    translateRange="{string}"
    translateCombined="{string}"
    scale="{string}"
    inverse-scale="{string}">
</div>
```

#### Parameters
|Param      |Type   |Required |Default |Details |
|-----------|-------|---------|--------|--------|
|ng-model-low|string|Yes      |none    |Assignable angular expression to which to data-bind the low value. |
|ng-model-high|string|Yes     |none    |Assignable angular expression to which to data-bind the high value. |
|floor      |float  |Yes      |none    |The lowest value possible |
|ceiling    |float  |Yes      |none    |The highest value possible |
|step       |float  |No       |inf     |The width between each tick. |
|precision  |integer|No       |0       |The numerical precision to which to round the value. |
|stretch    |float  |No       |3       |How sticky the knobs will act. 1 = no stickiness |
|translate  |string |No       |none    |A translation function to apply to most of the view values. Be sure to omit the parentheses (e.g. "transFunc" instead of "transFunc()") |
|translate-range|string|No    |none    |A translation function to apply to the range value. Be sure to omit the parentheses (e.g. "transFunc" instead of "transFunc()") |
|translate-combined|string|No |none    |A translation function to apply to the combined value (when the knobs are too close together). Be sure to omit the parentheses (e.g. "transFunc" instead of "transFunc()") |
|scale      |string |No       |none    |A scaling function to apply to the value. See the `Scaling` section below for more details. Be sure to omit the parentheses (e.g. "scaleFunc" instead of "scaleFunc()") |
|inverse-scale|string|No      |none    |The inverse of the scaling function. This is required if a scaling function is specified. See the `Scaling` section below for more details. Be sure to omit the parentheses (e.g. "scaleFunc" instead of "scaleFunc()") |


## Scaling
You can supply any arbitrary scaling function (and its inverse) to the slider to suit your needs. 
The inverse scaling function MUST be specified if a scaling function is specified (and vice versa).
The scaling/inverse function can be pretty much anything as long as they take a number as a parameter and return a number. Like this:
```javascript
function scale(value) {
    return Math.pow(value,3);
}
function inverseScale(value) {
    return Math.pow(value,1/3);
}
```
A few notes:
- scale(inverseScale(x)) MUST produce x or you're gonna have a bad time
- If your scale function returns the same value for multiple values within the range of the slider you're gonna have a bad time
- If the floor of your slider dips into negative numbers you're (probably) gonna have a bad time
