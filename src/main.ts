import {
  addClass,
  debounce,
  isValidPackageName,
  removeClass,
  setProperty,
  setResultIcon,
} from './utils';

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

// wake up idle server
fetch(`${CORSMIRROR_URL}/healthcheck`, { method: 'HEAD' });

// check name when it is typed (with a debounce)
inputElement.addEventListener('keyup', onKeyup, false);

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
    setResultIcon(resultIconElement, 'default');
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
    setResultIcon(resultIconElement, 'error');
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
      setResultIcon(resultIconElement, 'error');
    } catch (error) {
      if (error.status >= 500) {
        setProperty(resultTextElement, 'textContent', 'Server error.');
        setResultIcon(resultIconElement, 'broken');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    // remove loading spinner
    removeClass(loadingElement, 'is-active');

    // package is available or unpublished
    if (response?.status === 404 || data?.time?.unpublished) {
      setProperty(resultTextElement, 'textContent', 'Name is available.');
      setResultIcon(resultIconElement, 'success');
      setProperty(resultTextElement, 'href', '#');
      setProperty(resultTextElement, 'target', '');
      removeClass(resultTextElement, 'hover');
    }
  }, DELAY)();
}
