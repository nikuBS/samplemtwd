import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_METHOD } from '../../types/api-command.type';
import ApiService from '../../services/api.service';
import FormatHelper from '../../utils/format.helper';
import LoginService from '../../services/login.service';


class NativeRouter {
  public router: Router;
  private apiService: ApiService = new ApiService();

  constructor() {
    this.router = express.Router();

    Object.keys(API_CMD).map((key) => {
      const cmd = API_CMD[key];
      if ( cmd.native ) {
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
    this.router.get(cmd.path, this.sendRequest.bind(this, cmd));
  }

  private setPostApi(cmd) {
    this.router.post(cmd.path, this.sendRequest.bind(this, cmd));
  }

  private setPutApi(cmd) {
    this.router.put(cmd.path, this.sendRequest.bind(this, cmd));
  }

  private setDeleteApi(cmd) {
    this.router.delete(cmd.path, this.sendRequest.bind(this, cmd));
  }

  private sendRequest(cmd: any, req: Request, res: Response, next: NextFunction) {
    this.apiService.setCurrentReq(req, res);

    const params = cmd.method === API_METHOD.GET ? req.query : req.body;
    const pathVar = this.getPathVariable(req.params);
    const headers = req.headers;
    const version = req.params['version'];

    this.apiService.request(cmd, params, headers, pathVar, version)
      .subscribe((data) => {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('expires', '0');
        res.set('pragma', 'no-cache');
        return res.json(data);
      });
  }

  private getPathVariable(params) {
    if ( !FormatHelper.isEmpty(params) ) {
      return Object.keys(params)
        .filter((key) => key !== 'version')
        .map((key) => params[key]);
    }
    return [];
  }
}

export default NativeRouter;
