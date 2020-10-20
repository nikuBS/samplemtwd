import FormatHelper from '../utils_en/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models_en/svc-info.model';
import { Observable } from 'rxjs/Observable';
import { BUILD_TYPE, COOKIE_KEY} from '../types_en/common.type';
import { XTRACTOR_KEY } from '../types_en/config.type';
import EnvHelper from '../utils_en/env.helper';
import CryptoHelper from '../utils_en/crypto.helper';
import BrowserHelper from '../utils_en/browser.helper';
import DateHelper from '../utils_en/date.helper';
import CommonHelper from '../utils_en/common.helper';
import { API_CODE } from '../types_en/api-command.type';
import RedisService from '../services_en/redis.service';
import {REDIS_KEY} from '../types_en/redis.type';

/**
 * 세션정보를 다루는 service
 */
class LoginService {
  static instance;
  private logger = new LoggerService();
  private redisService: RedisService;

  constructor() {
    this.redisService = RedisService.getInstance();
  }

  /**
   * 신규 세션 생성
   * @param req
   */
  public sessionGenerate(req, res): Observable<any> {
    return Observable.create((observer) => {
      req.session.regenerate((error) => {

        res.clearCookie(COOKIE_KEY.TWM_LOGIN);
        CommonHelper.clearCookieWithPreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
        this.clearXtCookie(res);

        this.logger.info(this, '[Session Generate]', error);
        observer.next();
        observer.complete();
      });
    });
  }

  /**
   * 세션 아이디 조회
   * @param req
   */
  public getSessionId(req) {
    return req.session.id;
  }

  /**
   * 로그인 여부 조회
   * @param req
   */
  public isLogin(req): boolean {
    if ( !FormatHelper.isEmpty(req.session) ) {
      return !FormatHelper.isEmpty(req.session.svcInfo) && !FormatHelper.isEmpty(req.session.serverSession);
    }
    return false;
  }

  /**
   * 쿠키 저장
   * @param res
   * @param key
   * @param value
   */
  public setCookie(res, key: string, value: string) {
    res.cookie(key, value);
  }

  /**
   * 쿠키 조회
   * @param req
   * @param key
   */
  public getCookie(req, key: string) {
    return req.cookies[key];
  }


