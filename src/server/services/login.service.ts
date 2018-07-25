import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';

class LoginService {
  static instance;
  // private session;
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
    this.logger.info(this, '[setCurrentReq]', req.session);
    this.request = req;
    this.response = res;
  }

  public isLogin(session): boolean {
    if ( !FormatHelper.isEmpty(session) ) {
      return !FormatHelper.isEmpty(session.svcInfo) && !FormatHelper.isEmpty(session.serverSession);
    }
    return false;
  }

  // public isExpiredSession(session) {
  //   if ( this.isLogin(session) ) {
  //     return false;
  //   }
  //   if ( !FormatHelper.isEmpty(this.session) ) {
  //     return !FormatHelper.isEmpty(this.session.svcInfo) && !FormatHelper.isEmpty(this.session.serverSession);
  //   }
  //   return false;
  // }

  public setClientSession(session) {
    this.logger.info(this, '[Set session]', session);
    // this.session = session;
  }

  public getSvcInfo(): any {
    if ( !FormatHelper.isEmpty(this.request.session) && !FormatHelper.isEmpty(this.request.session.svcInfo) ) {
      return this.request.session.svcInfo;
    }
    return null;
  }

  public setSvcInfo(svcInfo: any): Observable<any> {
    return Observable.create((observer) => {
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
      // if ( FormatHelper.isEmpty(this.session) ) {
      //   this.session = this.request.session;
      // }
      this.request.session.serverSession = serverSession;
      this.request.session.save(() => {
        this.logger.debug(this, '[setServerSession]', this.request.session);
        observer.next(this.request.session.serverSession);
        observer.complete();
      });

    });
  }

  public logoutSession(): Observable<any> {
    return Observable.create((observer) => {
      // if ( !FormatHelper.isEmpty(this.session) ) {
        delete this.request.session.svcInfo;
        delete this.request.session.severSession;
        this.request.session.save(() => {
          this.logger.debug(this, '[logoutSession]', this.request.session);
          // this.session = null;
          observer.next();
          observer.complete();
        });

    });
  }
}

export default LoginService;
