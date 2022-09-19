/**
 * Adds class to DOM element.
 *
 * @param element - The element.
 * @param className - The class.
 * @returns - The element.
 */
export function addClass(element: HTMLElement, className: string) {
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
export function removeClass(element: HTMLElement, className: string) {
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
export function setProperty(
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
export function isValidPackageName(packageName: string): boolean {
  if (/^[a-zA-Z0-9_-]+$/.test(packageName)) {
    return packageName[0] !== '_';
  }
  return false;
}

/**
 * Changes result icon display type (success, error, default).
 *
 * @param element - The element.
 * @param type - The display type.
 */
export function setResultIcon(element: HTMLElement, type: string): void {
  switch (type) {
    case 'error':
      removeClass(element, 'green');
      addClass(element, 'red');
      setProperty(element, 'textContent', 'cancel');
      break;

    case 'success':
      removeClass(element, 'red');
      addClass(element, 'green');
      setProperty(element, 'textContent', 'check_circle');
      break;

    case 'broken':
      removeClass(element, 'green');
      addClass(element, 'red');
      setProperty(element, 'textContent', 'report_problem');
      break;

    default:
      removeClass(element, 'red');
      removeClass(element, 'green');
      setProperty(element, 'textContent', 'search');
      break;
  }
}

let timeout: ReturnType<typeof setTimeout>;

/**
 * Debounces a function call.
 *
 * https://remysharp.com/2010/07/21/throttling-function-calls
 *
 * @param callback - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns - The debounced function.
 */
export function debounce(callback: () => void, delay?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
