import FormatHelper from '../utils/format.helper';
import LoggerService from './logger.service';

class LoginService {
  static instance;
  private session;
  private logger;

  constructor() {
    if ( LoginService.instance ) {
      return LoginService.instance;
    }

    this.logger = new LoggerService();
    LoginService.instance = this;
  }

  public isLogin(userId?: string): boolean {
    if ( !FormatHelper.isEmpty(userId) ) {
      return !FormatHelper.isEmpty(this.session.serverSession) && this.session.userId === userId;
    }
    return !FormatHelper.isEmpty(this.session.serverSession);
  }

  public setClientSession(session) {
    this.session = session;
  }

  public setUserId(userId: string) {
    this.session.userId = userId;
    this.session.save(() => {
      this.logger.log(this, '[setUserId]', this.session.userId);
    });
  }

  public getUserId(): string {
    return this.session.userId;
  }


  public getSvcInfo(): any {
    return this.session.svcInfo;
  }

  public setSvcInfo(svcInfo: any) {
    this.session.svcInfo = svcInfo;
    this.session.save(() => {
      this.logger.log(this, '[setSvcInfo]', this.session.setSvcInfo);
    });
  }

  public getServerSession(): string {
    if ( !FormatHelper.isEmpty(this.session) && !FormatHelper.isEmpty(this.session.serverSession) ) {
      return this.session.serverSession;
    }
    return '';
  }

  public setServerSession(serverSession: string) {
    this.session.serverSession = serverSession;
    this.session.save(() => {
      this.logger.log(this, '[setServerSession]', this.session);
    });
  }
}

export default LoginService;
