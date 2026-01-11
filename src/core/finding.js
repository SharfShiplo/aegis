class Finding {
  constructor(ruleId, severity, message, file, line, column, suggestion) {
    this.ruleId = ruleId;
    this.severity = severity; // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    this.message = message;
    this.file = file;
    this.line = line || 0;
    this.column = column || 0;
    this.suggestion = suggestion || '';
  }

  toJSON() {
    return {
      ruleId: this.ruleId,
      severity: this.severity,
      message: this.message,
      file: this.file,
      line: this.line,
      column: this.column,
      suggestion: this.suggestion
    };
  }
}

module.exports = Finding;
