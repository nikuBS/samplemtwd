import axios from 'axios';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, API_METHOD, API_SERVER, API_VERSION } from '../types/api-command.type';
import ParamsHelper from '../utils/params.helper';
import LoginService from './login.service';
import LoggerService from './logger.service';
import FormatHelper from '../utils/format.helper';
import EnvHelper from '../utils/env.helper';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { BUILD_TYPE, COOKIE_KEY } from '../types/common.type';
import { LINE_NAME, LOGIN_TYPE } from '../types/bff.type';
import { SvcInfoModel } from '../models/svc-info.model';
import DateHelper from '../utils/date.helper';

class ApiService {
  static instance;
  private loginService: LoginService = new LoginService();
  private logger: LoggerService = new LoggerService();

  constructor() {
  }

  public setCurrentReq(res, req) {
    this.loginService.setCurrentReq(res, req);
    this.logger.info(this, '[API setCurrentReq]', !!req.session);
  }

  public request(command: any, params: any, header?: any, pathParams?: any[], version?: string): Observable<any> {
    pathParams = pathParams || [];

    const apiUrl = this.getServerUri(command);
    const options = this.getOption(command, apiUrl, params, header, pathParams, version);
    const startTime = new Date().getTime();
    this.logger.info(this, '[API_REQ]', options);

    return Observable.create((observer) => {
      axios(options)
        .then(this.apiCallback.bind(this, observer, command, startTime))
        .catch(this.handleError.bind(this, observer, command));
    });
  }

  public getServerUri(command: any): string {
    const buildType = (command.server === API_SERVER.BFF && this.loginService.isGreen() === BUILD_TYPE.GREEN) ? '_G' : '';
    return EnvHelper.getEnvironment(command.server + buildType);
  }

