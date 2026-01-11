class BaseReporter {
  constructor() {
    this.severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  }

  /**
   * Generate report from scan results
   * @param {Object[]} results - Array of scan results
   * @returns {string} Formatted report
   */
  generate(results) {
    throw new Error('BaseReporter.generate() must be implemented by subclasses');
  }

  /**
   * Get summary statistics
   * @param {Object[]} results - Array of scan results
   * @returns {Object} Summary statistics
   */
  getSummary(results) {
    const summary = {
      files: results.length,
      totalFindings: 0,
      bySeverity: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      },
      filesWithIssues: 0
    };

    for (const result of results) {
      if (result.findings && result.findings.length > 0) {
        summary.filesWithIssues++;
        summary.totalFindings += result.findings.length;
        
        for (const finding of result.findings) {
          const severity = finding.severity || 'LOW';
          if (summary.bySeverity[severity] !== undefined) {
            summary.bySeverity[severity]++;
          }
        }
      }
    }

    return summary;
  }

  /**
   * Filter findings by severity
   * @param {Finding[]} findings - Array of findings
   * @param {string} minSeverity - Minimum severity level
   * @returns {Finding[]} Filtered findings
   */
  filterBySeverity(findings, minSeverity) {
    if (!minSeverity) return findings;
    
    const severityIndex = this.severityOrder.indexOf(minSeverity);
    if (severityIndex === -1) return findings;

    return findings.filter(finding => {
      const findingIndex = this.severityOrder.indexOf(finding.severity);
      return findingIndex !== -1 && findingIndex <= severityIndex;
    });
  }
}

module.exports = BaseReporter;
