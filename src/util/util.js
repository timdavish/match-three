
/**
 * Checks if a value is a boolean
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a boolean or not
 */
export function isBoolean(val) {
  return typeof val === 'boolean';
}

/**
 * Checks if a value is a string
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a string or not
 */
export function isString(val) {
  return typeof val === 'string';
}

/**
 * Checks if a value is a number
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a number or not
 */
export function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Checks if a value is a function
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a function or not
 */
export function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Checks if a value is an object
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is an object or not
 */
export function isObject(val) {
  return typeof val === 'object';
}

/**
 * Checks if a value is an array
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is an array or not
 */
export function isArray(val) {
  return Array.isArray(val);
}

/**
 * Checks if a value is defined
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is defined or not
 */
export function isDefined(val) {
  return typeof val !== 'undefined';
}

/**
 * Checks if a value is undefined
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is undefined or not
 */
export function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Checks if a value is a defined and non-null
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a defined and non-null or not
 */
export function isPresent(val) {
  return val !== undefined && val !== null;
}

/**
 * Checks if a value is a undefined or null
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a undefined or null or not
 */
export function isBlank(val) {
  return val === undefined || val === null;
}

/**
 * Checks if a value is a primitive value
 * @param {any} val Value to check
 * @return {Boolean} Whether the value is a primitive value or not
 */
export function isPrimitive(val) {
  return isBoolean(val) || isString(val) || (isNumber(val) && !Number.isNaN(val));
}

/**
 * Deep copies the value
 * @param {any} obj Value to create a copy of
 * @return {any} A deep copy of the value
 */
export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep checks two values for equality
 * @param {any} a First value
 * @param {any} b Second value
 * @return {Boolean} Whether the two values are equal or not
 */
export function deepEqual(a, b) {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Restrict the given number between the given min and max
 * @param {Number} min Minimum value for n to be
 * @param {Number} n Value to be clamped
 * @param {Number} max Maximum value for n to be
 * @return {Number} A value n such that (min <= n <= max)
 */
export function clamp(min, n, max) {
  return Math.max(min, Math.min(n, max));
}

/**
 * Generate a new unique identifier
 * @return {String} A unique identifier
 */
export function generateUid() {
  let d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + (Math.random() * 16)) % 16 | 0; // eslint-disable-line
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r&0x7|0x8)).toString(16); // eslint-disable-line
  });
}

/**
 * Return a random integer between min and max inclusive
 * @param {Number} min Minimum value
 * @param {Number} max Maximum value
 * @return {Number} A random integer between min and max inclusive
 */
export function random(min, max) {
  let newMin = min;
  let newMax = max;
  if (isBlank(max)) {
    newMax = min;
    newMin = 0;
  }
  return newMin + Math.floor(Math.random() * (newMax - newMin + 1));
}

/**
 * Delays the chaining of a promise by a specified time in milliseconds
 * @param {Number} delay The delay in milliseconds
 * @return {Promise} A promise with the resolved value from the previous step.
 */
export function waitInPromise(delay) {
  return arg => (
    Number.isFinite(delay) && delay > 0
      ? new Promise(resolve => setTimeout(() => resolve(arg), delay))
      : Promise.resolve(arg)
  );
}
