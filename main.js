(function(request) {
    'use strict';

    // constants
    var CORS_URL = 'http://www.corsmirror.com/v1/cors?url=';
    var NPM_REGISTRY_URL = 'http://registry.npmjs.com/';
    var NPM_PACKAGE_URL = 'https://www.npmjs.com/package/';
    var BASE_URL = CORS_URL + NPM_REGISTRY_URL;
    var DELAY = 300; // delay for debouncing the GET request (in milliseconds)

    // cache DOM nodes
    var inputElement = document.getElementById('npc-package-name');
    var loadingElement = document.getElementById('npc-loading');
    var resultTextElement = document.getElementById('npc-result-text');
    var resultIconElement = document.getElementById('npc-result-icon');

    // store input value
    var inputValue;
    // global timeout for debounce
    var timeout;

    // check name when it is typed (with a debounce)
    inputElement.addEventListener('keyup', onKeyup, false);

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
     * Set property for DOM element.
     *
     * @param  {HTMLElement} element  - The element.
     * @param  {String}      property - The property.
     * @param  {String}      value    - The value.
     * @return {HTMLElement}          - The element.
     */
    function setProperty(element, property, value) {
        if (!element) {
            throw new Error('The first argument must be an element');
        }
        switch (property) {
            case 'text':
                if (element.textContent !== value) {
                    element.textContent = value;
                } else if (element.innerText !== value) {
                    element.innerText = value;
                }
                break;
            default:
                if (element[property] !== value) {
                    element[property] = value;
                }
        }
        return element;
    }

    /**
     * Check if npm package name is valid.
     * https://github.com/npm/validate-npm-package-name#naming-rules
     *
     * @param  {String}  packageName - The package name.
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
                setProperty(resultIconElement, 'text', 'cancel');
                return;
            case 'success':
                removeClass(resultIconElement, 'red');
                addClass(resultIconElement, 'green');
                setProperty(resultIconElement, 'text', 'check_circle');
                return;
            case 'broken':
                removeClass(resultIconElement, 'green');
                addClass(resultIconElement, 'red');
                setProperty(resultIconElement, 'text', 'report_problem');
                return;
            default:
                removeClass(resultIconElement, 'red');
                removeClass(resultIconElement, 'green');
                setProperty(resultIconElement, 'text', 'search');
                return;
        }
    }

    /**
     * Debounce a function call.
     * https://remysharp.com/2010/07/21/throttling-function-calls
     *
     * @param  {Function} func    - The function to debounce.
     * @param  {Number}   [delay] - The delay in milliseconds.
     * @return {Function}         - The debounced function.
     */
    function debounce(func, delay) {
        return function() {
            var context = this;
            var args = arguments;
            // update global timeout
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, delay);
        };
    }

    /**
     * Handle `keyup` event.
     *
     * @param {Function} - The event handler.
     */
    function onKeyup(event) {
        var packageName = inputElement.value.toLowerCase();

        // blank input
        if (!packageName) {
            removeClass(loadingElement, 'is-active');
            setProperty(resultTextElement, 'text', '');
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
            removeClass(loadingElement, 'is-active');
            setProperty(resultTextElement, 'text', 'Invalid name.');
            setResultIcon('error');
            return;
        }

        // clear result and display loading spinner
        setProperty(resultTextElement, 'text', '');
        setProperty(resultIconElement, 'text', '');
        addClass(loadingElement, 'is-active');

        // debounce the request to prevent it from taxing the server
        debounce(function() {

            request({
                url: BASE_URL + encodeURIComponent(packageName),
                method: 'GET'

            }).then(function(response) {
                // package is unpublished
                if (response.time.unpublished instanceof Object) {
                    return { status: 404 };
                }

                // package name is taken
                setProperty(resultTextElement, 'text', 'Name is taken.');
                setProperty(resultTextElement, 'href', NPM_PACKAGE_URL + packageName);
                setProperty(resultTextElement, 'target', '_blank');
                addClass(resultTextElement, 'hover');
                setResultIcon('error');

            }).fail(function(error, message) {
                // server error
                if (error.status >= 500) {
                    setProperty(resultTextElement, 'text', 'Server error.');
                    setResultIcon('broken');
                    console.error(error, message);
                }

            }).always(function(result) {
                // remove loading spinner
                removeClass(loadingElement, 'is-active');

                // package is available
                if (result && result.status === 404) {
                    setProperty(resultTextElement, 'text', 'Name is available.');
                    setResultIcon('success');
                    setProperty(resultTextElement, 'href', '#');
                    setProperty(resultTextElement, 'target', '');
                    removeClass(resultTextElement, 'hover');
                }
            });

        }, DELAY)();
    }

})(window.reqwest);
