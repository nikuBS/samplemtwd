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
import CommonHelper from '../utils/common.helper';

/**
 * @desc API 요청을 위한 service
 */
class ApiService {
  static instance;
  private loginService: LoginService = new LoginService();
  private logger: LoggerService = new LoggerService();
  private req;
  private res;

  constructor() {
  }

  /**
   * request, response 저장
   * @param req
   * @param res
   */
  public setCurrentReq(req, res) {
    this.req = req;
    this.res = res;
    this.logger.info(this, '[API setCurrentReq]', !!req.session);
  }

  /**
   * API 요청
   * @param command
   * @param params
   * @param header
   * @param pathParams
   * @param version
   */
  public request(command: any, params: any, header?: any, pathParams?: any[], version?: string): Observable<any> {
    const req = this.req;
    const res = this.res;
    pathParams = pathParams || [];

    const apiUrl = this.getServerUri(command, req);
    const options = this.getOption(command, apiUrl, params, header, pathParams, version, req);
    const startTime = new Date().getTime();
    this.logger.info(this, '[API_REQ]', options);

    return Observable.create((observer) => {
      axios(options)
        .then(this.apiCallback.bind(this, observer, command, req, res, startTime))
        .catch(this.handleError.bind(this, observer, command, req, res));
    });
  }

  /**
   * command 별 server 주소 조회
   * @param command
   * @param req
   */
  public getServerUri(command: any, req: any): string {
    const buildType = (command.server === API_SERVER.BFF && this.loginService.isGreen(req) === BUILD_TYPE.GREEN) ? '_G' : '';
    return EnvHelper.getEnvironment(command.server + buildType);
  }

  /**
   * API 요청 option 구성
   * @param command
   * @param apiUrl
   * @param params
   * @param header
   * @param args
   * @param version
   * @param req
   */
  private getOption(command: any, apiUrl: any, params: any, header: any, args: any[], version, req: any): any {
    let option = {
      url: apiUrl + this.makePath(command.path, command.method, params, args, version),
      method: command.method,
      headers: this.makeHeader(command, header, params, req),
      timeout: 30000,
      data: params
    };

    if ( !!command.responseType ) {
      option = Object.assign(option, { responseType: command.responseType });
    }

    return option;
  }

