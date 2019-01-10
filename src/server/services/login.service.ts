import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';
import { BUILD_TYPE, COOKIE_KEY } from '../types/common.type';
import { XTRACTOR_KEY } from '../types/config.type';
import EnvHelper from '../utils/env.helper';
import CryptoHelper from '../utils/crypto.helper';

class LoginService {
  static instance;
  private request;
  private response;
  private logger = new LoggerService();

  constructor() {
  }

  public setCurrentReq(req, res) {
    this.request = req;
    this.response = res;
    this.logger.info(this, '[setCurrentReq]', req.session, req.cookies[COOKIE_KEY.TWM], this.getSessionId(req), req.baseUrl + req.path);
    // console.log('[[[[[[cookie]]]]]]]', req.cookies[COOKIE_KEY.TWM], req.baseUrl + req.path);
    // console.log(req.session);
    // console.log(req.cookies);
    // console.log('[[[[[Session Id]]]]]', this.getSessionId(req));
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

  public isLogin(session): boolean {
    if ( !FormatHelper.isEmpty(session) ) {
      return !FormatHelper.isEmpty(session.svcInfo) && !FormatHelper.isEmpty(session.serverSession);
    }
    return false;
  }

  public isNewSession(): boolean {
    const prevUrl = this.request.headers.referer || '';
    const currentHost = this.request.hostname;

    return prevUrl.indexOf(currentHost) === -1;
  }


  public getSvcInfo(req?): any {
    const request = req || this.request;
    this.logger.debug(this, '[getSvcInfo]', request.session);
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.svcInfo) ) {
      this.logger.debug(this, '[getSvcInfo]', request.session.svcInfo);
      return request.session.svcInfo;
    }
    return null;
  }

  public setSvcInfo(svcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      this.response.cookie(COOKIE_KEY.TWM_LOGIN, 'Y');
      this.setXtractorCookie(svcInfo);

      if ( FormatHelper.isEmpty(this.request.session.svcInfo) ) {
        this.request.session.svcInfo = new SvcInfoModel(svcInfo);
      } else {
        Object.assign(this.request.session.svcInfo, svcInfo);
      }
      this.request.session.save(() => {
        this.logger.debug(this, '[setSvcInfo]', this.request.session.svcInfo);
        observer.next(this.request.session.svcInfo);
        observer.complete();
      });
    });
  }

  private setXtractorCookie(svcInfo: any): any {
    this.response.clearCookie(COOKIE_KEY.XTLID);
    this.response.clearCookie(COOKIE_KEY.XTLOGINID);
    this.response.clearCookie(COOKIE_KEY.XTLOGINTYPE);

    if (!FormatHelper.isEmpty(svcInfo.svcMgmtNum)) {
      this.response.cookie(COOKIE_KEY.XTLID, CryptoHelper.encrypt(svcInfo.svcMgmtNum, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB));
    }

    if (!FormatHelper.isEmpty(svcInfo.userId)) {
      this.response.cookie(COOKIE_KEY.XTLOGINID, CryptoHelper.encrypt(svcInfo.userId, XTRACTOR_KEY, CryptoHelper.ALGORITHM.AES128ECB));
    }

    this.response.cookie(COOKIE_KEY.XTLOGINTYPE, svcInfo.loginType === 'E' ? 'Z' : 'A');
  }

  public getAllSvcInfo(req?): any {
    const request = req || this.request;
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.allSvcInfo) ) {
      this.logger.debug(this, '[getAllSvcInfo]', request.session.allSvcInfo);
      return request.session.allSvcInfo;
    }
    return null;
  }

  public setAllSvcInfo(allSvcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      this.request.session.allSvcInfo = allSvcInfo;
      this.request.session.save(() => {
        this.logger.debug(this, '[setAllSvcInfo]', this.request.session.allSvcInfo);
        observer.next(this.request.session.allSvcInfo);
        observer.complete();
      });
    });
  }

  public getChildInfo(req?): any {
    const request = req || this.request;
    if ( !FormatHelper.isEmpty(request.session) && !FormatHelper.isEmpty(request.session.childInfo) ) {
      this.logger.debug(this, '[getChildInfo]', request.session.childInfo);
      return request.session.childInfo;
    }
    return null;
  }

  public setChildInfo(childInfo: any): Observable<any> {
    return Observable.create((observer) => {
      this.request.session.childInfo = childInfo;
      this.request.session.save(() => {
        this.logger.debug(this, '[setChildInfo]', this.request.session.childInfo);
        observer.next(this.request.session.childInfo);
        observer.complete();
      });
    });
  }

  public getServerSession(): string {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.serverSession) ) {
      this.logger.debug(this, '[getServerSession]', this.request.cookies[COOKIE_KEY.TWM], this.request.session.serverSession);
      return this.request.session.serverSession;
    }
    return '';
  }

  public setServerSession(serverSession: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(this.request) && !FormatHelper.isEmpty(this.request.session) ) {
        this.request.session.serverSession = serverSession;
        this.request.session.save(() => {
          this.logger.debug(this, '[setServerSession]', this.request.session);
          observer.next(this.request.session.serverSession);
          observer.complete();
        });
      }
    });
  }

  public setChannel(channel: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(this.request) && !FormatHelper.isEmpty(this.request.session) ) {
        this.request.session.channel = channel;
        this.request.session.save(() => {
          this.logger.debug(this, '[setChannel]', this.request.session);
          observer.next(this.request.session.channel);
          observer.complete();
        });
      }
    });
  }

  public getChannel(): string {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.channel) ) {
      return this.request.session.channel;
    }
    return this.request.cookies[COOKIE_KEY.CHANNEL];
  }

  public setMaskingCert(svcMgmtNum: string): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(this.request) ) {
        if ( FormatHelper.isEmpty(this.request.masking) ) {
          this.request.session.masking = [];
        }
        this.request.session.masking.push(svcMgmtNum);
        this.request.session.save(() => {
          this.logger.debug(this, '[setServerSession]', this.request.session);
          observer.next(this.request.session.masking);
          observer.complete();
        });
      }
    });
  }

  public getMaskingCert(svcMgmtNum: string): boolean {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.masking) ) {
      return this.request.session.masking.indexOf(svcMgmtNum) !== -1;
    }
    return false;

  }

  public logoutSession(): Observable<any> {
    return Observable.create((observer) => {
      this.request.session.destroy((error) => {
        this.logger.debug(this, '[logoutSession]', this.request.session, error);
        this.response.clearCookie(COOKIE_KEY.TWM);
        this.response.clearCookie(COOKIE_KEY.TWM_LOGIN);
        observer.next();
        observer.complete();
      });
    });
  }

  public getDevice(): string {
    const userAgent = this.getUserAgent();
    if ( /TWM_DEVICE/.test(userAgent) ) {
      return userAgent.split(COOKIE_KEY.DEVICE + '=')[1];
    }
    return '';
  }

  public getNodeIp(): string {
    if ( !FormatHelper.isEmpty(this.request) ) {
      const ip = this.request.headers['x-forwarded-for'] ||
        this.request.connection.remoteAddress ||
        this.request.socket.remoteAddress ||
        (this.request.connection.socket ? this.request.connection.socket.remoteAddress : '');
      return ip;
    }
    return '';
  }

  public getPath(): string {
    if ( !FormatHelper.isEmpty(this.request) ) {
      const url = this.request.baseUrl + this.request.path;
      if ( url.indexOf('bypass') !== -1 ) {
        this.getReferer();
      } else {
        return this.request.baseUrl + this.request.path;
      }
    }
    return '';
  }

  public getReferer(req?: any): string {
    const request = req || this.request;
    const referer = request.headers.referer;
    if ( !FormatHelper.isEmpty(referer) ) {
      let path = (request.headers.referer).match(/(https?...)?([^\/]+)(.*)/)[3];
      if ( path.indexOf('?') !== -1 ) {
        path = path.split('?')[0];
      }
      return path;
    } else {
      return '';
    }

  }

  public getDns(): string {
    if ( !FormatHelper.isEmpty(this.request) ) {
      return this.request.headers.host;
    }
    return '';
  }

  public isGreen(): string {
    const dns = this.getDns();
    if ( dns === EnvHelper.getEnvironment('DOMAIN_G') ) {
      return BUILD_TYPE.GREEN;
    }
    return '';
  }

  public getUserAgent(): string {
    if ( !FormatHelper.isEmpty(this.request) ) {
      return this.request.headers['user-agent'];
    }
    return '';
  }
}

export default LoginService;
