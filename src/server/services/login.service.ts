import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';
import { COOKIE_KEY } from '../types/common.type';
import { UserCertModel } from '../models/user-cert.model';

class LoginService {
  static instance;
  private request;
  private response;
  private logger = new LoggerService();

  constructor() {
    if ( LoginService.instance ) {
      return LoginService.instance;
    }
    LoginService.instance = this;
  }

  public setCurrentReq(req, res) {
    this.logger.info(this, '[setCurrentReq]', req.session, req.headers.referer, req.hostname);
    this.request = req;
    this.response = res;
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


  public getSvcInfo(): any {
    this.logger.debug(this, '[getSvcInfo]', this.request.session);
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.svcInfo) ) {
      this.logger.debug(this, '[getSvcInfo]', this.request.session.svcInfo);
      return this.request.session.svcInfo;
    }
    return null;
  }

  public setSvcInfo(svcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      this.response.cookie(COOKIE_KEY.TWM_LOGIN, 'Y');
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

  public getAllSvcInfo(): any {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.allSvcInfo) ) {
      this.logger.debug(this, '[getAllSvcInfo]', this.request.session.allSvcInfo);
      return this.request.session.allSvcInfo;
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

  public getChildInfo(): any {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.childInfo) ) {
      this.logger.debug(this, '[getChildInfo]', this.request.session.childInfo);
      return this.request.session.childInfo;
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
      this.logger.debug(this, '[getServerSession]', this.request.session.serverSession);
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

  public getUserCert(): any {
    this.logger.debug(this, '[getUserCert]', this.request.session);
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.userCert) ) {
      this.logger.debug(this, '[getUserCert]', this.request.session.userCert);
      return this.request.session.userCert;
    }
    return null;
  }

  public getSelectedUserCert(): any {
    const userCert = this.getUserCert();
    if ( !FormatHelper.isEmpty(userCert) ) {
      return userCert[this.request.session.svcInfo.svcMgmtNum];
    }
    return null;
  }

  public setUserCert(userCert: any): Observable<any> {
    return Observable.create((observer) => {
      const svcMgmtNum = this.request.session.svcInfo.svcMgmtNum;
      if ( FormatHelper.isEmpty(this.request.session.userCert) ) {
        this.request.session.userCert = {};
      }
      this.request.session.userCert[svcMgmtNum] = new UserCertModel(userCert);
      this.request.session.save(() => {
        this.logger.debug(this, '[setUserCert]', this.request.session);
        observer.next(this.request.session.userCert);
        observer.complete();
      });
    });
  }

  public setChannel(channel: string): Observable<any> {
    return Observable.create((observer) => {
      this.request.session.channel = channel;
      this.request.session.save(() => {
        this.logger.debug(this, '[setChannel]', this.request.session);
        observer.next(this.request.session.channel);
        observer.complete();
      });
    });
  }

  public getChannel(): string {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.channel) ) {
      return this.request.session.channel;
    }
    return this.request.cookies[COOKIE_KEY.CHANNEL];
  }

  public logoutSession(): Observable<any> {
    return Observable.create((observer) => {
      this.request.session.destroy(() => {
        this.logger.debug(this, '[logoutSession]', this.request.session);
        this.response.clearCookie(COOKIE_KEY.TWM);
        this.response.clearCookie(COOKIE_KEY.TWM_LOGIN);
        observer.next();
        observer.complete();
      });
    });
  }

  public getDeviceCookie(): string {
    return this.request.cookies[COOKIE_KEY.DEVICE];
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
}

export default LoginService;
