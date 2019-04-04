import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';
import { BUILD_TYPE, COOKIE_KEY } from '../types/common.type';
import { XTRACTOR_KEY } from '../types/config.type';
import EnvHelper from '../utils/env.helper';
import CryptoHelper from '../utils/crypto.helper';
import BrowserHelper from '../utils/browser.helper';
import DateHelper from '../utils/date.helper';

class LoginService {
  static instance;
  private logger = new LoggerService();

  constructor() {
  }

  public sessionGenerate(req): Observable<any> {
    return Observable.create((observer) => {
      req.session.regenerate((error) => {
        this.logger.info(this, '[Session Generate]', error);
        observer.next();
        observer.complete();
      });
    });
  }

  public getSessionId(req) {
    return req.session.id;
  }

  public isLogin(req): boolean {
    if ( !FormatHelper.isEmpty(req.session) ) {
      return !FormatHelper.isEmpty(req.session.svcInfo) && !FormatHelper.isEmpty(req.session.serverSession);
    }
    return false;
  }

  public setCookie(res, key: string, value: string) {
    res.cookie(key, value);
  }

  public getCookie(req, key: string) {
    return req.cookies[key];
  }


  public getSvcInfo(req): any {
    const request = req; // || this.request;
    // this.logger.debug(this, '[getSvcInfo]', request.session);
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.svcInfo) ) {
      this.logger.debug(this, '[getSvcInfo]', request.session.svcInfo);
      let result = null;
      try {
        result = JSON.parse(JSON.stringify(request.session.svcInfo));
      } catch ( e ) {
        this.logger.error(this, '[getSvcInfo] JSON parse Error');
      }
      return result;
    }
    return null;
  }

  public setSvcInfo(req, res, svcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      res.cookie(COOKIE_KEY.TWM_LOGIN, 'Y');
      this.setXtractorCookie(req, res, svcInfo);

      if ( FormatHelper.isEmpty(req.session.svcInfo) ) {
        req.session.svcInfo = new SvcInfoModel(svcInfo);
      } else {
        Object.assign(req.session.svcInfo, svcInfo);
      }
      req.session.save(() => {
        this.logger.debug(this, '[setSvcInfo]', req.session.svcInfo);
        observer.next(req.session.svcInfo);
        observer.complete();
      });
    });
  }

  public clearXtCookie(res): any {
    res.clearCookie(COOKIE_KEY.XTLID);
    res.clearCookie(COOKIE_KEY.XTLOGINID);
    res.clearCookie(COOKIE_KEY.XTLOGINTYPE);
    res.clearCookie(COOKIE_KEY.XTSVCGR);
  }

  private setXtractorCookie(req, res, svcInfo: any): any {
    if ( FormatHelper.isEmpty(req.session.svcInfo) ) {
      return;
    }

    const currentXtInfo = req.session.svcInfo.xtInfo || {},
      xtInfo: any = {};

    if ( FormatHelper.isEmpty(currentXtInfo.XTLID) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
      xtInfo.XTLID = CryptoHelper.encrypt(svcInfo.svcMgmtNum, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
      res.cookie(COOKIE_KEY.XTLID, xtInfo.XTLID);
    }

    if ( !FormatHelper.isEmpty(currentXtInfo.XTLID) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
      xtInfo.XTUID = CryptoHelper.encrypt(svcInfo.svcMgmtNum, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
      res.cookie(COOKIE_KEY.XTUID, xtInfo.XTUID);
    }

    if ( FormatHelper.isEmpty(currentXtInfo.XTLOGINID) && !FormatHelper.isEmpty(svcInfo.userId) ) {
      xtInfo.XTLOGINID = CryptoHelper.encrypt(svcInfo.userId, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB);
      res.cookie(COOKIE_KEY.XTLOGINID, xtInfo.XTLOGINID);
    }

    if ( FormatHelper.isEmpty(currentXtInfo.XTSVCGR) && !FormatHelper.isEmpty(svcInfo.svcGr) ) {
      xtInfo.XTSVCGR = svcInfo.svcGr;
    }

    req.session.svcInfo.xtInfo = xtInfo;
  }

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

  public setAllSvcInfo(req, res, allSvcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      req.session.allSvcInfo = allSvcInfo;
      req.session.save(() => {
        this.logger.debug(this, '[setAllSvcInfo]', req.session.allSvcInfo);
        observer.next(req.session.allSvcInfo);
        observer.complete();
      });
    });
  }

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

  public setChildInfo(req, res, childInfo: any): Observable<any> {
    return Observable.create((observer) => {
      req.session.childInfo = childInfo;
      req.session.save(() => {
        this.logger.debug(this, '[setChildInfo]', req.session.childInfo);
        observer.next(req.session.childInfo);
        observer.complete();
      });
    });
  }

  public getServerSession(req): string {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.serverSession) ) {
      this.logger.debug(this, '[getServerSession]', req.cookies[COOKIE_KEY.TWM], req.session.serverSession);
      return req.session.serverSession;
    }
    return '';
  }

  public setServerSession(req, res, serverSession: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) && !FormatHelper.isEmpty(req.session) ) {
        req.session.serverSession = serverSession;
        req.session.save(() => {
          this.logger.debug(this, '[setServerSession]', req.session);
          observer.next(req.session.serverSession);
          observer.complete();
        });
      }
    });
  }

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

  public getChannel(req): string {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.channel) ) {
      return req.session.channel;
    }
    return req.cookies[COOKIE_KEY.CHANNEL];
  }

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

  public getMaskingCert(req, svcMgmtNum: string): boolean {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.masking) ) {
      return req.session.masking.indexOf(svcMgmtNum) !== -1;
    }
    return false;
  }

  public setNoticeType(req, noticeType: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) ) {
        if ( FormatHelper.isEmpty(req.session.noticeType) ) {
          req.session.noticeType = '';
        }
        req.session.noticeType = noticeType;
        req.session.save(() => {
          this.logger.debug(this, '[setNoticeType]', req.session, req.session.noticeType);
          observer.next(req.session.noticeType);
          observer.complete();
        });
      }
    });
  }

  public getNoticeType(req): string {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.noticeType) ) {
      return req.session.noticeType;
    }
    return '';
  }

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

  public clearSessionStore(req, svcMgmtNum: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(req) ) {
        if ( !FormatHelper.isEmpty(req.session.store) && !FormatHelper.isEmpty(req.session.store[svcMgmtNum]) ) {
          req.session.store[svcMgmtNum] = {};
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

  public logoutSession(req, res): Observable<any> {
    return Observable.create((observer) => {
      req.session.destroy((error) => {
        this.logger.debug(this, '[logoutSession]', req.session, error);
        res.clearCookie(COOKIE_KEY.TWM);
        res.clearCookie(COOKIE_KEY.TWM_LOGIN);
        observer.next();
        observer.complete();
      });
    });
  }

  public getDevice(req): string {
    const userAgent = this.getUserAgent(req);
    if ( /TWM_DEVICE/.test(userAgent) ) {
      return userAgent.split(COOKIE_KEY.DEVICE + '=')[1];
    }
    return '';
  }

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

  public getPath(req: any): string {
    const request = req; // || this.request;
    let path = this.getFullPath(request);
    if ( path.indexOf('?') !== -1 ) {
      path = path.split('?')[0];
    }
    return path;
  }

  public getFullPath(req: any): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      const baseUrl = request.baseUrl;
      if ( baseUrl.indexOf('bypass') !== -1 || baseUrl.indexOf('api') !== -1 || baseUrl.indexOf('native') !== -1 ) {
        return this.getReferer(request);
      } else {
        return baseUrl + request.url;
      }
    }
    return '';
  }

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

  public getDns(req: any): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      return request.headers.host;
    }
    return '';
  }

  public getProtocol(req: any): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      return request.protocol + '://';
    }
    return 'https://';
  }

  public isGreen(req): string {
    const dns = this.getDns(req);

    if ( dns === EnvHelper.getEnvironment('DOMAIN_GAPP') || dns === EnvHelper.getEnvironment('DOMAIN_GWEB') ) {
      return BUILD_TYPE.GREEN;
    }
    return '';
  }

  public getUserAgent(req): string {
    const request = req; // || this.request;
    if ( !FormatHelper.isEmpty(request) ) {
      return request.headers['user-agent'];
    }
    return '';
  }
}

export default LoginService;
