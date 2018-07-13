import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import { SvcInfoModel } from '../../models/svc-info.model';
import { URL } from '../../types/url.type';
import FormatHelper from '../../utils/format.helper';

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
    const path = req.baseUrl + (req.path !== '/' ? req.path : '');
    const tokenId = req.query.id_token;
    const userId = req.query.userId;

    this.loginService.setClientSession(req.session);

    if ( !this.existId(tokenId, userId) ) {
      if ( URL[path].login ) {
        this.goSessionLogin(req, res, next);
      } else {
        this.render(req, res, next);
      }
    } else {
      this.login(req, res, next, tokenId, userId);
    }
  }

  private login(req, res, next, tokenId, userId) {
    if ( !FormatHelper.isEmpty(tokenId) ) {
      // TID login
      this.tidLogin(req, res, next, tokenId);
    } else {
      // TEST login
      this.testLogin(req, res, next, userId);
    }
  }

  private existId(tokenId: string, userId: string) {
    return !(FormatHelper.isEmpty(tokenId) && FormatHelper.isEmpty(userId));
  }

  private checkLogin(userId: string): boolean {
    return this.loginService.isLogin(userId);
  }

  private testLogin(req, res, next, userId) {
    if ( this.checkLogin(userId) ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      this._apiService.request(API_CMD.BFF_03_0001, { userId }).subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          this.loginService.setUserId(userId);
          this.render(req, res, next, new SvcInfoModel(resp.result));
        } else {
          this.renderError(req, res, next, resp);
        }
      });
    }
  }

  private tidLogin(req, res, next, tokenId) {
    const params = {
      token: tokenId,
      state: ''
    };
    this._apiService.request(API_CMD.BFF_03_0008, params).subscribe((resp) => {
      res.send(resp);
    });
  }

  private goSessionLogin(req, res, next) {
    if ( this.checkLogin('') ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      // 세션 만료
      res.send('session expiration');
    }
  }

  private checkError(error: string, errorMessage: string) {
    return !FormatHelper.isEmpty(error);

  }

  private renderError(req: Request, res: Response, next: NextFunction, message: any) {
    res.send(message);
  }
}

export default TwViewController;
