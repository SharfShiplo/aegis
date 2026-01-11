const JSONReporter = require('./json-reporter');
const TextReporter = require('./text-reporter');

/**
 * Get reporter by format name
 * @param {string} format - Format name ('json' or 'text')
 * @returns {BaseReporter} Reporter instance
 */
function getReporter(format) {
  switch (format.toLowerCase()) {
    case 'json':
      return new JSONReporter();
    case 'text':
    default:
      return new TextReporter();
  }
}

module.exports = {
  getReporter,
  JSONReporter,
  TextReporter
};
