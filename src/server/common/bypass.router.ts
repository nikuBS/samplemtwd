import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_METHOD } from '../types/api-command.type';
import ApiService from '../services/api.service';
import FormatHelper from '../utils/format.helper';
import LoginService from '../services/login.service';
import AuthService from '../services/auth.service';


class BypassRouter {
  public router: Router;

  private apiService;
  private loginService: LoginService = new LoginService();
  private authService: AuthService = new AuthService();

  constructor() {
    this.router = express.Router();
    this.apiService = new ApiService();

    Object.keys(API_CMD).map((key) => {
      const cmd = API_CMD[key];
      if ( cmd.bypass ) {
        switch ( cmd.method ) {
          case API_METHOD.GET:
            this.setGetApi(cmd);
            break;
          case API_METHOD.POST:
            this.setPostApi(cmd);
            break;
          case API_METHOD.PUT:
            this.setPutApi(cmd);
            break;
          case API_METHOD.DELETE:
            this.setDeleteApi(cmd);
            break;
        }
      }
    });
  }

  private setGetApi(cmd) {
    this.router.get(cmd.path, this.checkApi.bind(this, cmd));
  }

  private setPostApi(cmd) {
    this.router.post(cmd.path, this.checkApi.bind(this, cmd));
  }

  private setPutApi(cmd) {
    this.router.put(cmd.path, this.checkApi.bind(this, cmd));
  }

  private setDeleteApi(cmd) {
    this.router.delete(cmd.path, this.checkApi.bind(this, cmd));
  }

  private checkApi(cmd: any, req: Request, res: Response, next: NextFunction) {
    this.authService.getUrlMeta(req).subscribe((resp) => {
      if ( resp['cert'] ) {
        return res.json({
          code: API_CODE.CODE_03,
          result: resp
        });
      } else {
        this.sendRequest(cmd, req, res, next);
      }
    });
  }

  private sendRequest(cmd: any, req: Request, res: Response, next: NextFunction) {
    const params = cmd.method === API_METHOD.GET ? req.query : req.body;
    const headers = {
      cookie: req.headers.cookie,
      'user-agent': req.headers['user-agent']
    };
    const parameter = FormatHelper.isEmpty(params.parameter) ? {} : params.parameter;
    const pathVariables = FormatHelper.isEmpty(params.pathVariables) ? [] : params.pathVariables;

    this.loginService.setCurrentReq(req, res);
    this.apiService.request(cmd, parameter, headers, ...(pathVariables))
      .subscribe((data) => {
        return res.json(data);
      });
  }
}

export default BypassRouter;
