import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';
import { COOKIE_KEY } from '../types/bff-common.type';

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
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.svcInfo) ) {
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

  public getServerSession(): string {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.serverSession) ) {
      return this.request.session.serverSession;
    }
    return '';
  }

  public setServerSession(serverSession: string): Observable<any> {
    return Observable.create((observer) => {
      this.request.session.serverSession = serverSession;
      this.request.session.save(() => {
        this.logger.debug(this, '[setServerSession]', this.request.session);
        observer.next(this.request.session.serverSession);
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
    return '';
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
}

export default LoginService;