  private getOption(command: any, apiUrl: any, params: any, header: any, args: any[], version): any {
    let option = {
      url: apiUrl + this.makePath(command.path, command.method, params, args, version),
      method: command.method,
      headers: this.makeHeader(command, header, params),
      timeout: 30000,
      data: params
    };

    if ( !!command.responseType ) {
      option = Object.assign(option, { responseType: command.responseType });
    }

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
          'x-node-url': this.loginService.getPath(),
          'x-useragent': this.loginService.getUserAgent(),
          'x-env': this.loginService.isGreen(),
          cookie: (FormatHelper.isEmpty(header.cookie) || (header.cookie).indexOf(COOKIE_KEY.APP_API) === -1) ?
            this.makeCookie() : this.makeNativeCookie(header.cookie)
          // 'cookie': this.makeCookie()
        });
      case API_SERVER.SEARCH:
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
      COOKIE_KEY.DEVICE + '=' + this.loginService.getDevice();
  }

  private makeNativeCookie(cookie): string {
    return cookie + ';' + COOKIE_KEY.SESSION + '=' + this.loginService.getServerSession() + ';';
  }

  private makePath(path: string, method: API_METHOD, params: any, args: any[], version): string {
    version = version || API_VERSION.V1;
    if ( args.length > 0 ) {
      args.map((argument, index) => {
        path = path.replace(`:args${index}`, argument);
      });
    }
    path = path.replace(':version', version);
    if ( !FormatHelper.isEmpty(params) ) {
      path = method === API_METHOD.GET ? path + ParamsHelper.setQueryParams(params) : path;
    }
    return path;
  }

  private apiCallback(observer, command, startTime, resp) {
    const contentType = resp.headers['content-type'];

    const respData = resp.data;
    this.logger.info(this, '[API RESP]', (new Date().getTime() - startTime) + 'ms', command.path, respData);

    if ( command.server === API_SERVER.BFF ) {
      this.setServerSession(resp.headers).subscribe(() => {
        if ( contentType.includes('json') ) {
          if ( respData.code === API_CODE.BFF_0003 ) {
            this.logger.error(this, '[API RESP] Session Expired', resp.code, resp.msg, this.loginService.getFullPath());
            this.loginService.getResponse().redirect('/common/member/logout/expire?target=' + this.loginService.getFullPath());
            return;

          } else if ( respData.code === API_CODE.BFF_0006 || respData.code === API_CODE.BFF_0007 ) {
            this.logger.error(this, '[API RESP] BFF Block', resp.code, resp.msg);
            const path = this.loginService.getFullPath();
            if ( !(/\/main\/home/.test(path) || /\/main\/store/.test(path) || /\/submain/.test(path)) ) {
              this.checkServiceBlock(resp.result);
            }
          }
        }

        observer.next(respData);
        observer.complete();
      });
    } else {
      observer.next(respData);
      observer.complete();
    }
  }

  private handleError(observer, command, err) {
    if ( !FormatHelper.isEmpty(err.response) && !FormatHelper.isEmpty(err.response.data) ) {
      const error = err.response.data;
      const headers = err.response.headers;
      this.logger.error(this, '[API ERROR]', command.path, error);

      if ( command.server === API_SERVER.BFF ) {
        this.setServerSession(headers).subscribe((resp) => {
          observer.next(error);
          observer.complete();
        });
      } else {
        observer.next(error);
        observer.complete();
      }
    } else {
      this.logger.error(this, '[API ERROR] Exception', err);
      observer.next({ code: API_CODE.CODE_500 });
      observer.complete();
    }
  }

  private setServerSession(headers): Observable<any> {
    this.logger.info(this, 'Headers: ', JSON.stringify(headers));
    if ( headers['set-cookie'] ) {
      const serverSession = this.parseSessionCookie(headers['set-cookie'][0]);
      this.logger.info(this, '[Set Session Cookie]', serverSession);
      if ( !FormatHelper.isEmpty(serverSession) ) {
        return this.loginService.setServerSession(serverSession);
      } else {
        return Observable.of({});
      }
    } else {
      return Observable.of({});
    }
  }

  private parseSessionCookie(cookie: string): string {
    if ( cookie.indexOf(COOKIE_KEY.SESSION) !== -1 ) {
      return cookie.split(';')[0].split('=')[1];
    }
    return '';
  }

  private requestLogin(command, params, type): Observable<any> {
    return this.request(command, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.combineLatest([
            this.loginService.setSvcInfo({
              mbrNm: resp.result.mbrNm,
              // noticeType: resp.result.noticeTypCd,
              loginType: type
            }),
            this.loginService.setNoticeType(resp.result.noticeTypCd)
            // this.loginService.setNoticeType('05')
          ]);
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0002, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
          const curSvcInfo = {
            userId: resp.result.userId,
            xtUserId: resp.result.xtUserId,
            totalSvcCnt: resp.result.totalSvcCnt,
            expsSvcCnt: resp.result.expsSvcCnt
          };
          category.map((line) => {
            const curLine = resp.result[LINE_NAME[line]];
            if ( !FormatHelper.isEmpty(curLine) ) {
              curLine.map((target) => {
                if ( target.expsSeq === '1' ) {
                  Object.assign(curSvcInfo, target);
                }
              });
              // delete resp.result.userId;
              // delete resp.result.xtUserId;
              // delete resp.result.totalSvcCnt;
              // delete resp.result.expsSvcCnt;
            }
          });

          this.loginService.clearXtCookie();
          return Observable.combineLatest(
            this.loginService.setSvcInfo(curSvcInfo),
            this.loginService.setAllSvcInfo(resp.result));
        } else {
          return Observable.combineLatest(
            this.loginService.setSvcInfo(null),
            this.loginService.setAllSvcInfo(null));
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setChildInfo(resp.result);
        } else {
          return this.loginService.setChildInfo(null);
        }
      })
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: this.loginService.getSvcInfo() };
      });
  }

  private requestSLogin(command, params, type): Observable<any> {
    return this.request(command, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.combineLatest([
            this.loginService.setSvcInfo({
              mbrNm: resp.result.mbrNm,
              // noticeType: resp.result.noticeTypCd,
              loginType: type
            }),
            this.loginService.setNoticeType(resp.result.noticeTypCd)
          ]);
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0005, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const curSvcInfo = {
            totalSvcCnt: 1,
            expsSvcCnt: 1
          };
          Object.assign(curSvcInfo, resp.result);

          this.loginService.clearXtCookie();
          return this.loginService.setSvcInfo(curSvcInfo);
        } else {
          return this.loginService.setSvcInfo(null);
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0002, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setAllSvcInfo(resp.result);
        } else {
          return this.loginService.setAllSvcInfo(null);
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setChildInfo(resp.result);
        } else {
          return this.loginService.setChildInfo(null);
        }
      }).map((resp) => {
        return { code: API_CODE.CODE_00, result: this.loginService.getSvcInfo() };
      });
  }

  public requestLoginLoadTest(userId: string): Observable<any> {
    let result = null;
    return this.request(API_CMD.BFF_03_0000_TEST, { mbrChlId: userId })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          result = resp.result;
          return this.loginService.setSvcInfo({
            mbrNm: resp.result.mbrNm,
            // noticeType: resp.result.noticeTypCd,
            loginType: LOGIN_TYPE.TID
          });
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0002, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
          const currentSvcInfo = {
            userId: resp.result.userId,
            xtUserId: resp.result.xtUserId,
            totalSvcCnt: resp.result.totalSvcCnt,
            expsSvcCnt: resp.result.expsSvcCnt
          };
          category.map((line) => {
            const curLine = resp.result[LINE_NAME[line]];
            if ( !FormatHelper.isEmpty(curLine) ) {
              curLine.map((target) => {
                if ( target.expsSeq === '1' ) {
                  Object.assign(currentSvcInfo, target);
                }
              });
              // delete resp.result.userId;
              // delete resp.result.xtUserId;
              // delete resp.result.totalSvcCnt;
              // delete resp.result.expsSvcCnt;
            }
          });
          return Observable.combineLatest(
            this.loginService.setSvcInfo(currentSvcInfo),
            this.loginService.setAllSvcInfo(resp.result));
        } else {
          return Observable.combineLatest(
            this.loginService.setSvcInfo(null),
            this.loginService.setAllSvcInfo(null));
        }
      })
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  public requestLoginTest(userId: string): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0000, { id: userId }, LOGIN_TYPE.TID);
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
    return this.requestSLogin(API_CMD.BFF_03_0017, params, LOGIN_TYPE.EASY);
  }

  public requestEasyLoginIos(params): Observable<any> {
    return this.requestSLogin(API_CMD.BFF_03_0018, params, LOGIN_TYPE.EASY);
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
    return this.requestUpdateSvcInfo(API_CMD.BFF_01_0003, params);
  }

  public requestUpdateAllSvcInfo(command, params, headers?, pathParams?, version?): Observable<any> {
    let result = null;
    return this.request(command, params, headers, pathParams, version)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          result = resp.result;
          const svcInfo = this.loginService.getSvcInfo();
          const newSvc = new SvcInfoModel({
            mbrNm: svcInfo.mbrNm,
            // noticeType: svcInfo.noticeType,
            loginType: svcInfo.loginType
          });
          return this.loginService.setSvcInfo(newSvc);
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.updateSvcInfo(result));
  }

  public requestChangeLine(params: any, headers?: any, pathParams?: any, version?: any): Observable<any> {
    return this.requestUpdateAllSvcInfo(API_CMD.BFF_03_0005, params, headers, pathParams, version);
  }

  public requestChangeNickname(params: any, headers?: any, pathParams?: any, version?: any): Observable<any> {
    return this.requestUpdateAllSvcInfo(API_CMD.BFF_03_0006, params, headers, pathParams, version);
  }

  public updateSvcInfo(result): Observable<any> {
    return this.request(API_CMD.BFF_01_0005, {})
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setSvcInfo(resp.result);
        } else if ( resp.code === 'BFF0030' ) {
          const svcInfo = this.loginService.getSvcInfo();
          return this.loginService.setSvcInfo(new SvcInfoModel({
            mbrNm: svcInfo.mbrNm,
            // noticeType: svcInfo.noticeType,
            loginType: svcInfo.loginType
          }));
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0002, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          // const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
          const currentSvcInfo = {
            userId: resp.result.userId,
            xtUserId: resp.result.xtUserId,
            totalSvcCnt: resp.result.totalSvcCnt,
            expsSvcCnt: resp.result.expsSvcCnt
          };
          return Observable.combineLatest(
            this.loginService.setSvcInfo(currentSvcInfo),
            this.loginService.setAllSvcInfo(resp.result));
        } else {
          return Observable.combineLatest(
            this.loginService.setSvcInfo(null),
            this.loginService.setAllSvcInfo(null));
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setChildInfo(resp.result);
        } else {
          return this.loginService.setChildInfo(null);
        }
      }).map(() => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  public requestStore(command: any, params: any, header?: any, pathParams?: any[], version?: string): Observable<any> {
    const svcInfo = this.loginService.getSvcInfo();
    if ( FormatHelper.isEmpty(svcInfo) ) {
      // need login
      return this.request(API_CMD[command], params, header, pathParams, version);
    }
    const svcMgmtNum = svcInfo.svcMgmtNum;
    const storeData = this.loginService.getSessionStore(command, svcMgmtNum);
    if ( FormatHelper.isEmpty(storeData) || storeData.data.code !== API_CODE.CODE_00 ||
      DateHelper.convDateFormat(storeData.expired).getTime() < new Date().getTime() ) {
      return this.request(API_CMD[command], params, header, pathParams, version)
        .switchMap((resp) => this.loginService.setSessionStore(command, svcMgmtNum, resp))
        .map((resp) => resp.data);
    } else {
      return Observable.of(storeData.data);
    }
  }

  private checkServiceBlock(block) {
    const today = new Date().getTime();
    const startTime = DateHelper.convDateFormat(block.fromDtm).getTime();
    const endTime = DateHelper.convDateFormat(block.toDtm).getTime();
    if ( today > startTime && today < endTime ) {
      const blockUrl = '/common/util/service-block';
      this.loginService.getResponse().redirect(blockUrl + '?fromDtm=' + block.fromDtm + '&toDtm=' + block.toDtm);
      return;
    }
  }
}

export default ApiService;
