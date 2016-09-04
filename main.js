(function() {
    'use strict';

    /**
     * Add class to DOM element.
     *
     * @param  {HTMLElement} element   - The element.
     * @param  {String}      className - The class.
     * @return {HTMLElement}           - The element.
     */
    function addClass(element, className) {
        if (element.className.indexOf(className) === -1) {
            element.className += ' ' + className;
        }
        return element;
    }

    /**
     * Remove class from DOM element.
     *
     * @param  {HTMLElement} elemenet  - The element.
     * @param  {String}      className - The class.
     * @return {HTMLElement}           - The element.
     */
    function removeClass(element, className) {
        if (element.className.indexOf(className) > -1) {
            element.className = element.className.replace(className, '').trim();
        }
        return element;
    }

    /**
     * Set text for DOM element.
     *
     * @param  {HTMLElement} element - The element.
     * @param  {String}      text    - The text.
     * @return {HTMLElement} element - The element.
     */
    function setText(element, text) {
        if (element.textContent !== text) {
            element.textContent = text;
        } else if (element.innerText !== text) {
            element.innerText = text;
        }
        return element;
    }

    /**
     * Check if npm package name is valid.
     * https://github.com/npm/validate-npm-package-name#naming-rules
     *
     * @param  {String} packageName - The package name.
     * @return {Boolean}
     */
    function isValidPackageName(packageName) {
        if (/^[a-zA-Z0-9_-]+$/.test(packageName)) {
            return packageName[0] !== '_';
        }
        return false;
    }

    /**
     * Change result icon display type (success, error, default).
     *
     * @param {String} type - The display type.
     */
    function setResultIcon(type) {
        switch (type) {
            case 'error':
                removeClass(resultIconElement, 'green');
                addClass(resultIconElement, 'red');
                setText(resultIconElement, 'cancel');
                return;
            case 'success':
                removeClass(resultIconElement, 'red');
                addClass(resultIconElement, 'green');
                setText(resultIconElement, 'check_circle');
                return;
            default:
                removeClass(resultIconElement, 'red');
                removeClass(resultIconElement, 'green');
                setText(resultIconElement, 'search');
                return;
        }
    }

    // cache DOM nodes
    var inputElement = document.getElementById('npc-package-name');
    var resultTextElement = document.getElementById('npc-result-text');
    var resultIconElement = document.getElementById('npc-result-icon');

    // store input value
    var inputValue;

    // check name after it's typed
    inputElement.addEventListener('keyup', function(event) {
        var packageName = inputElement.value.toLowerCase();

        // blank input
        if (!packageName) {
            setText(resultTextElement, '');
            setResultIcon('default');
            inputValue = '';
            return;
        }

        // check whether input has changed
        if (packageName === inputValue) {
            return;
        } else {
            inputValue = packageName;
        }

        // invalid package name
        if (!isValidPackageName(packageName)) {
            setText(resultTextElement, 'Invalid name.');
            setResultIcon('error');
            return;
        }

        // todo: add logic to verify name availability
        setText(resultTextElement, 'Valid name.');
        setResultIcon('success');
    }, false);
})();
