/**
 * FileName: auth.line.edit.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import LineList from '../../../../mock/server/auth.line';

class AuthLineEdit extends TwViewController {
  private category = '';
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.category = req.query.category;
    const lineInfo = this.parseLineList(LineList.result);
    this.apiService.request(API_CMD.BFF_03_0004, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const list = resp.result;
      }
      res.render('line/auth.line.edit.html', lineInfo);
    });
  }

  private parseLineList(lineList): any {
    return lineList;
  }
}

export default AuthLineEdit;
