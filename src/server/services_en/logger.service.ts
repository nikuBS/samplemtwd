import winston from 'winston';
import fs from 'fs';

/**
 * Node 로그 기록을 위한 service
 */
class LoggerService {
  static instance;
  private logger;
  private logDir = 'log';

  constructor() {
    if ( LoggerService.instance ) {
      return LoggerService.instance;
    }

    // this.initDir();
    this.initLogger();
    LoggerService.instance = this;
  }

  public debug(target, ...args) {
    this.logger.debug(`[${target.constructor.name}]`, ...args);
  }

  public info(target, ...args) {
    this.logger.info(`[${target.constructor.name}]`, ...args);
  }

  public warn(target, ...args) {
    this.logger.warn(`[${target.constructor.name}]`, ...args);
  }

  public error(target, ...args) {
    this.logger.error(`[${target.constructor.name}]`, ...args);
  }

  private log(...args) {
    this.logger.log(...args);
  }

  private initDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  /**
   * 초기화
   */
  private initLogger() {
    this.logger = new (winston.Logger)({
      transports: [
        this.getConsoleTransport(),
        // this.getFileTransport()
      ]
    });
  }

  /**
   * console 로그 초기화
   */
  private getConsoleTransport() {
    const level = String(process.env.NODE_ENV) === 'prd' ? 'error' : 'debug';
    const option = {
      level: level,
      showLevel: true,
      timestamp: this.tsFormat(),
      handleExceptions: true,
      colorize: true
    };
    return new (winston.transports.Console)(option);
  }

  /**
   * file 로그 초기화
   */
  private getFileTransport() {
    const option = {
      level: 'error',
      filename: this.logDir + '/error.log',
      timestamp: this.tsFormat,
      maxsize: 1000000,
      maxFiles: 5
    };
    return new (winston.transports.File)(option);
  }


  /**
   * 시간 포맷 설정
   */
  private tsFormat() {
    return new Date().toLocaleTimeString();
  }
}

export default LoggerService;
