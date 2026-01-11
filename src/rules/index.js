const ReentrancyRule = require('./reentrancy-rule');
const TxOriginRule = require('./tx-origin-rule');
const UncheckedCallRule = require('./unchecked-call-rule');
const IntegerOverflowRule = require('./integer-overflow-rule');
const UnboundedLoopRule = require('./unbounded-loop-rule');
const DeprecatedRule = require('./deprecated-rule');

/**
 * Get all default rules
 * @returns {Rule[]} Array of rule instances
 */
function getDefaultRules() {
  return [
    new ReentrancyRule(),
    new TxOriginRule(),
    new UncheckedCallRule(),
    new IntegerOverflowRule(),
    new UnboundedLoopRule(),
    new DeprecatedRule()
  ];
}

/**
 * Get rules by IDs
 * @param {string[]} ruleIds - Array of rule IDs
 * @returns {Rule[]} Array of matching rule instances
 */
function getRulesByIds(ruleIds) {
  const allRules = getDefaultRules();
  return allRules.filter(rule => ruleIds.includes(rule.id));
}

/**
 * Get rules excluding specified IDs
 * @param {string[]} excludeIds - Array of rule IDs to exclude
 * @returns {Rule[]} Array of rule instances
 */
function getRulesExcluding(excludeIds = []) {
  const allRules = getDefaultRules();
  return allRules.filter(rule => !excludeIds.includes(rule.id));
}

module.exports = {
  getDefaultRules,
  getRulesByIds,
  getRulesExcluding,
  ReentrancyRule,
  TxOriginRule,
  UncheckedCallRule,
  IntegerOverflowRule,
  UnboundedLoopRule,
  DeprecatedRule
};