  /**
   * 선택회선 정보 조회
   * @param req
   */
  public getSvcInfo(req): any {
    const request = req; // || this.request;
    // this.logger.debug(this, '[getSvcInfo]', request.session);
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.svcInfo) ) {
      this.logger.debug(this, '[en/getSvcInfo]', request.session.svcInfo);
      let result = null;
      try {
        result = JSON.parse(JSON.stringify(request.session.svcInfo));
      } catch ( e ) {
        this.logger.error(this, '[en/getSvcInfo] JSON parse Error');
      }
      return result;
    }
    return null;
  }

  /**
   * 선택회선 업데이트
   * @param req
   * @param res
   * @param svcInfo
   */
  public setSvcInfo(req, res, svcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      res.cookie(COOKIE_KEY.TWM_LOGIN, 'Y');

      if ( FormatHelper.isEmpty(req.session.svcInfo) ) {
        req.session.svcInfo = new SvcInfoModel(svcInfo);
      } else {
        Object.assign(req.session.svcInfo, svcInfo);
      }
      this.setXtractorCookie(req, res, svcInfo);

      req.session.save((err) => {
        this.logger.debug(this, '[en/setSvcInfo]', req.session.svcInfo);

        // OP002-6700 : [FE] Session 오류 디버깅을 위한 로그 추가-1
        if ( !FormatHelper.isEmpty(err) ) {
          this.logger.error(this, '[en/OP002-6700 setSvcInfo]', req.path, req.session.svcInfo.userId, req.session.cookie, err);
        }
        observer.next(req.session.svcInfo);
        observer.complete();
      });
    });
  }

  /**
   *
   * @param res
   */
  public clearXtCookie(res): any {
    res.clearCookie(COOKIE_KEY.XTLID);
    // XTUID 초기화 추가
    res.clearCookie(COOKIE_KEY.XTUID);
    res.clearCookie(COOKIE_KEY.XTLOGINID);
    res.clearCookie(COOKIE_KEY.XTLOGINTYPE);
    res.clearCookie(COOKIE_KEY.XTSVCGR);
    res.clearCookie(COOKIE_KEY.XT_LOGIN_LOG);
  }

  /**
   *
   * @param req
   * @param res
   * @param svcInfo
   */
  private setXtractorCookie(req, res, svcInfo: any): any {
    if ( FormatHelper.isEmpty(req.session.svcInfo) ) {
      return;
    }
    

    const currentXtInfo = req.session.svcInfo.xtInfo || {},
      xtInfo: any = {};

    // 현재 선택된 회선이 기준회선일 경우만 변경한다.
    // if ( FormatHelper.isEmpty(currentXtInfo.XTLID) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
    if ( !FormatHelper.isEmpty(svcInfo.svcMgmtNum) && svcInfo.repSvcYn === 'Y') {
      xtInfo.XTLID = CryptoHelper.encrypt(svcInfo.svcMgmtNum, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
      res.cookie(COOKIE_KEY.XTLID, xtInfo.XTLID);
    }

    // 현재 선택된 회선
    // if ( !FormatHelper.isEmpty(currentXtInfo.XTLID) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
    if ( !FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
      xtInfo.XTUID = CryptoHelper.encrypt(svcInfo.svcMgmtNum, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
      res.cookie(COOKIE_KEY.XTUID, xtInfo.XTUID);
    }

    // 간편로그인인 경우 XTLOGINID 에 서비스관리번호를 SET 해준다. 
    // (간편로그인시 svcInfo.userId 가 null)
    if ( !FormatHelper.isEmpty(req.session.svcInfo.loginType) && req.session.svcInfo.loginType === 'S') { 
      if ( FormatHelper.isEmpty(currentXtInfo.XTLOGINID) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
        xtInfo.XTLOGINID = CryptoHelper.encrypt(svcInfo.svcMgmtNum, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
        res.cookie(COOKIE_KEY.XTLOGINID, xtInfo.XTLOGINID);
      }
    } else {  // 간편로그인이 아닌 경우
      if ( FormatHelper.isEmpty(currentXtInfo.XTLOGINID) && !FormatHelper.isEmpty(svcInfo.userId) ) {
        xtInfo.XTLOGINID = CryptoHelper.encrypt(svcInfo.userId, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
        res.cookie(COOKIE_KEY.XTLOGINID, xtInfo.XTLOGINID);
      }
    }    

    if ( FormatHelper.isEmpty(currentXtInfo.XTSVCGR) && !FormatHelper.isEmpty(svcInfo.svcGr) ) {
      xtInfo.XTSVCGR = svcInfo.svcGr;
      res.cookie(COOKIE_KEY.XTSVCGR, xtInfo.XTSVCGR);
    }

    req.session.svcInfo.xtInfo = Object.assign(currentXtInfo , xtInfo);
    // req.session.svcInfo.xtInfo = xtInfo;
  }

  /**
   * 전체회선 정보 조회
   * @param req
   */
  public getAllSvcInfo(req): any {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.allSvcInfo) ) {
      this.logger.debug(this, '[getAllSvcInfo]', request.session.allSvcInfo);
      let result = null;
      try {
        result = JSON.parse(JSON.stringify(request.session.allSvcInfo));
      } catch ( e ) {
        this.logger.error(this, '[getAllSvcInfo] JSON parse Error');
      }
      return result;
    }
    return null;
  }

  /**
   * 전체회선 업데이트
   * @param req
   * @param res
   * @param allSvcInfo
   */
  public setAllSvcInfo(req, res, allSvcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      req.session.allSvcInfo = allSvcInfo;
      req.session.save((err) => {
        this.logger.debug(this, '[setAllSvcInfo]', req.session.allSvcInfo);

        // OP002-6700 : [FE] Session 오류 디버깅을 위한 로그 추가-1
        if ( !FormatHelper.isEmpty(err) ) {
          this.logger.error(this, '[OP002-6700 setAllSvcInfo]', req.path, req.session.svcInfo.userId, req.session.cookie, err);
        }

        observer.next(req.session.allSvcInfo);
        observer.complete();
      });
    });
  }

  /**
   * 자녀회선 정보 조회
   * @param req
   */
  public getChildInfo(req): any {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.childInfo) ) {
      this.logger.debug(this, '[getChildInfo]', request.session.childInfo);
      let result = null;
      try {
        result = JSON.parse(JSON.stringify(request.session.childInfo));
      } catch ( e ) {
        this.logger.error(this, '[getChildInfo] JSON parse Error');
      }
      return result;
    }
    return null;
  }

  /**
   * 자녀회선 업데이트
   * @param req
   * @param res
   * @param childInfo
   */
  public setChildInfo(req, res, childInfo: any): Observable<any> {
    return Observable.create((observer) => {
      req.session.childInfo = childInfo;
      req.session.save((err) => {
        this.logger.debug(this, '[setChildInfo]', req.session.childInfo);

        // OP002-6700 : [FE] Session 오류 디버깅을 위한 로그 추가-1
        if ( !FormatHelper.isEmpty(err) ) {
          this.logger.error(this, '[OP002-6700 setChildInfo]', req.path, req.session.svcInfo.userId, req.session.cookie, err);
        }
        observer.next(req.session.childInfo);
        observer.complete();
      });
    });
  }

  /**
   * BFF 서버 세션 조회
   * @param req
   */
  public getServerSession(req): string {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.serverSession) ) {
      this.logger.debug(this, '[getServerSession]', req.cookies[COOKIE_KEY.TWM], req.session.serverSession);
      return req.session.serverSession;
    }
    return '';
  }

  /**
   * BFF 서버 세션 업데이트
   * @param req
   * @param res
   * @param serverSession
   */
  public setServerSession(req, res, serverSession: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) && !FormatHelper.isEmpty(req.session) ) {
        req.session.serverSession = serverSession;
        req.session.save(() => {
          this.logger.debug(this, '[setServerSession]', req.session);
          observer.next({code : API_CODE.CODE_00, serverSession : req.session.serverSession});
          observer.complete();
        });
      }
    });
  }

  /**
   * 채널 정보 업데이트
   * @param req
   * @param channel
   */
  public setChannel(req, channel: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) && !FormatHelper.isEmpty(req.session) ) {
        req.session.channel = channel;
        req.session.save(() => {
          this.logger.debug(this, '[setChannel]', req.session);
          observer.next(req.session.channel);
          observer.complete();
        });
      }
    });
  }

  /**
   * 채널 정보 조회
   * @param req
   */
  public getChannel(req): string {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.channel) ) {
      return req.session.channel;
    }
    return req.cookies[COOKIE_KEY.CHANNEL];
  }

  /**
   * 마스킹 해제 여부 업데이트
   * @param req
   * @param svcMgmtNum
   */
  public setMaskingCert(req, svcMgmtNum: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) ) {
        if ( FormatHelper.isEmpty(req.session.masking) ) {
          req.session.masking = [];
        }
        req.session.masking.push(svcMgmtNum);
        req.session.save(() => {
          this.logger.debug(this, '[setMaskingCert]', req.session);
          observer.next(req.session.masking);
          observer.complete();
        });
      }
    });
  }

  /**
   * 마스킹 해제 정보 조회
   * @param req
   * @param svcMgmtNum
   */
  public getMaskingCert(req, svcMgmtNum: string): boolean {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.masking) ) {
      return req.session.masking.indexOf(svcMgmtNum) !== -1;
    }
    return false;
  }

  /**
   * NoticeType 업데이트
   * @param req
   * @param noticeType
   */
  public setNoticeType(req, noticeType: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) && !FormatHelper.isEmpty(req.session) ) {
        if ( FormatHelper.isEmpty(req.session.noticeType) ) {
          req.session.noticeType = '';
        }
        req.session.noticeType = noticeType;

        // req.session undefined 오류 분석용 log (req.session deep copy)
        let unsavedSession = Object.assign({}, req.session);

        req.session.save((err) => {
          // err 값이 return 되는 case
          if ( !FormatHelper.isEmpty(err) ) {
            // this.logger.error(this, '[OP002-3955] - CASE01', req.path, err);

            // OP002-6700 : [FE] Session 오류 디버깅을 위한 로그 추가-1
            this.logger.error(this, '[OP002-6700 setNoticeType]', req.path, req.session.svcInfo.userId, req.session.cookie, err);
          }

          // save 후 session 값이 달라지는 case
          let beforeSaveStr = JSON.stringify(unsavedSession);
          let afterSaveStr: any = JSON.stringify(req.session);
          if ( beforeSaveStr !== afterSaveStr ) {
            this.logger.error(this, '[OP002-3955] - CASE02', '[BEFORE]' + beforeSaveStr, '[AFTER]' + afterSaveStr);
          }

          this.logger.debug(this, '[setNoticeType]', req.session);
          if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.noticeType) ) {
            observer.next(req.session.noticeType);
          } else {
            observer.next({});
          }
          observer.complete();
        });
      }
    });
  }

  /**
   * NoticeType 정보 조회
   * @param req
   */
  public getNoticeType(req): string {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.noticeType) ) {
      return req.session.noticeType;
    }
    return '';
  }

  /**
   * 세션 캐싱 API 업데이트
   * @param req
   * @param command
   * @param svcMgmtNum
   * @param result
   */
  public setSessionStore(req, command: string, svcMgmtNum: string, result: any): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) ) {
        if ( FormatHelper.isEmpty(req.session.store) ) {
          req.session.store = {};
        }
        if ( FormatHelper.isEmpty(req.session.store[svcMgmtNum]) ) {
          req.session.store[svcMgmtNum] = {};
        }
        if ( FormatHelper.isEmpty(req.session.store[svcMgmtNum][command]) ) {
          req.session.store[svcMgmtNum][command] = {};
        }
        req.session.store[svcMgmtNum][command] = {
          data: result,
          expired: DateHelper.add5min(new Date())
        };
        req.session.save(() => {
          this.logger.debug(this, '[setSessionStore]', req.session.store);
          observer.next(req.session.store[svcMgmtNum][command]);
          observer.complete();
        });
      }
    });
  }

  /**
   * 세션 캐싱 API 삭제
   * @param req
   * @param svcMgmtNum
   */
  public clearSessionStore(req, svcMgmtNum: string, apiId?: any): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) ) {
        if ( !FormatHelper.isEmpty(req.session.store) && !FormatHelper.isEmpty(req.session.store[svcMgmtNum]) ) {
          if ( !FormatHelper.isEmpty(apiId)) {
            const idx = Object.keys(req.session.store[svcMgmtNum] || {}).indexOf( apiId );
            if ( idx > -1 ) {
              req.session.store[svcMgmtNum][ apiId ] = {};
            }
          } else {
            req.session.store[svcMgmtNum] = {};
          }
          req.session.save(() => {
            this.logger.debug(this, '[clearSessionStore]', req.session.store);
            observer.next(req.session.store[svcMgmtNum]);
            observer.complete();
          });
        } else {
          observer.next({});
          observer.complete();
        }
      } else {
        observer.next({});
        observer.complete();
      }
    });
  }

  /**
   * 세션 캐싱 API 조회
   * @param req
   * @param command
   * @param svcMgmtNum
   */
  public getSessionStore(req, command: string, svcMgmtNum: string): any {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.store) &&
      !FormatHelper.isEmpty(req.session.store[svcMgmtNum]) && !FormatHelper.isEmpty(req.session.store[svcMgmtNum][command]) ) {
      this.logger.debug(this, '[getSessionStore]', req.session.store[svcMgmtNum][command]);
      let result = null;
      try {
        result = JSON.parse(JSON.stringify(req.session.store[svcMgmtNum][command]));
      } catch ( e ) {
        this.logger.error(this, '[getSessionStore] JSON parse Error');
      }
      return result;
    }
    return null;
  }

  /**
   * 세션 로그아웃
   * @param req
   * @param res
   */
  public logoutSession(req, res): Observable<any> {
    return Observable.create((observer) => {
      req.session.destroy((error) => {
        this.logger.debug(this, '[logoutSession]', req.session, error);
        res.clearCookie(COOKIE_KEY.TWM);
        res.clearCookie(COOKIE_KEY.TWM_LOGIN);
        CommonHelper.clearCookieWithPreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
        // 로그아웃 시 xtractor cookie 초기화
        this.clearXtCookie(res);
        observer.next();
        observer.complete();
      });
    });
  }

  /**
   * 디바이스 정보 조회
   * @param req
   */
  public getDevice(req): string {
    const userAgent = this.getUserAgent(req);
    if ( /TWM_DEVICE/.test(userAgent) ) {
      return userAgent.split(COOKIE_KEY.DEVICE + '=')[1];
    }
    return '';
  }

  /**
   * IP 조회
   * @param req
   */
  public getNodeIp(req): string {
    const request = req;
    if ( !FormatHelper.isEmpty(request) ) {
      const ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        (request.connection.socket ? request.connection.socket.remoteAddress : '');
      return ip;
    }
    return '';
  }

  /**
   * URL 조회
   * @param req
   */
  public getPath(req: any): string {
    const request = req; // || this.request;
    let path = this.getFullPath(request);
    if ( path.indexOf('?') !== -1 ) {
      path = path.split('?')[0];
    }
    if (path.startsWith('/en/product/roaming')) {
      path = '/en/product/roaming';
    }
    //이준엽임시
    path = path.replace('/en/','/');
    return path;
  }

  /**
   * Full URL 조회
   * @param req
   */
  public getFullPath(req: any): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) && !FormatHelper.isEmpty(request.baseUrl) ){
      const baseUrl = request.baseUrl;
      if ( baseUrl.indexOf('bypass') !== -1 || baseUrl.indexOf('api') !== -1 ||
        baseUrl.indexOf('native') !== -1 || baseUrl.indexOf('store') !== -1 ) {
        return this.getReferer(request);
      } else {
        return baseUrl + request.url;
      }
    }
    return '';
  }

  /**
   * referer 조회
   * @param req
   */
  public getReferer(req: any): string {
    const request = req; // || this.request;
    const referer = request.headers.referer;
    if ( !FormatHelper.isEmpty(referer) ) {
      const path = (request.headers.referer).match(/(https?...)?([^\/]+)(.*)/)[3];
      return path;
    } else {
      return '';
    }
  }

  /**
   * DNS 조회
   * @param req
   */
  public getDns(req: any): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      return request.headers.host;
    }
    return '';
  }

  /**
   * protocol 조회
   * @param req
   */
  public getProtocol(req: any): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      return request.protocol + '://';
    }
    return 'https://';
  }

  /**
   * green 모드 확인
   * @param req
   */
  public isGreen(req): string {
    const dns = this.getDns(req);

    if ( dns === EnvHelper.getEnvironment('DOMAIN_GAPP') || dns === EnvHelper.getEnvironment('DOMAIN_GWEB') ) {
      return BUILD_TYPE.GREEN;
    }
    return '';
  }

  /**
   * user agent 조회
   * @param req
   */
  public getUserAgent(req): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      return request.headers['user-agent'];
    }
    return '';
  }

  /***
   * 로그인 시 오류 발생시 오류 출력
   */
  public printLoginErrorLog(context, prefix: string, req: any, res: any, params?: any, error?: any) {

    try {
      const svcInfo = FormatHelper.isEmpty(req.session) ? {} : (req.session.svcInfo || {});
      let referer = '';

      if ( !FormatHelper.isEmpty(req.baseUrl)
          && (req.baseUrl.indexOf('bypass') !== -1 || req.baseUrl.indexOf('native') !== -1 
              || req.baseUrl.indexOf('store') !== -1 || req.baseUrl.indexOf('api') !== -1) ) {  
        referer = this.getReferer(req);
      }

      const device = BrowserHelper.isApp(req) ? (BrowserHelper.isAndroid(req) ? 'A' : (BrowserHelper.isIos(req) ? 'I' : 'N')) : 'W';
      const baseUrl = FormatHelper.isEmpty(referer) ? this.getFullPath(req) : req.baseUrl;
      error = FormatHelper.isEmpty(error) ? {} : error;

      /**
       * 식별자
       * 오류코드
       * API를 호출한 URL(서버에서의 호출은 제외)
       * 호출한 URL
       * referer(서버에서의 호출은 공백)
       * parameters
       * 접속 방식
       * error
       */
      this.logger.error(context, 
        prefix,
        '\n code :', error.code || '', 
        '\n base url :', baseUrl, 
        '\n referer :', referer, 
        '\n params :', params, 
        '\n device: ', device,
        '\n error: ', error
      );
    } catch (err) {
      this.logger.error(context, 'Fail to write login fail log');
    }
  }

  /**
   * 현재 session으로 로그인 된 이력을 저장한다.
   * @param req
   * @param svcMgmtNum
   */
  public setLoginHistory(req): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) ) {
        if ( FormatHelper.isEmpty(req.session.loginHst) ) {
          req.session.loginHst = [];
        }

        this.redisService.getTTL(REDIS_KEY.SESSION + this.getSessionId(req))
        .subscribe((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
            req.session.loginHst.push({
              seq: req.session.loginHst.length + 1,
              oldExpires: req.session.cookie.expires,
              timestamp : new Date(),
              ttl: resp.result
            });

            req.session.save((err) => {
              this.logger.debug(this, '[setLoginHistory]', req.session);

              if ( !FormatHelper.isEmpty(err) ) {
                this.logger.error(this, '[OP002-6700 setLoginHistory]', req.path, req.session.svcInfo.userId, req.session.cookie, err);
              }

              observer.next(req.session.masking);
              observer.complete();
            });
          } else {
            observer.next({});
            observer.complete();
          }
        });
      }
    });
  }
}

export default LoginService;
