const Rule = require('../core/rule');

class BaseRule extends Rule {
  constructor(id, name, description, severity) {
    super(id, name, description, severity);
  }
}

module.exports = BaseRule;
