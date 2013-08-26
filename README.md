# angular-slider
Slider directive for AngularJS. Based on: http://github.com/prajwalkman/angular-slider with some enhancements

## Features
- Single or dual knob
- Fully Stylable
- Adjustable knob "Stickiness"
- Adjustable minimum range width
- Draggable range
- Touch and IE10/Win8 pointer event support

## Known Issues
- Doesn't work in IE<9

## Usage
### Single Knob
#### Markup
As an element:
```
<slider
	ng-model="{string}"
	floor="{float}"
	ceiling="{float}"
	step="{float}"
	precision="{integer}"
	stretch="{integer}"
	translate="{string}">
</slider>
```
As an attribute:
```
<div
	slider
	ng-model="{string}"
	floor="{float}"
	ceiling="{float}"
	step="{float}"
	precision="{integer}"
	stretch="{integer}"
	translate="{string}">
</div>
```

#### Parameters
|Param		|Type	|Details|
|-----------|-------|-------|
|ng-model	|string	|Assignable angular expression to which to data-bind the value. |
|floor		|float	|The lowest value possible |
|ceiling	|float	|The highest value possible |
|step		|float (optional) |The width between each tick. Default: infinite |
|precision	|integer (optional) |The numerical precision to which to round the value. Default: 0 |
|stretch	|integer (optional) |How stretch resistant the knobs will act. The higher the stretch resistance the more "snappy" the knobs will feel. Default: 3 |
|translate	|string (optional) |A translation function to apply to all view values. Be sure to omit the parentheses (e.g. "transFunc" instead of "transFunc()") |
--
### Dual Knob
#### Markup
As an element:
```
<slider
	ng-model-low="{string}"
	ng-model-high="{string}"
	floor="{float}"
	ceiling="{float}"
	step="{float}"
	precision="{integer}"
	stretch="{integer}"
	translate="{string}">
</slider>
```
As an attribute:
```
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
	translate="{string}">
</div>
```

#### Parameters
|Param		|Type	|Details|
|-----------|-------|-------|
|ng-model-low	|string	|Assignable angular expression to which to data-bind the low value. |
|ng-model-high	|string	|Assignable angular expression to which to data-bind the high value. |
|floor		|float	|The lowest value possible |
|ceiling	|float	|The highest value possible |
|step		|float (optional) |The width between each tick. Default: infinite |
|buffer		|float (optional) |The minimum difference between the low and high values. Default: 0 |
|precision	|integer (optional) |The numerical precision to which to round the value. Default: 0 |
|stretch	|integer (optional) |How stretch resistant the knobs will act. The higher the stretch resistance the more "snappy" the knobs will feel. Default: 3 |
|translate	|string (optional) |A translation function to apply to all view values. Be sure to omit the parentheses (e.g. "transFunc" instead of "transFunc()") |
