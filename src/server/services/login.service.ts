import FormatHelper from '../utils/format.helper';

class LoginService {
  static instance;
  private session;

  constructor() {
    if ( LoginService.instance ) {
      return LoginService.instance;
    }

    LoginService.instance = this;
  }

  public isLogin(userId: string): boolean {
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
  }

  public getUserId(): string {
    return this.session.userId;
  }


  public getSvcInfo(): any {
    return this.session.svcInfo;
  }

  public setSvcInfo(svcInfo: any) {
    this.session.svcInfo = svcInfo;
  }

  public getServerSession(): string {
    if ( FormatHelper.isEmpty(this.session.serverSession) ) {
      return '';
    }
    return this.session.serverSession;
  }

  public setServerSession(serverSession: string) {
    this.session.serverSession = serverSession;
  }
}

export default LoginService;
