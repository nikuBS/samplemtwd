import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import { SvcInfoModel } from '../../models/svc-info.model';
import { URL } from '../../types/url.type';

abstract class TwViewController {
  private _apiService: ApiService;
  private _loginService: LoginService;
  private _logger: LoggerService;

  constructor() {
    this._apiService = new ApiService();
    this._loginService = new LoginService();
    this._logger = new LoggerService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void;

  protected get apiService(): any {
    return this._apiService;
  }

  protected get loginService(): LoginService {
    return this._loginService;
  }

  protected get logger(): LoggerService {
    return this._logger;
  }

  public initPage(req: any, res: any, next: any): void {
    const userId = req.query.userId;
    const path = req.baseUrl + (req.path !== '/' ? req.path : '');

    if ( URL[path].login ) {
      this.login(req, res, next, userId);
    } else {
      this.render(req, res, next);
    }
  }

  private login(req, res, next, userId) {
    // Mock Test
    let loginCmd = API_CMD.BFF_03_0001;
    if ( userId === 'mock' ) {
      loginCmd = API_CMD.BFF_03_0001_mock;
    }
    if ( this.checkLogin(req.session, userId) ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      this._apiService.request(loginCmd, { userId }).subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          this.loginService.setUserId(userId);
          this.render(req, res, next, new SvcInfoModel(resp.result));
        } else {
          this.renderError(req, res, next, resp);
        }
      });
    }
  }

  private checkLogin(session: any, userId: string): boolean {
    this.loginService.setClientSession(session);
    return this.loginService.isLogin(userId);
  }

  private renderError(req: Request, res: Response, next: NextFunction, message: any) {
    res.send(message);
  }
}

export default TwViewController;
