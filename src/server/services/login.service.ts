import { SvcInfoModel } from '../models/svc-info.model';
import FormatHelper from '../utils/format.helper';

class LoginService {
  // TODO: replace redis
  private svcModel: SvcInfoModel = new SvcInfoModel({});
  private userId: string = '';

  constructor() {
  }

  public isLogin(userId: string): boolean {
    if ( userId ) {
      return !FormatHelper.isEmpty(this.svcModel.serverSession) && this.userId === userId;
    }
    return !FormatHelper.isEmpty(this.svcModel.serverSession);
  }

  public getSvcInfo(): any {
    return this.svcModel.svcInfo;
  }

  public setSvcInfo(svcInfo: any) {
    this.svcModel.svcInfo = svcInfo;
  }

  public getServerSession(): string {
    return this.svcModel.serverSession;
  }

  public setServerSession(serverSession: string) {
    this.svcModel.serverSession = serverSession;
  }
}

export default LoginService;
