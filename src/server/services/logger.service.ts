import winston from 'winston';
import fs from 'fs';

class LoggerService {
  private logger;
  private logDir = 'log';

  constructor() {
    // this.initDir();
    this.initLogger();
  }

  public debug(target, ...args) {
    this.logger.debug(`[${target.constructor.name}] %j`, ...args);
  }

  public info(target, ...args) {
    this.logger.info(`[${target.constructor.name}] %j`, ...args);
  }

  public warn(target, ...args) {
    this.logger.warn(`[${target.constructor.name}] %j`, ...args);
  }

  public error(target, ...args) {
    this.logger.error(`[${target.constructor.name}] %j`, ...args);
  }

  private log(...args) {
    this.logger.log(...args);
  }

  private initDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  private initLogger() {
    this.logger = new (winston.Logger)({
      transports: [
        this.getConsoleTransport(),
        // this.getFileTransport()
      ]
    });
  }

  private getConsoleTransport() {
    const option = {
      level: 'debug',
      showLevel: true,
      timestamp: this.tsFormat(),
      handleExceptions: true,
      colorize: true
    };
    return new (winston.transports.Console)(option);
  }

  private getFileTransport() {
    const option = {
      level: 'debug',
      filename: this.logDir + '/logs.log',
      timestamp: this.tsFormat,
      maxsize: 1000000,
      maxFiles: 5
    };
    return new (winston.transports.File)(option);
  }


  private tsFormat() {
    return new Date().toLocaleTimeString();
  }
}

export default LoggerService;