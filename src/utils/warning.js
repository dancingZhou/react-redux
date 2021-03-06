/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
export default function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message)
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    // 控制台有 一出现就暂停的功能，为了适配这个，方便调试
    throw new Error(message)
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
