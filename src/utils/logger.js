const chalk = require('chalk');

class Logger {
  static info(message) {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message) {
    console.log(chalk.green('✓'), message);
  }

  static warn(message) {
    console.log(chalk.yellow('⚠'), message);
  }

  static error(message) {
    console.log(chalk.red('✗'), message);
  }

  static log(message) {
    console.log(message);
  }
}

module.exports = Logger;
