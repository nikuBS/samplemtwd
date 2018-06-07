import http from 'http';
import https from 'https';
import { Observable } from 'rxjs/Observable';
import environment from '../config/environment.config';
import { API_CMD, API_CODE, API_METHOD, API_PROTOCOL } from '../types/api-command.type';
import ParamsHelper from '../utils/params.helper';
import LoginService from './login.service';
import LoggerService from './logger.service';

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
    const apiServer = environment[String(process.env.NODE_ENV)].BFF_SERVER;
    const options = this.getOption(command, apiServer, params, header, args);
    this.logger.info(this, '[API_REQ]', options, params);

    return Observable.create((observer) => {
      const req = apiServer.protocol === API_PROTOCOL.HTTPS ?
        https.request(options, this.apiCallback.bind(this, observer, command)) :
        http.request(options, this.apiCallback.bind(this, observer, command));

      req.on('error', this.handleError.bind(this, observer));
      req.write(JSON.stringify(params));
      req.end();
    });
  }

  private getOption(command: any, apiServer: any, params: any, header: any, args: any[]): any {
    if ( !header ) {
      header = {};
    }
    return {
      hostname: apiServer.url,
      port: apiServer.port,
      path: this.makePath(command.path, command.method, params, args),
      method: command.method,
      headers: Object.assign(header, {
        'Content-type': 'application/json; charset=UTF-8',
        cookie: this.loginService.getServerSession()
      })
    };
  }

  private makePath(path: string, method: API_METHOD, params: any, args: any[]): string {
    if ( args.length > 0 ) {
      args.map((argument, index) => {
        path = path.replace(`{args[${index}]}`, argument);
      });
    }
    path = method === API_METHOD.GET ? path + ParamsHelper.setQueryParams(params) : path;
    return path;
  }

  private apiCallback(observer, command, resp) {
    let data = '';
    this.setServerSession(resp);

    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      this.logger.info(this, '[API_RESP]', data);
      let respData;
      try {
        respData = JSON.parse(data);
        if ( this.isSessionCallback(command) ) {
          this.setSvcInfo(respData.result);
        }
      } catch ( err ) {
        this.logger.warn(this, 'JSON parse error');
        respData = data;
      }

      observer.next(respData);
      observer.complete();
    });
  }

  private handleError(observer, err) {
    this.logger.error(this, '[API_ERR]', err);
    // observer.error(err);
    observer.next({ code: API_CODE.CODE_400, msg: err.message });
    observer.complete();
  }

  private isSessionCallback(command: any): boolean {
    if ( command === API_CMD.BFF_03_0001 || command === API_CMD.BFF_03_0004 || command === API_CMD.BFF_03_0005 ) {
      return true;
    }
    return false;
  }

  private setServerSession(resp) {
    this.logger.debug(this, 'Headers: ', JSON.stringify(resp.headers));
    if ( resp.headers['set-cookie'] ) {
      this.logger.info(this, 'Set Session Cookie');
      this.loginService.setServerSession(resp.headers['set-cookie'][0]);
    }
  }

  private setSvcInfo(result) {
    this.loginService.setSvcInfo(result);

  }
}

export default ApiService;
