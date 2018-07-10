import axios from 'axios';
import { Observable } from 'rxjs/Observable';
import environment from '../config/environment.config';
import { API_CMD, API_CODE, API_METHOD, API_SERVER } from '../types/api-command.type';
import ParamsHelper from '../utils/params.helper';
import LoginService from './login.service';
import LoggerService from './logger.service';
import FormatHelper from '../utils/format.helper';

class ApiService {
  static instance;
  private loginService: LoginService = new LoginService();
  private logger: LoggerService = new LoggerService();

  constructor() {
    if ( ApiService.instance ) {
      return ApiService.instance;
    }

    ApiService.instance = this;
  }

  public request(command: any, params: any, header?: any, ...args: any[]): Observable<any> {
    const apiUrl = this.getServerUri(command);
    const options = this.getOption(command, apiUrl, params, header, args);
    this.logger.info(this, '[API_REQ]', options);

    return Observable.create((observer) => {
      axios(options)
        .then(this.apiCallback.bind(this, observer, command))
        .catch(this.handleError.bind(this, observer));
    });
  }

  public getServerUri(command: any): string {
    return environment[String(process.env.NODE_ENV)][command.server];
  }

  private getOption(command: any, apiUrl: any, params: any, header: any, args: any[]): any {
    const option = {
      url: apiUrl + this.makePath(command.path, command.method, params, args),
      method: command.method,
      headers: this.makeHeader(command, header, params),
      data: params
    };

    return option;
  }

  private makeHeader(command: any, header: any, params): any {
    if ( !header ) {
      header = {};
    }

    switch ( command.server ) {
      case API_SERVER.BFF:
        return Object.assign(header, {
          'content-type': 'application/json; charset=UTF-8',
          cookie: this.loginService.getServerSession()
        });
      case API_SERVER.TID:
        return Object.assign(header, {
          'content-type': 'application/x-www-form-urlencoded; charset-UTF-8',
          'Content-Length': JSON.stringify(params).length
        });
      default:
        return Object.assign(header, {
          'content-type': 'application/json; charset=UTF-8'
        });
    }
  }

  private makePath(path: string, method: API_METHOD, params: any, args: any[]): string {
    if ( args.length > 0 ) {
      args.map((argument, index) => {
        path = path.replace(`args-${index}`, argument);
      });
    }
    if ( !FormatHelper.isEmpty(params) ) {
      path = method === API_METHOD.GET ? path + ParamsHelper.setQueryParams(params) : path;
    }
    return path;
  }

  private apiCallback(observer, command, resp) {
    const respData = resp.data;
    this.logger.info(this, '[API RESP]', respData);

    if ( command.server === API_SERVER.BFF ) {
      this.setServerSession(resp.headers);
    }

    if ( FormatHelper.isObject(respData) && this.isSessionCallback(command) && respData.code === API_CODE.CODE_00 ) {
      this.setSvcInfo(respData.result);
    }
    observer.next(respData);
    observer.complete();
  }

  private handleError(observer, err) {
    const error = err.response.data;
    this.logger.error(this, '[API_ERR]', error);
    let message = 'unknown error';
    if ( FormatHelper.isObject(error) && !FormatHelper.isEmpty(error.msg) ) {
      message = error.msg;
    }
    // observer.error(err);
    observer.next({ code: API_CODE.CODE_400, msg: message, data: error });
    observer.complete();
  }

  private isSessionCallback(command: any): boolean {
    if ( command === API_CMD.BFF_03_0001
      || command === API_CMD.BFF_03_0001_mock
      || command === API_CMD.BFF_03_0004_C
      || command === API_CMD.BFF_03_0005_C ) {
      return true;
    }
    return false;
  }

  private setServerSession(headers) {
    this.logger.debug(this, 'Headers: ', JSON.stringify(headers));
    if ( headers['set-cookie'] ) {
      this.logger.info(this, 'Set Session Cookie');
      this.loginService.setServerSession(headers['set-cookie'][0]);
    }
  }

  private setSvcInfo(result) {
    this.logger.debug(this, 'Change SvcInfo');
    this.loginService.setSvcInfo(result);
  }
}

export default ApiService;
