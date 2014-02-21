/**
 * Author: Derek Gould
 * Date: 2/21/14
 * Time: 12:40 PM
 */

/**
 * Copy of Modernizr's range input type check
 * @returns {bool}
 */
window.AngularSlider = {
    rangeInputs: (function(doc) {
        var el = document.createElement("input");
        el.setAttribute('type', 'range');
        if(el.type === 'text') {
            return false;
        }
        el.value         = ':)';
        el.style.cssText = 'position:absolute;visibility:hidden;';

        if (el.style.WebkitAppearance !== undefined ) {

            var docElement = doc.documentElement;
            var defaultView = doc.defaultView;
            docElement.appendChild(el);

            // Safari 2-4 allows the smiley as a value, despite making a slider
            var ret = defaultView.getComputedStyle &&
                      defaultView.getComputedStyle(el, null).WebkitAppearance !== 'textfield' &&
                // Mobile android web browser has false positive, so must
                // check the height to see if the widget is actually there.
                      (el.offsetHeight !== 0);

            docElement.removeChild(el);

            return ret;

        }
        return false;
    })(this.document)
};


