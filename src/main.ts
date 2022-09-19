const CORSMIRROR_URL = 'https://corsmirror.onrender.com';
const NPM_REGISTRY_URL = 'https://registry.npmjs.com';
const NPM_PACKAGE_URL = 'https://www.npmjs.com/package';
const REQUEST_URL = `${CORSMIRROR_URL}/v1/cors?url=${NPM_REGISTRY_URL}`;
// delay for debouncing the GET request (in milliseconds)
const DELAY = 300;

// cache DOM nodes
const inputElement = document.getElementById(
  'npc-package-name'
) as HTMLInputElement;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const loadingElement = document.getElementById('npc-loading')!;
const resultTextElement = document.getElementById('npc-result-text')!;
const resultIconElement = document.getElementById('npc-result-icon')!;
/* eslint-enable @typescript-eslint/no-non-null-assertion */

// store input value
let inputValue: string;
// global timeout for debounce
let timeout: ReturnType<typeof setTimeout>;

// wake up idle server
fetch(`${CORSMIRROR_URL}/healthcheck`, { method: 'HEAD' });

// check name when it is typed (with a debounce)
inputElement.addEventListener('keyup', onKeyup, false);

/**
 * Adds class to DOM element.
 *
 * @param element - The element.
 * @param className - The class.
 * @returns - The element.
 */
function addClass(element: HTMLElement, className: string) {
  if (element.className.indexOf(className) === -1) {
    element.className += ' ' + className;
  }
  return element;
}

/**
 * Removes class from DOM element.
 *
 * @param element - The element.
 * @param className - The class.
 * @returns - The element.
 */
function removeClass(element: HTMLElement, className: string) {
  if (element.className.indexOf(className) > -1) {
    element.className = element.className.replace(className, '').trim();
  }
  return element;
}

/**
 * Sets property for DOM element.
 *
 * @param element - The element.
 * @param property - The property.
 * @param value - The value.
 * @returns - The element.
 */
function setProperty(
  element: HTMLElement,
  property: keyof HTMLElement | keyof HTMLAnchorElement,
  value: string
) {
  if (!element) {
    throw new Error('The first argument must be an element');
  }

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  if (element[property] !== value) {
    // @ts-ignore
    element[property] = value;
  }
  /* eslint-enable @typescript-eslint/ban-ts-comment */

  return element;
}

/**
 * Check if npm package name is valid.
 *
 * https://github.com/npm/validate-npm-package-name#naming-rules
 *
 * @param packageName - The package name.
 */
function isValidPackageName(packageName: string): boolean {
  if (/^[a-zA-Z0-9_-]+$/.test(packageName)) {
    return packageName[0] !== '_';
  }
  return false;
}

/**
 * Changes result icon display type (success, error, default).
 *
 * @param type - The display type.
 */
function setResultIcon(type: string): void {
  switch (type) {
    case 'error':
      removeClass(resultIconElement, 'green');
      addClass(resultIconElement, 'red');
      setProperty(resultIconElement, 'textContent', 'cancel');
      break;

    case 'success':
      removeClass(resultIconElement, 'red');
      addClass(resultIconElement, 'green');
      setProperty(resultIconElement, 'textContent', 'check_circle');
      break;

    case 'broken':
      removeClass(resultIconElement, 'green');
      addClass(resultIconElement, 'red');
      setProperty(resultIconElement, 'textContent', 'report_problem');
      break;

    default:
      removeClass(resultIconElement, 'red');
      removeClass(resultIconElement, 'green');
      setProperty(resultIconElement, 'textContent', 'search');
      break;
  }
}

/**
 * Debounces a function call.
 *
 * https://remysharp.com/2010/07/21/throttling-function-calls
 *
 * @param callback - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns - The debounced function.
 */
function debounce(callback: () => void, delay?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

/**
 * Handles `keyup` event.
 *
 * @param event - The event handler.
 */
function onKeyup(): void {
  const packageName = inputElement.value.toLowerCase();

  // blank input
  if (!packageName) {
    removeClass(loadingElement, 'is-active');
    setProperty(resultTextElement, 'textContent', '');
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
    setProperty(resultTextElement, 'textContent', 'Invalid name.');
    setResultIcon('error');
    return;
  }

  // clear result and display loading spinner
  setProperty(resultTextElement, 'textContent', '');
  setProperty(resultIconElement, 'textContent', '');
  addClass(loadingElement, 'is-active');

  debounce(async () => {
    let response;
    let data;

    try {
      response = await fetch(
        `${REQUEST_URL}/${encodeURIComponent(packageName)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      data = await response.json();

      // package name is taken
      setProperty(resultTextElement, 'textContent', 'Name is taken.');
      setProperty(
        resultTextElement,
        'href',
        `${NPM_PACKAGE_URL}/${packageName}`
      );
      setProperty(resultTextElement, 'target', '_blank');
      addClass(resultTextElement, 'hover');
      setResultIcon('error');
    } catch (error) {
      if (error.status >= 500) {
        setProperty(resultTextElement, 'textContent', 'Server error.');
        setResultIcon('broken');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    // remove loading spinner
    removeClass(loadingElement, 'is-active');

    // package is available or unpublished
    if (response?.status === 404 || data?.time?.unpublished) {
      setProperty(resultTextElement, 'textContent', 'Name is available.');
      setResultIcon('success');
      setProperty(resultTextElement, 'href', '#');
      setProperty(resultTextElement, 'target', '');
      removeClass(resultTextElement, 'hover');
    }
  }, DELAY)();
}

export {};
