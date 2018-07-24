import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';

class LoginService {
  static instance;
  private session;
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
    this.logger.info(this, '[setCurrentReq]', req.session, this.session);
    this.request = req;
    this.response = res;
  }

  public isLogin(session): boolean {
    if ( !FormatHelper.isEmpty(session) ) {
      return !FormatHelper.isEmpty(session.svcInfo) && !FormatHelper.isEmpty(session.serverSession);
    }
    return false;
  }

  public isExpiredSession(session) {
    if ( this.isLogin(session) ) {
      return false;
    }
    if ( !FormatHelper.isEmpty(this.session) ) {
      return !FormatHelper.isEmpty(this.session.svcInfo) && !FormatHelper.isEmpty(this.session.serverSession);
    }
    return false;
  }

  public setClientSession(session) {
    this.logger.info(this, '[Set session]', session, this.session);
    this.session = session;
  }

  public getSvcInfo(): any {
    if ( !FormatHelper.isEmpty(this.session) && !FormatHelper.isEmpty(this.session.svcInfo) ) {
      return this.session.svcInfo;
    }
    return null;
  }

  public setSvcInfo(svcInfo: any): Observable<any> {
    return Observable.create((observer) => {
      if ( FormatHelper.isEmpty(this.session.svcInfo) ) {
        this.session.svcInfo = new SvcInfoModel(svcInfo);
      } else {
        Object.assign(this.session.svcInfo, svcInfo);
      }
      this.session.save(() => {
        this.logger.debug(this, '[setSvcInfo]', this.session.svcInfo);
        observer.next(this.session.svcInfo);
        observer.complete();
      });
    });
  }

  public getServerSession(): string {
    if ( !FormatHelper.isEmpty(this.session) && !FormatHelper.isEmpty(this.session.serverSession) ) {
      return this.session.serverSession;
    }
    return '';
  }

  public setServerSession(serverSession: string): Observable<any> {
    return Observable.create((observer) => {
      if ( FormatHelper.isEmpty(this.session) ) {
        this.session = this.request.session;
      }
      this.session.serverSession = serverSession;
      this.session.save(() => {
        this.logger.debug(this, '[setServerSession]', this.session);
        observer.next(this.session.serverSession);
        observer.complete();
      });

    });
  }

  public logoutSession(): Observable<any> {
    return Observable.create((observer) => {
      if ( !FormatHelper.isEmpty(this.session) ) {
        delete this.session.svcInfo;
        delete this.session.severSession;
        this.session.save(() => {
          this.logger.debug(this, '[logoutSession]', this.session);
          this.session = null;
          observer.next();
          observer.complete();
        });
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }
}

export default LoginService;
