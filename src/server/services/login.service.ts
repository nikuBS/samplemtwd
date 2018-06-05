import { SvcInfoModel } from '../models/svc-info.model';
import FormatHelper from '../utils/format.helper';
import { API_CMD, API_CODE } from '../types/api-command.type';
import ApiService from './api.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

class LoginService {
  private apiService = ApiService;

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


  public changeSvc(svcMgmtNum: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0004, {}, { svcMgmtNum: svcMgmtNum })
      .map((resp) => {
        console.log('[changeSvc]', resp);
        if ( resp.code === API_CODE.CODE_00 ) {
          this.svcModel.svcInfo = resp.result || {};
        }
        return resp;
      });
  }

  public testLogin(userId: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0001, { userId }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        this.svcModel.svcInfo = resp.result || {};
        this.userId = userId;
      }
      return resp;
    });
  }

  public getSvcInfo() {
    return this.svcModel.svcInfo;
  }

  public setSvcInfo() {
    this.apiService.request(API_CMD.BFF_03_0005, {}).subscribe((resp) => {
      this.svcModel.svcInfo = resp.result;
    });
  }
}

export default LoginService;
