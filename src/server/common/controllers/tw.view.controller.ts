import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import { SvcInfoModel } from '../../models/svc-info.model';
import { URL } from '../../types/url.type';
import FormatHelper from '../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';


abstract class TwViewController {
  private _apiService: ApiService;
  private _loginService: LoginService;
  private _logger: LoggerService;

  constructor() {
    this._apiService = new ApiService();
    this._loginService = new LoginService();
    this._logger = new LoggerService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void;

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

    if ( this.existId(tokenId, userId) ) {
      this.login(req, res, next, tokenId, userId);
    } else {
      this.goSessionLogin(req, res, next, path);
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

  private checkLogin(): boolean {
    return this.loginService.isLogin();
  }

  private testLogin(req, res, next, userId) {
    this.apiService.requestLoginTest(userId).subscribe((resp) => {
      this.render(req, res, next, new SvcInfoModel(resp), resp.noticeTpyCd);
    }, (error) => {
      // 로그인 실패
      console.log('error', error);
    });
  }

  private tidLogin(req, res, next, tokenId) {
    this.apiService.requestLoginTid(tokenId, req.query.state).subscribe((resp) => {
      this.render(req, res, next, new SvcInfoModel(resp), resp.noticeTpyCd);
    }, (error) => {
      // 로그인 실패
      console.log('error', error);
    });
  }

  private goSessionLogin(req, res, next, path) {
    if ( this.checkLogin() ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      // TODO: 세션 만료 or 새로 진입
      if ( !URL[path].login ) {
        this.render(req, res, next);
      } else {
        res.render('logout/auth.logout.expire.html');
      }
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