  /**
   * API 요청 header 구성
   * @param command
   * @param header
   * @param params
   * @param req
   */
  private makeHeader(command: any, header: any, params, req): any {
    if ( FormatHelper.isEmpty(header) ) {
      header = {};
    }

    switch ( command.server ) {
      case API_SERVER.BFF:
        return Object.assign(header, {
          'content-type': 'application/json; charset=UTF-8',
          'x-user-ip': this.loginService.getNodeIp(req),
          'x-node-url': this.loginService.getPath(req),
          'x-useragent': this.loginService.getUserAgent(req),
          'x-env': this.loginService.isGreen(req),
          cookie: (FormatHelper.isEmpty(header.cookie) || (header.cookie).indexOf(COOKIE_KEY.APP_API) === -1) ?
            this.makeCookie(req) : this.makeNativeCookie(header.cookie, req)
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

  /**
   * API 요청 cookie 구성
   * @param req
   */
  private makeCookie(req): string {
    return COOKIE_KEY.SESSION + '=' + this.loginService.getServerSession(req) + ';' +
      COOKIE_KEY.CHANNEL + '=' + this.loginService.getChannel(req) + ';' +
      COOKIE_KEY.DEVICE + '=' + this.loginService.getDevice(req);
  }

  /**
   * Native 에서 보내는 API cookie 구성
   * @param cookie
   * @param req
   */
  private makeNativeCookie(cookie, req): string {
    return cookie + ';' + COOKIE_KEY.SESSION + '=' + this.loginService.getServerSession(req) + ';';
  }

  /**
   * API 요청 URL 구성
   * @param path
   * @param method
   * @param params
   * @param args
   * @param version
   */
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

  /**
   * API response 파싱
   * @param observer
   * @param command
   * @param req
   * @param res
   * @param startTime
   * @param resp
   */
  private apiCallback(observer, command, req, res, startTime, resp) {
    const contentType = resp.headers['content-type'];

    let respData = resp.data;
    this.logger.info(this, '[API RESP]', (new Date().getTime() - startTime) + 'ms', command.path, respData);

    if ( command.server === API_SERVER.BFF ) {
      this.setServerSession(resp.headers, req, res, command).subscribe((data) => {
        if ( contentType.includes('json') ) {
          // client에서 API를 직접 호출하지 않는 경우(server에서 API를 호출하는 경우)
          if ( !(req.baseUrl.indexOf('bypass') !== -1 || req.baseUrl.indexOf('native') !== -1 || req.baseUrl.indexOf('store') !== -1) ) {  
            // BFF server session이 변경되었을 경우
            if ( data && data.code === API_CODE.NODE_1005) {
              this.redirectInvalidSession(req, res, data);
            }
            if ( respData.code === API_CODE.BFF_0003 ) {
              const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
              this.logger.error(this, '[API RESP] Need Login', respData.code, respData.msg, this.loginService.getFullPath(req));
              if ( !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
                this.logger.info(this, '[Session expired]');
                res.clearCookie(COOKIE_KEY.TWM_LOGIN);
                CommonHelper.clearCookieWithpreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
                res.redirect('/common/member/logout/expire?target=' + this.loginService.getPath(req));
              } else {
                res.render('error.login-block.html', { target: this.loginService.getPath(req) });
              }
              return;

            } else if ( respData.code === API_CODE.BFF_0006 || respData.code === API_CODE.BFF_0011 ) {
              this.logger.error(this, '[API RESP] BFF Block', resp.code, resp.msg);
              const path = this.loginService.getFullPath(req);
              if ( !(/\/main\/home/.test(path) || /\/main\/store/.test(path) || /\/submain/.test(path)) ) {
                this.checkServiceBlock(resp.result);
              }
            }
          // client에서 API 직접 호출 시 BFF server session이 변경되었을 경우
          } else if ( data && data.code === API_CODE.NODE_1005) {
            respData = {code: API_CODE.NODE_1005, result: data.result};
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

  /**
   * API Error response 파싱
   * @param observer
   * @param command
   * @param req
   * @param res
   * @param err
   */
  private handleError(observer, command, req, res, err) {
    if ( !FormatHelper.isEmpty(err.response) && !FormatHelper.isEmpty(err.response.data) ) {
      let error = err.response.data;
      const headers = err.response.headers;
      this.logger.error(this, '[API ERROR]', command.path, error, req.baseUrl);

      if ( command.server === API_SERVER.BFF ) {
        const contentType = headers['content-type'];
        this.setServerSession(headers, req, res, command).subscribe((resp) => {
          if ( contentType.includes('json') ) {
            // client에서 API를 직접 호출하지 않는 경우(페이지 로드되면서 server에서 API를 호출하는 경우)
            if ( !(req.baseUrl.indexOf('bypass') !== -1 || req.baseUrl.indexOf('native') !== -1 || req.baseUrl.indexOf('store') !== -1) ) {  
            
              // BFF server session이 변경되었을 경우
              if ( resp && resp.code === API_CODE.NODE_1005) {
                this.redirectInvalidSession(req, res, resp);
              }

              if ( !FormatHelper.isEmpty(error.code) && error.code === API_CODE.BFF_0003 ) {
                const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
                this.logger.error(this, '[API RESP] Need Login', error.code, error.msg, this.loginService.getFullPath(req));
                if ( !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
                  this.logger.info(this, '[Session expired]');
                  res.clearCookie(COOKIE_KEY.TWM_LOGIN);
                  CommonHelper.clearCookieWithpreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
                  res.redirect('/common/member/logout/expire?target=' + this.loginService.getPath(req));
                } else {
                  res.render('error.login-block.html', { target: this.loginService.getPath(req) });
                }
                return;

              } else if ( !FormatHelper.isEmpty(error.code) && (error.code === API_CODE.BFF_0006 || error.code === API_CODE.BFF_0011) ) {
                this.logger.error(this, '[API RESP] BFF Block', resp.code, resp.msg);
                const path = this.loginService.getFullPath(req);
                if ( !(/\/main\/home/.test(path) || /\/main\/store/.test(path) || /\/submain/.test(path)) ) {
                  this.checkServiceBlock(resp.result);
                }
              }
            // client에서 API 직접 호출 시 BFF server session이 변경되었을 경우
            } else if ( resp && resp.code === API_CODE.NODE_1005) {
              error = {code: API_CODE.NODE_1005, result: resp.result};
            }

          }

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

  /**
   * 서버세션저장
   * @param headers
   * @param req
   * @param res
   * @parem command
   */
  private setServerSession(headers, req, res, command): Observable<any> {
    this.logger.info(this, 'Headers: ', JSON.stringify(headers));
    if ( headers['set-cookie'] ) {
      const serverSession = this.parseSessionCookie(headers['set-cookie'][0]);
      this.logger.info(this, '[Set Session Cookie]', serverSession);
      if ( !FormatHelper.isEmpty(serverSession)) {
        // 로그인 상태이고, 이전 request의 서버 세션과 response 서버 세션이 다를 경우는 오류 처리 한다.
        if ( req.session.serverSession !== serverSession && this.loginService.isLogin(req)) {
          // this.logger.error(this, '[BE Session changed]', command.path, req.originalUrl
          //                   , '[ Before : ' + req.session.serverSession + ' ]'
          //                   , '[ After : ' + serverSession + ' ]'
          //                   , req.session.svcInfo);

          return Observable.of({
              code : API_CODE.NODE_1005, 
              result : {
                commandPath : command.path,
                preServerSession : req.session.serverSession,
                curServerSession : serverSession,
                url : this.loginService.getPath(req),
                point : 'SERVER_API_RES',
                target : this.loginService.getPath(req)
              }
            });
        }
        return this.loginService.setServerSession(req, res, serverSession);
      } else {
        return Observable.of({});
      }
    } else {
      return Observable.of({});
    }
  }

  /**
   * 서버세션 쿠키 파싱
   * @param cookie
   */
  private parseSessionCookie(cookie: string): string {
    if ( cookie.indexOf(COOKIE_KEY.SESSION) !== -1 ) {
      return cookie.split(';')[0].split('=')[1];
    }
    return '';
  }

  /**
   * 로그인 요청
   * @param command
   * @param params
   * @param type
   */
  private requestLogin(command, params, type): Observable<any> {
    return this.request(command, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.combineLatest([
            this.loginService.setSvcInfo(this.req, this.res, {
              mbrNm: resp.result.mbrNm,
              // noticeType: resp.result.noticeTypCd,
              twdAdRcvAgreeYn: resp.result.twdAdRcvAgreeYn,
              twdInfoRcvAgreeYn: resp.result.twdInfoRcvAgreeYn,
              twdLocUseAgreeYn: resp.result.twdLocUseAgreeYn,
              tplaceUseAgreeYn: resp.result.tplaceUseAgreeYn,
              loginType: type
            }),
            this.loginService.setNoticeType(this.req, resp.result.noticeTypCd)
            // this.loginService.setNoticeType(this.req, '05')
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
            expsSvcCnt: resp.result.expsSvcCnt,
            mbrChlId: resp.result.mbrChlId
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

          this.loginService.clearXtCookie(this.res);
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, curSvcInfo),
            this.loginService.setAllSvcInfo(this.req, this.res, resp.result));
        } else {
          // return Observable.combineLatest(
          //   this.loginService.setSvcInfo(this.req, this.res, null),
          //   this.loginService.setAllSvcInfo(this.req, this.res, null));
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setChildInfo(this.req, this.res, resp.result);
        } else {
          // return this.loginService.setChildInfo(this.req, this.res, null);
          throw resp;
        }
      })
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: this.loginService.getSvcInfo(this.req) };
      });
  }

  /**
   * 간편로그인 요청
   * @param command
   * @param params
   * @param type
   */
  private requestSLogin(command, params, type): Observable<any> {
    return this.request(command, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.combineLatest([
            this.loginService.setSvcInfo(this.req, this.res, {
              mbrNm: resp.result.mbrNm,
              // noticeType: resp.result.noticeTypCd,
              twdAdRcvAgreeYn: resp.result.twdAdRcvAgreeYn,
              twdInfoRcvAgreeYn: resp.result.twdInfoRcvAgreeYn,
              twdLocUseAgreeYn: resp.result.twdLocUseAgreeYn,
              tplaceUseAgreeYn: resp.result.tplaceUseAgreeYn,
              loginType: type
            }),
            this.loginService.setNoticeType(this.req, resp.result.noticeTypCd)
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

          this.loginService.clearXtCookie(this.res);
          return this.loginService.setSvcInfo(this.req, this.res, curSvcInfo);
        } else {
          // return this.loginService.setSvcInfo(this.req, this.res, null);
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0002, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setAllSvcInfo(this.req, this.res, resp.result);
        } else {
          // return this.loginService.setAllSvcInfo(this.req, this.res, null);
          throw resp;
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setChildInfo(this.req, this.res, resp.result);
        } else {
          // return this.loginService.setChildInfo(this.req, this.res, null);
          throw resp;
        }
      }).map((resp) => {
        return { code: API_CODE.CODE_00, result: this.loginService.getSvcInfo(this.req) };
      });
  }

  /**
   * 성능테스트용 로그인 요청
   * @param userId
   */
  public requestLoginLoadTest(userId: string): Observable<any> {
    let result = null;
    return this.request(API_CMD.BFF_03_0000_TEST, { mbrChlId: userId })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          result = resp.result;
          return this.loginService.setSvcInfo(this.req, this.res, {
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
            this.loginService.setSvcInfo(this.req, this.res, currentSvcInfo),
            this.loginService.setAllSvcInfo(this.req, this.res, resp.result));
        } else {
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, null),
            this.loginService.setAllSvcInfo(this.req, this.res, null));
        }
      })
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  /**
   * 개발용 로그인 요청
   * @param userId
   */
  public requestLoginTest(userId: string): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0000, { id: userId }, LOGIN_TYPE.TID);
  }

  /**
   * TID 토큰을 이용한 로그인 요청
   * @param token
   * @param state
   */
  public requestLoginTid(token: string, state: string): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0008, { token, state }, LOGIN_TYPE.TID);
  }

  /**
   * 고객보호비밀번호 로그인 요청
   * @param params
   */
  public requestLoginSvcPassword(params: any): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0009, params, LOGIN_TYPE.TID);
  }

  /**
   * 휴면해제 요
   * @param params
   */
  public requestUserLocks(params: any): Observable<any> {
    return this.requestLogin(API_CMD.BFF_03_0010, params, LOGIN_TYPE.TID);
  }

  /**
   * 안드로이드 간편로그인 요청
   * @param params
   */
  public requestEasyLoginAos(params): Observable<any> {
    return this.requestSLogin(API_CMD.BFF_03_0017, params, LOGIN_TYPE.EASY);
  }

  /**
   * IOS 간편로그인 요청
   * @param params
   */
  public requestEasyLoginIos(params): Observable<any> {
    return this.requestSLogin(API_CMD.BFF_03_0018, params, LOGIN_TYPE.EASY);
  }

  /**
   * 세션정보 업데이트를 위한 API 요청
   * @param command
   * @param params
   */
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
          return this.loginService.setSvcInfo(this.req, this.res, resp.result);
        } else {
          throw resp;
        }
      }).map(() => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  /**
   * 고객보호비밀번호 설정 요청
   * @param params
   */
  public requestChangeSvcPassword(params: any): Observable<any> {
    return this.requestUpdateSvcInfo(API_CMD.BFF_03_0016, params);
  }

  /**
   * 세션정보 업데이트 요청
   * @param params
   */
  public requestChangeSession(params: any): Observable<any> {
    return this.requestUpdateSvcInfo(API_CMD.BFF_01_0003, params);
  }

  /**
   * 전체회선 업데이트 API 요청
   * @param command
   * @param params
   * @param headers
   * @param pathParams
   * @param version
   */
  public requestUpdateAllSvcInfo(command, params, headers?, pathParams?, version?): Observable<any> {
    let result = null;
    return this.request(command, params, headers, pathParams, version)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          result = resp.result;
          const svcInfo = this.loginService.getSvcInfo(this.req);
          const newSvc = new SvcInfoModel({
            mbrNm: svcInfo.mbrNm,
            // noticeType: svcInfo.noticeType,
            twdAdRcvAgreeYn: svcInfo.twdAdRcvAgreeYn,
            twdInfoRcvAgreeYn: svcInfo.twdInfoRcvAgreeYn,
            twdLocUseAgreeYn: svcInfo.twdLocUseAgreeYn,
            tplaceUseAgreeYn: svcInfo.tplaceUseAgreeYn,
            loginType: svcInfo.loginType
          });
          return this.loginService.setSvcInfo(this.req, this.res, newSvc);
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => this.updateSvcInfo(result));
  }

  /**
   * 회선변경 요청
   * @param params
   * @param headers
   * @param pathParams
   * @param version
   */
  public requestChangeLine(params: any, headers?: any, pathParams?: any, version?: any): Observable<any> {
    return this.requestUpdateAllSvcInfo(API_CMD.BFF_03_0005, params, headers, pathParams, version);
  }

  /**
   * 닉네임 변경 요청
   * @param params
   * @param headers
   * @param pathParams
   * @param version
   */
  public requestChangeNickname(params: any, headers?: any, pathParams?: any, version?: any): Observable<any> {
    return this.requestUpdateAllSvcInfo(API_CMD.BFF_03_0006, params, headers, pathParams, version);
  }

  /**
   * 회선 정보 세션 업데이트
   * @param result
   */
  public updateSvcInfo(result): Observable<any> {
    return this.request(API_CMD.BFF_01_0005, {})
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setSvcInfo(this.req, this.res, resp.result);
        } else if ( resp.code === 'BFF0030' ) {
          const svcInfo = this.loginService.getSvcInfo(this.req);
          return this.loginService.setSvcInfo(this.req, this.res, new SvcInfoModel({
            mbrNm: svcInfo.mbrNm,
            // noticeType: svcInfo.noticeType,
            twdAdRcvAgreeYn: svcInfo.twdAdRcvAgreeYn,
            twdInfoRcvAgreeYn: svcInfo.twdInfoRcvAgreeYn,
            twdLocUseAgreeYn: svcInfo.twdLocUseAgreeYn,
            tplaceUseAgreeYn: svcInfo.tplaceUseAgreeYn,
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
            this.loginService.setSvcInfo(this.req, this.res, currentSvcInfo),
            this.loginService.setAllSvcInfo(this.req, this.res, resp.result));
        } else {
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, null),
            this.loginService.setAllSvcInfo(this.req, this.res, null));
        }
      })
      .switchMap((resp) => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return this.loginService.setChildInfo(this.req, this.res, resp.result);
        } else {
          return this.loginService.setChildInfo(this.req, this.res, null);
        }
      }).map(() => {
        return { code: API_CODE.CODE_00, result: result };
      });
  }

  /**
   * 세션 캐싱을 위한 API 요청
   * @param command
   * @param params
   * @param header
   * @param pathParams
   * @param version
   */
  public requestStore(command: any, params: any, header?: any, pathParams?: any[], version?: string): Observable<any> {
    const svcInfo = this.loginService.getSvcInfo(this.req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      // need login
      return this.request(API_CMD[command], params, header, pathParams, version);
    }
    const svcMgmtNum = svcInfo.svcMgmtNum;
    const storeData = this.loginService.getSessionStore(this.req, command, svcMgmtNum);
    if ( FormatHelper.isEmpty(storeData) || storeData.data.code !== API_CODE.CODE_00 ||
      DateHelper.convDateFormat(storeData.expired).getTime() < new Date().getTime() ) {
      return this.request(API_CMD[command], params, header, pathParams, version)
        .switchMap((resp) => this.loginService.setSessionStore(this.req, command, svcMgmtNum, resp))
        .map((resp) => resp.data);
    } else {
      return Observable.of(storeData.data);
    }
  }

  /**
   * API 차단시 redirect 요청
   * @param block
   */
  private checkServiceBlock(block) {
    const blockUrl = block.fallbackUrl || '/common/util/service-block';
    this.res.redirect(blockUrl + '?fromDtm=' + block.fromDtm + '&toDtm=' + block.toDtm);
    return;
  }

  /***
   * BFF Spring의 session 변경 시 자동 logout 페이지로 redirect
   * @param resp
   */
  private redirectInvalidSession(req, res, resp) {

    const params = 'sess_invalid=Y'
                + '&pre_server_se=' + resp.result.preServerSession
                + '&cur_server_se=' + resp.result.curServerSession
                + '&url=' + resp.result.url
                + '&command_path=' + resp.result.commandPath
                + '&point=' + resp.result.point
                + '&target=' + resp.result.target;

    res.redirect('/common/member/logout/expire?' + params);
  }
}

export default ApiService;
