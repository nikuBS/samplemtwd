import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD } from '../../types/api-command.type';

abstract class TwViewController {
  private _apiService;
  private _loginService;

  constructor() {
    this._apiService = ApiService;
    this._loginService = new LoginService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void;

  protected get apiService(): any {
    return this._apiService;
  }

  protected get loginService(): any {
    return this._loginService;
  }

  public checkLogin(req: any, res: any, next: any): void {
    const userId = req.query.userId;
    const defaultSvc = {
      custNm: '',
      svcCd: '',
      svcNum: '',
      svcNickNm: '',
      repSvcYn: '',
      svcCnt: '',
    };

    if ( this._loginService.isLogin(userId) ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      this._apiService.request(API_CMD.BFF_03_0001, { userId }).subscribe((resp) => {
        this.render(req, res, next, resp.result || defaultSvc);
      });
    }
  }

}

export default TwViewController;
