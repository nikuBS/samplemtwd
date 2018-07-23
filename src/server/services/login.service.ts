import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';
import { SvcInfoModel } from '../models/svc-info.model';
import { Observable } from 'rxjs/Observable';

class LoginService {
  static instance;
  private session;
  private logger = new LoggerService();

  constructor() {
    if ( LoginService.instance ) {
      return LoginService.instance;
    }
    LoginService.instance = this;
  }

  public isLogin(): boolean {
    if ( !FormatHelper.isEmpty(this.session) ) {
      return !FormatHelper.isEmpty(this.session.svcInfo);
    }
    return false;
  }

  public setClientSession(session) {
    this.session = session;
  }

  public getSvcInfo(): any {
    return this.session.svcInfo;
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
      this.session.serverSession = serverSession;
      this.session.save(() => {
        this.logger.debug(this, '[setServerSession]', this.session);
        observer.next(this.session.serverSession);
        observer.complete();
      });
    });
  }

  public logoutSession() {
    this.session.destroy(() => {
      this.logger.debug(this, '[logoutSession]');
    });
  }
}

export default LoginService;
