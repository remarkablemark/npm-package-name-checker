const CORS_BASE_URL = 'https://corsmirror.herokuapp.com/';
const CORS_API_URL = CORS_BASE_URL + 'v1/cors?url=';
const NPM_REGISTRY_URL = 'https://registry.npmjs.com/';
const NPM_PACKAGE_URL = 'https://www.npmjs.com/package/';
const BASE_URL = CORS_API_URL + NPM_REGISTRY_URL;
const DELAY = 300; // delay for debouncing the GET request (in milliseconds)

// cache DOM nodes
const inputElement = document.getElementById(
  'npc-package-name'
) as HTMLInputElement;
const loadingElement = document.getElementById('npc-loading');
const resultTextElement = document.getElementById('npc-result-text');
const resultIconElement = document.getElementById('npc-result-icon');

// store input value
let inputValue;
// global timeout for debounce
let timeout;

// wake up idle server
fetch(`${CORS_BASE_URL}heartbeat`, { method: 'HEAD' });

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
 * @param  {Function} callback - The function to debounce.
 * @param  {Number}   [delay]  - The delay in milliseconds.
 * @return {Function}          - The debounced function.
 */
function debounce(callback, delay) {
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

/**
 * Handle `keyup` event.
 *
 * @param {Function} event - The event handler.
 */
function onKeyup() {
  const packageName = inputElement.value.toLowerCase();

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

  debounce(async () => {
    let response;
    let data;

    try {
      response = await fetch(BASE_URL + encodeURIComponent(packageName), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      data = await response.json();

      // package name is taken
      setProperty(resultTextElement, 'text', 'Name is taken.');
      setProperty(resultTextElement, 'href', NPM_PACKAGE_URL + packageName);
      setProperty(resultTextElement, 'target', '_blank');
      addClass(resultTextElement, 'hover');
      setResultIcon('error');
    } catch (error) {
      if (error.status >= 500) {
        setProperty(resultTextElement, 'text', 'Server error.');
        setResultIcon('broken');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    // remove loading spinner
    removeClass(loadingElement, 'is-active');

    // package is available or unpublished
    if (response.status === 404 || data.time.unpublished) {
      setProperty(resultTextElement, 'text', 'Name is available.');
      setResultIcon('success');
      setProperty(resultTextElement, 'href', '#');
      setProperty(resultTextElement, 'target', '');
      removeClass(resultTextElement, 'hover');
    }
  }, DELAY)();
}

export {};
