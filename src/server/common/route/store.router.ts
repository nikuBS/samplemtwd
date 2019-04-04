/**
 * @file store.router.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.05
 */

import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_METHOD, SESSION_CMD } from '../../types/api-command.type';
import ApiService from '../../services/api.service';
import FormatHelper from '../../utils/format.helper';
import LoginService from '../../services/login.service';


class StoreRouter {
  public router: Router;

  constructor() {
    this.router = express.Router();

    Object.keys(API_CMD).map((key) => {
      const cmd = API_CMD[key];
      if ( cmd.store ) {
        switch ( cmd.method ) {
          case API_METHOD.GET:
            this.setGetApi(cmd, SESSION_CMD[key]);
            break;
          case API_METHOD.POST:
            this.setPostApi(cmd, SESSION_CMD[key]);
            break;
          case API_METHOD.PUT:
            this.setPutApi(cmd, SESSION_CMD[key]);
            break;
          case API_METHOD.DELETE:
            this.setDeleteApi(cmd, SESSION_CMD[key]);
            break;
        }
      }
    });
  }

  private setGetApi(cmd, sessionCmd) {
    this.router.get(cmd.path, this.sendRequest.bind(this, cmd, sessionCmd));
  }

  private setPostApi(cmd, sessionCmd) {
    this.router.post(cmd.path, this.sendRequest.bind(this, cmd, sessionCmd));
  }

  private setPutApi(cmd, sessionCmd) {
    this.router.put(cmd.path, this.sendRequest.bind(this, cmd, sessionCmd));
  }

  private setDeleteApi(cmd, sessionCmd) {
    this.router.delete(cmd.path, this.sendRequest.bind(this, cmd, sessionCmd));
  }

  private sendRequest(cmd: any, sessionCmd: string, req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const loginService = new LoginService();
    apiService.setCurrentReq(req, res);

    const params = cmd.method === API_METHOD.GET ? req.query : req.body;
    const pathVar = this.getPathVariable(req.params);
    const headers = req.headers;
    const version = req.params['version'];

    apiService.requestStore(sessionCmd, params, headers, pathVar, version)
      .subscribe((data) => {
        // TODO: This is unpretty. Need to revise for NON JSON Object response
        if ( data instanceof Buffer ) {
          return res.end(data);
        }

        const svcInfo = loginService.getSvcInfo(req);
        if ( !FormatHelper.isEmpty(svcInfo) ) {
          data.loginType = svcInfo.loginType;
        } else {
          data.loginType = '';
        }

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

export default StoreRouter;
