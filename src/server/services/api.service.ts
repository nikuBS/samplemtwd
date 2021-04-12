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
import BrowserHelper from '../utils/browser.helper';

/**
 * @desc API 요청을 위한 service
 */
class ApiService {
  static instance;
  private loginService: LoginService = new LoginService();
  private logger: LoggerService = new LoggerService();
  private req;
  private res;
  private timeout = 30000;

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

  public setTimeout(sec) {
    this.timeout = sec;
  }

  public getTimeout() {
    return this.timeout;
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
        .then(this.apiCallback.bind(this, observer, command, req, res, options, startTime))
        .catch(this.handleError.bind(this, observer, command, req, res, options));
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
      timeout: this.getTimeout() || 15000,
      // timeout: this.getTimeout() || 30000,
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
        path = path.replace(`:args${ index }`, argument);
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
  private apiCallback(observer, command, req, res, options, startTime, resp) {
    const contentType = resp.headers['content-type'];

    let respData = resp.data;
    this.logger.info(this, '[API RESP]', (new Date().getTime() - startTime) + 'ms', command.path, respData);

    if ( command.server === API_SERVER.BFF ) {
      this.setServerSession(resp.headers, req, res, command).subscribe((data) => {
        if ( contentType.includes('json') ) {
          // client에서 API를 직접 호출하지 않는 경우(server에서 API를 호출하는 경우)
          if ( !!req.baseUrl && !(req.baseUrl.indexOf('bypass') !== -1 || req.baseUrl.indexOf('native') !== -1 || req.baseUrl.indexOf('store') !== -1) ) {
            // BFF server session이 변경되었을 경우
            if ( data && data.code === API_CODE.NODE_1005 ) {
              this.redirectInvalidSession(req, res, data);
            }
            if ( respData.code === API_CODE.BFF_0003 ) {
              const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
              // this.logger.error(this, '[API RESP] Need Login', respData.code, respData.msg, this.loginService.getFullPath(req));
              this.printErrorLog('[API RESP] Need Login', req, command, options, resp);
              if ( !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
                this.logger.info(this, '[Session expired]');
                res.clearCookie(COOKIE_KEY.TWM_LOGIN);
                CommonHelper.clearCookieWithPreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
                res.redirect('/common/member/logout/expire?target=' + this.loginService.getPath(req));
              } else {
                res.render('error.login-block.html', { target: this.loginService.getPath(req) });
              }
              return;

            } else if ( respData.code === API_CODE.BFF_0006 || respData.code === API_CODE.BFF_0011 ) {
              // this.logger.error(this, '[API RESP] BFF Block', resp.code, resp.msg);
              this.printErrorLog('[API RESP] BFF Block', req, command, options, resp);
              const path = this.loginService.getFullPath(req);
              if ( path ) {
                // fix: 정규표현식으로 값 비교시 값이 undefined 인 경우 오류가 발생하여 이후 처리가 불가로 수정
                if ( !(/\/main\/home/.test(path) || /\/main\/store/.test(path)
                  || /\/product\/roaming\/on/.test(path) || /\/submain/.test(path)) ) {
                  this.checkServiceBlock(resp.result);
                }
              }
            }
            // client에서 API 직접 호출 시 BFF server session이 변경되었을 경우
          } else if ( data && data.code === API_CODE.NODE_1005 ) {
            respData = { code: API_CODE.NODE_1005, result: data.result };
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
  private handleError(observer, command, req, res, options, err) {
    if ( !err.response && err.stack ) {
      this.logger.error(this, '[Programming error] Stack :: ', err.stack);
      this.logger.error(this, '[Programming error] SvcInfo :: ', req.session && req.session.svcInfo);
      // page controller 에서 error 가 발생하여 무한로딩이 발생 시 error 페이지 노출 하도록 추가
      return res.status(500).render('error.page-not-found.html', {
        svcInfo: req.session ? req.session.svcInfo : null,
        code: res.statusCode
      });
    }

    if ( !FormatHelper.isEmpty(err.response) && !FormatHelper.isEmpty(err.response.data) ) {
      let error = err.response.data;
      const headers = err.response.headers;
      // this.logger.error(this, '[API ERROR]', command.path, error, req.baseUrl);
      this.printErrorLog('[API ERROR]', req, command, options, error);

      if ( command.server === API_SERVER.BFF ) {
        const contentType = headers['content-type'];
        this.setServerSession(headers, req, res, command).subscribe((resp) => {
          if ( contentType.includes('json') ) {
            // client에서 API를 직접 호출하지 않는 경우(페이지 로드되면서 server에서 API를 호출하는 경우)
            if ( !!req.baseUrl && !(req.baseUrl.indexOf('bypass') !== -1 || req.baseUrl.indexOf('native') !== -1 || req.baseUrl.indexOf('store') !== -1) ) {

              // BFF server session이 변경되었을 경우
              if ( resp && resp.code === API_CODE.NODE_1005 ) {
                this.redirectInvalidSession(req, res, resp);
              }

              if ( !FormatHelper.isEmpty(error.code) && error.code === API_CODE.BFF_0003 ) {
                const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
                // this.logger.error(this, '[API RESP] Need Login', error.code, error.msg, this.loginService.getFullPath(req));
                this.printErrorLog('[API RESP] Need Login', req, command, options, resp);
                if ( !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
                  this.logger.info(this, '[Session expired]');
                  res.clearCookie(COOKIE_KEY.TWM_LOGIN);
                  CommonHelper.clearCookieWithPreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
                  res.redirect('/common/member/logout/expire?target=' + this.loginService.getPath(req));
                } else {
                  res.render('error.login-block.html', { target: this.loginService.getPath(req) });
                }
                return;

              } else if ( !FormatHelper.isEmpty(error.code) && (error.code === API_CODE.BFF_0006 || error.code === API_CODE.BFF_0011) ) {
                this.logger.error(this, '[API RESP] BFF Block', resp.code, resp.msg);
                this.printErrorLog('[API RESP] BFF Block', req, command, options, resp);
                const path = this.loginService.getFullPath(req);
                if ( path ) {
                  // fix: 정규표현식으로 값 비교시 값이 undefined 인 경우 오류가 발생하여 이후 처리가 불가로 수정
                  if ( !(/\/main\/home/.test(path) || /\/main\/store/.test(path)
                    || /\/product\/roaming\/on/.test(path) || /\/submain/.test(path)) ) {
                    this.checkServiceBlock(resp.result);
                  }
                }
              }
              // client에서 API 직접 호출 시 BFF server session이 변경되었을 경우
            } else if ( resp && resp.code === API_CODE.NODE_1005 ) {
              error = { code: API_CODE.NODE_1005, result: resp.result };
            }
          }
          observer.next(error);
          observer.complete();
        });
      } else {
        this.printErrorLog('[API ERROR]', req, command, options, err);
        observer.next(error);
        observer.complete();
      }
    } else {
      this.printErrorLog('[API ERROR] Exception', req, command, options, err);
      // this.logger.error(this, '[API ERROR] Exception', err);
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
      if ( !FormatHelper.isEmpty(serverSession) ) {
        // 로그인 상태이고, 이전 request의 서버 세션과 response 서버 세션이 다를 경우는 오류 처리 한다.
        if ( req.session.serverSession !== serverSession && this.loginService.isLogin(req) ) {
          // this.logger.error(this, '[BE Session changed]', command.path, req.originalUrl
          //                   , '[ Before : ' + req.session.serverSession + ' ]'
          //                   , '[ After : ' + serverSession + ' ]'
          //                   , req.session.svcInfo);

          return Observable.of({
            code: API_CODE.NODE_1005,
            result: {
              commandPath: command.path,
              preServerSession: req.session.serverSession,
              curServerSession: serverSession,
              url: this.loginService.getPath(req),
              point: 'SERVER_API_RES',
              target: this.loginService.getPath(req)
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
            this.loginService.setNoticeType(this.req, resp.result.noticeTypCd || '')
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

          // this.loginService.clearXtCookie(this.res);
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, curSvcInfo),
            this.loginService.setAllSvcInfo(this.req, this.res, resp.result),
            this.request(API_CMD.BFF_08_0080, {
              mbrChlId: resp.result.mbrChlId,
              svcMgmtNum: resp.result.svcMgmtNum
            })
          );
        } else {
          // return Observable.combineLatest(
          //   this.loginService.setSvcInfo(this.req, this.res, null),
          //   this.loginService.setAllSvcInfo(this.req, this.res, null));
          throw resp;
        }
      })
      .switchMap(([select, all, ageResp]) => {
        const curSvcInfo = {
          age: 0,
          isAdult: false
        };
        if ( ageResp ) {
          if ( ageResp.code === API_CODE.CODE_00 ) {
            curSvcInfo.age = ageResp.result.age ? parseInt(ageResp.result.age, 10) : 0;
            curSvcInfo.isAdult = ageResp.result.age && parseInt(ageResp.result.age, 10) >= 19;
          }
        }
        return this.loginService.setSvcInfo(this.req, this.res, curSvcInfo);
      })
      .switchMap(() => this.request(API_CMD.BFF_01_0040, {}))
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          // return this.loginService.setChildInfo(this.req, this.res, resp.result);
          // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대(세션에 등록 자녀회선 수 추가)
          const expsSvcCnt = FormatHelper.isNumber(this.req.session.svcInfo.expsSvcCnt) ? this.req.session.svcInfo.expsSvcCnt : 0;
          const childSvcCnt = FormatHelper.isEmpty(resp.result) ? 0 : resp.result.length;
          const selectableExpsSvcCnt = parseInt(expsSvcCnt, 10) + parseInt(childSvcCnt, 10);

          const curSvcInfo = {
            childSvcCnt: childSvcCnt + '',
            selectableExpsSvcCnt: selectableExpsSvcCnt + ''
          };
          Object.assign(curSvcInfo, this.req.session.svcInfo);
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, curSvcInfo),
            this.loginService.setChildInfo(this.req, this.res, resp.result));
        } else {
          // return this.loginService.setChildInfo(this.req, this.res, null);
          throw resp;
        }
      })
      // OP002-6700 : [FE] Session 오류 디버깅을 위한 로그 추가-1
      .switchMap((resp) => this.loginService.setLoginHistory(this.req))
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

          // this.loginService.clearXtCookie(this.res);
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, curSvcInfo),
            this.request(API_CMD.BFF_08_0080, {
              mbrChlId: resp.result.mbrChlId,
              svcMgmtNum: resp.result.svcMgmtNum
            })
          );
        } else {
          // return this.loginService.setSvcInfo(this.req, this.res, null);
          throw resp;
        }
      })
      .switchMap(([resp, ageResp]) => {
        const curSvcInfo = {
          age: 0,
          isAdult: false
        };
        if ( ageResp ) {
          if ( ageResp.code === API_CODE.CODE_00 ) {
            curSvcInfo.age = ageResp.result.age ? parseInt(ageResp.result.age, 10) : 0;
            curSvcInfo.isAdult = ageResp.result.age && parseInt(ageResp.result.age, 10) >= 19;
          }
        }
        return this.loginService.setSvcInfo(this.req, this.res, curSvcInfo);
      })
      .switchMap(() => this.request(API_CMD.BFF_01_0002, {}))
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
          // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대(세션에 등록 자녀회선 수 추가)
          // const expsSvcCnt = FormatHelper.isNumber(this.req.session.svcInfo.expsSvcCnt) ? this.req.session.svcInfo.expsSvcCnt : 0;
          // const childSvcCnt = FormatHelper.isEmpty(resp.result) ? 0 : resp.result.length;
          // const selectableExpsSvcCnt = parseInt(expsSvcCnt, 10) + parseInt(childSvcCnt, 10);

          // const curSvcInfo = {
          //   childSvcCnt: childSvcCnt + '',
          //   selectableExpsSvcCnt: selectableExpsSvcCnt + ''
          // };
          // Object.assign(curSvcInfo, this.req.session.svcInfo);
          // return Observable.combineLatest(
          //   this.loginService.setSvcInfo(this.req, this.res, curSvcInfo),
          //   this.loginService.setChildInfo(this.req, this.res, resp.result));
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
   * 로밍 중인 경우 roamingYn, mCntrCd 값을 params 딕셔너리에 채움
   * @param params
   */
  private fillRoamingProperties(params: any) {
    if ( this.req ) {
      const roamMcc = this.req.cookies['ROAMING_MCC'];
      if ( roamMcc && roamMcc !== '450' && roamMcc.length > 1 ) {
        params.roamingYn = 'Y';
        params.mCntrCd = roamMcc;
      } else {
        params.roamingYn = 'N';
      }
    }
  }

  /**
   * TID 토큰을 이용한 로그인 요청
   * @param token
   * @param state
   */
  public requestLoginTid(params: any): Observable<any> {
    // const params = {token,state,roamingYn:"1",mCntrCd:"2",globalYn:"3"};
    this.fillRoamingProperties(params);
    return this.requestLogin(API_CMD.BFF_03_0008, params, LOGIN_TYPE.TID);
  }

  /**
   * 고객보호비밀번호 로그인 요청
   * @param params
   */
  public requestLoginSvcPassword(params: any): Observable<any> {
    this.fillRoamingProperties(params);
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
    this.fillRoamingProperties(params);
    return this.requestSLogin(API_CMD.BFF_03_0017, params, LOGIN_TYPE.EASY);
  }

  /**
   * IOS 간편로그인 요청
   * @param params
   */
  public requestEasyLoginIos(params): Observable<any> {
    this.fillRoamingProperties(params);
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
      })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, resp.result),
            this.request(API_CMD.BFF_08_0080, {
              mbrChlId: resp.result.mbrChlId,
              svcMgmtNum: resp.result.svcMgmtNum
            })
          );
        } else {
          throw resp;
        }
      })
      .switchMap(([selectResp, ageResp]) => {
        const curSvcInfo = {
          age: 0,
          isAdult: false
        };
        if ( ageResp ) {
          if ( ageResp.code === API_CODE.CODE_00 ) {
            curSvcInfo.age = ageResp.result.age ? parseInt(ageResp.result.age, 10) : 0;
            curSvcInfo.isAdult = ageResp.result.age && parseInt(ageResp.result.age, 10) >= 19;
          }
        }
        return this.loginService.setSvcInfo(this.req, this.res, curSvcInfo);
      })
      .map(() => {
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
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, resp.result),
            this.request(API_CMD.BFF_08_0080, {
              mbrChlId: resp.result.mbrChlId,
              svcMgmtNum: resp.result.svcMgmtNum
            })
          );
        } else if ( resp.code === 'BFF0030' ) {
          const svcInfo = this.loginService.getSvcInfo(this.req);
          // 결과 동일한 구조로 하기 위해 combineLatest 사용
          return Observable.combineLatest(
            this.loginService.setSvcInfo(this.req, this.res, new SvcInfoModel({
                mbrNm: svcInfo.mbrNm,
                // noticeType: svcInfo.noticeType,
                twdAdRcvAgreeYn: svcInfo.twdAdRcvAgreeYn,
                twdInfoRcvAgreeYn: svcInfo.twdInfoRcvAgreeYn,
                twdLocUseAgreeYn: svcInfo.twdLocUseAgreeYn,
                tplaceUseAgreeYn: svcInfo.tplaceUseAgreeYn,
                loginType: svcInfo.loginType
              })
            ));
        } else {
          throw resp;
        }
      })
      .switchMap(([selectResp, ageResp]) => {
        const curSvcInfo = {
          age: 0,
          isAdult: false
        };
        if ( ageResp ) {
          if ( ageResp.code === API_CODE.CODE_00 ) {
            curSvcInfo.age = ageResp.result.age ? parseInt(ageResp.result.age, 10) : 0;
            curSvcInfo.isAdult = ageResp.result.age && parseInt(ageResp.result.age, 10) >= 19;
          }
        }
        return this.loginService.setSvcInfo(this.req, this.res, curSvcInfo);
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
    // expire 요청이 여러번 요청 되는 문제 오류 수정
    const matchingInfo = resp.result.target.match(/\/common\/member\/logout\/expire/ig);
    if ( !matchingInfo || matchingInfo.length < 1 ) {
      const params = 'sess_invalid=Y'
        + '&pre_server_se=' + resp.result.preServerSession
        + '&cur_server_se=' + resp.result.curServerSession
        + '&url=' + resp.result.url
        + '&command_path=' + resp.result.commandPath
        + '&point=' + resp.result.point
        + '&target=' + resp.result.target;

      return res.redirect('/common/member/logout/expire?' + params);
    }
    return false;
  }

  /**
   * API 오류 발생시 오류 출력
   */
  private printErrorLog(prefix: string, req: any, command: any, options: any, error?: any) {

    try {
      const svcInfo = FormatHelper.isEmpty(req.session) ? {} : (req.session.svcInfo || {});
      let referer = '';

      if ( !FormatHelper.isEmpty(req.baseUrl)
        && (req.baseUrl.indexOf('bypass') !== -1 || req.baseUrl.indexOf('native') !== -1 || req.baseUrl.indexOf('store') !== -1) ) {
        referer = this.loginService.getReferer(req);
      }

      const baseUrl = FormatHelper.isEmpty(referer) ? this.loginService.getFullPath(req) : req.baseUrl;
      const device = BrowserHelper.isApp(req) ? (BrowserHelper.isAndroid(req) ? 'A' : (BrowserHelper.isIos(req) ? 'I' : 'N')) : 'W';
      const userInfo = { device: device };
      Object.assign(userInfo, FormatHelper.isEmpty(svcInfo) ? {} : {
        userId: svcInfo.userId || '',
        loginType: svcInfo.loginType || '',
        svcMgmtNum: svcInfo.svcMgmtNum || '',
        mbrChlId: svcInfo.mbrChlId || '',
      });
      error = FormatHelper.isEmpty(error) ? {} : error;

      /**
       * 식별자
       * 오류코드
       * API를 호출한 URL
       * referer(서버에서의 호출은 공백)
       * API Path
       * API options
       * 사용자 정보(사용자ID, 로그인 type, 서비스관리번호, 멤버채널ID, 접속방식)
       * error
       */
      this.logger.error(this,
        prefix,
        '\n code :', error.code || '',
        '\n base url :', baseUrl,
        '\n referer :', referer,
        '\n command.path :', FormatHelper.isEmpty(command) ? {} : (command.path || ''),
        '\n options :', options,
        '\n userInfo: ', userInfo,
        '\n error: ', error
      );
    } catch ( err ) {
      this.logger.error(this, 'Fail to write API error log');
    }
  }
}

export default ApiService;
