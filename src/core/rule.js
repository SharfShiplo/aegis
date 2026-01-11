const Finding = require('./finding');

class Rule {
  constructor(id, name, description, severity) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.severity = severity; // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }

  /**
   * Check the AST and return findings
   * @param {Object} astContext - AST context with ast, source, filePath
   * @returns {Finding[]} Array of findings
   */
  check(astContext) {
    throw new Error('Rule.check() must be implemented by subclasses');
  }

  /**
   * Create a finding with standardized format
   */
  createFinding(severity, message, file, line, column, suggestion) {
    return new Finding(
      this.id,
      severity || this.severity,
      message,
      file,
      line,
      column,
      suggestion
    );
  }

  /**
   * Get source code line for a given position
   */
  getSourceLine(source, lineNumber) {
    if (!source || lineNumber < 1) return '';
    const lines = source.split('\n');
    return lines[lineNumber - 1] || '';
  }

  /**
   * Get line number from source position (1-based)
   */
  getLineNumber(source, position) {
    if (position == null || position < 0) return 1;
    return source.substring(0, position).split('\n').length;
  }

  /**
   * Get column number from source position (1-based)
   */
  getColumnNumber(source, position) {
    if (position == null || position < 0) return 1;
    const lastNewline = source.lastIndexOf('\n', position);
    return position - lastNewline;
  }
}

module.exports = Rule;
