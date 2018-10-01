import axios from 'axios';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, API_METHOD, API_SERVER } from '../types/api-command.type';
import ParamsHelper from '../utils/params.helper';
import LoginService from './login.service';
import LoggerService from './logger.service';
import FormatHelper from '../utils/format.helper';
import EnvHelper from '../utils/env.helper';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { COOKIE_KEY } from '../types/common.type';
import { LOGIN_TYPE } from '../types/bff.old.type';

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
        .catch(this.handleError.bind(this, observer, command));
    });
  }

  public getServerUri(command: any): string {
    return EnvHelper.getEnvironment(command.server);
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
    if ( FormatHelper.isEmpty(header) ) {
      header = {};
    }

    switch ( command.server ) {
      case API_SERVER.BFF:
        return Object.assign(header, {
          'content-type': 'application/json; charset=UTF-8',
          'x-user-ip': this.loginService.getNodeIp(),
          cookie: (FormatHelper.isEmpty(header.cookie) || (header.cookie).indexOf(COOKIE_KEY.APP_API) === -1) ? this.makeCookie() : header.cookie,
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

  private makeCookie(): string {
    return COOKIE_KEY.SESSION + '=' + this.loginService.getServerSession() + ';' +
      COOKIE_KEY.CHANNEL + '=' + this.loginService.getChannel() + ';' +
      COOKIE_KEY.DEVICE + '=' + this.loginService.getDeviceCookie();
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

    observer.next(respData);
    observer.complete();
  }

  private handleError(observer, command, err) {
    if ( !FormatHelper.isEmpty(err.response) ) {
      const error = err.response.data;
      const headers = err.response.headers;
      this.logger.error(this, '[API ERROR]', error);

      if ( command.server === API_SERVER.BFF ) {
        this.setServerSession(headers);
      }
      observer.next(error);
    } else {
      observer.next(err);
    }
    observer.complete();
  }

  private setServerSession(headers) {
    this.logger.info(this, 'Headers: ', JSON.stringify(headers));
    if ( headers['set-cookie'] ) {
      this.logger.info(this, 'Set Session Cookie');
      this.loginService.setServerSession(this.parseSessionCookie(headers['set-cookie'][0])).subscribe();
    }
  }

  private parseSessionCookie(cookie: string): string {
    if ( cookie.indexOf(COOKIE_KEY.SESSION) !== -1 ) {
      return cookie.split(';')[0].split('=')[1];
    }
    return '';
  }

  private requestLogin(command, params, type): Observable<any> {
    let result = null;
    return this.request(command, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          result = resp.result;
          return this.loginService.setSvcInfo({ mbrNm: resp.result.mbrNm });
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0005, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          resp.result.loginType = type;
          return this.loginService.setSvcInfo(resp.result);
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0002, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setAllSvcInfo(resp.result);
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if(resp.code === API_CODE.CODE_00) {
          return this.loginService.setChildInfo(resp.result);
        } else {
          throw resp;
        }
      })
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  public requestLoginTest(userId: string): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0001, { id: userId }, LOGIN_TYPE.TID);
  }

  public requestLoginTid(token: string, state: string): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0008, { token, state }, LOGIN_TYPE.TID);
  }

  public requestLoginSvcPassword(params: any): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0009, params, LOGIN_TYPE.TID);
  }

  public requestUserLocks(params: any): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0010, params, LOGIN_TYPE.TID);
  }

  public requestEasyLoginAos(params): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0017, params, LOGIN_TYPE.EASY);
  }

  public requestEasyLoginIos(params): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0018, params, LOGIN_TYPE.EASY);
  }

  public requestUpdateSvcInfo(command, params): Observable<any> {
    let result = null;
    return this.request(command, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          result = resp.result;
          return this.request(API_CMD.BFF_01_0005, {});
        } else {
          throw resp;
        }
      }).switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setSvcInfo(resp.result);
        } else {
          throw resp;
        }
      }).map(() => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  public requestChangeSvcPassword(params: any): Observable<any> {
    return this.requestUpdateSvcInfo(API_CMD.BFF_03_0016, params);
  }

  public requestChangeSession(params: any): Observable<any> {
    return this.requestUpdateSvcInfo(API_CMD.BFF_01_0004, params);
  }

  public requestChangeLine(params: any): Observable<any> {
    return this.requestUpdateSvcInfo(API_CMD.BFF_03_0005, params);
  }
}

export default ApiService;
