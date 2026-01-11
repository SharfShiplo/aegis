/**
 * Helper functions for extracting location information from AST nodes
 */
class LocationHelper {
  /**
   * Get line number from AST node
   * @param {Object} node - AST node
   * @returns {number} Line number (1-based) or 0 if not available
   */
  static getLine(node) {
    if (node && node.loc && node.loc.start) {
      return node.loc.start.line || 0;
    }
    return 0;
  }

  /**
   * Get column number from AST node
   * @param {Object} node - AST node
   * @returns {number} Column number (1-based) or 0 if not available
   */
  static getColumn(node) {
    if (node && node.loc && node.loc.start) {
      return node.loc.start.column || 0;
    }
    return 0;
  }
}

module.exports = LocationHelper;
