/**
 * FileName: myt.joinService.contractTerminalInfo.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.16
 * info :
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';

class MytBenefitRecommendDetailController extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any; // 쿼리스트링
  private _svcInfo: any;

  private _urlTplInfo: any = {
    TPAY: 'benefit/myt.benefit.recommend.detail-tpay.html',
    REFILL: 'benefit/myt.benefit.recommend.detail-refill.html',
    GIFT: 'benefit/myt.benefit.recommend.detail-gift.html',
    POINT: 'benefit/myt.benefit.recommend.detail-point.html',
    PLAN: 'benefit/myt.benefit.recommend.detail-plan.html',
    OKSP: 'benefit/myt.benefit.recommend.detail-oksp.html',
    OKASP: 'benefit/myt.benefit.recommend.detail-okasp.html',
    TSIGN: 'benefit/myt.benefit.recommend.detail-tsign.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.reqQuery = req.query;
    this.logger.info(this, '[ reqQuery ] : ', this.reqQuery);
    const thisMain = this;
    let urlStr;

    switch ( this.reqQuery.reId ) {
      case 'TPAY':
        urlStr = thisMain._urlTplInfo.TPAY;
        break;
      case 'REFILL':
        urlStr = thisMain._urlTplInfo.REFILL;
        break;
      case 'GIFT':
        urlStr = thisMain._urlTplInfo.GIFT;
        break;
      case 'POINT':
        urlStr = thisMain._urlTplInfo.POINT;
        break;
      case 'PLAN':
        urlStr = thisMain._urlTplInfo.PLAN;
        break;
      case 'OKSP':
        urlStr = thisMain._urlTplInfo.OKSP;
        break;
      case 'OKASP':
        urlStr = thisMain._urlTplInfo.OKASP;
        break;
      case 'TSIGN':
        urlStr = thisMain._urlTplInfo.TSIGN;
        break;
    }

    thisMain.renderView(res, urlStr, {
      reqQuery: thisMain.reqQuery,
      svcInfo: thisMain._svcInfo
    });

  }

  // -------------------------------------------------------------[프로미스 생성]
  public _getPromiseApi(reqObj, msg): any {
    const thisMain = this;
    const reqObjObservableApi: Observable<any> = reqObj;

    return new Promise((resolve, reject) => {
      Observable.combineLatest(
        reqObjObservableApi
      ).subscribe((resp) => {
        thisMain.logger.info(thisMain, `[ ${ msg } next ] : `, resp);
        if ( resp[0].code === API_CODE.CODE_00 ) {
          resolve(resp[0]);
        } else {
          reject(resp[0]);
        }
      });
    });

  }

// -------------------------------------------------------------[프로미스 생성 - Mock]
  public _getPromiseApiMock(mockData, msg): any {
    return new Promise((resolve, reject) => {
      const ms: number = Math.floor(Math.random() * 1000) + 1;
      setTimeout(function () {
        console.log(`[ ${ msg } _getPromiseApiMock ] : ` + mockData);

        if ( mockData.code === API_CODE.CODE_00 ) {
          resolve(mockData);
        } else {
          reject(mockData);
        }

      }, ms);
    });
  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    res.render(view, data);
  }
}

export default MytBenefitRecommendDetailController;
