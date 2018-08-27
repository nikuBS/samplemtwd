/**
 * FileName: myt.benefit.membership.detail.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.17
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {Observable} from '../../../../../../node_modules/rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MytVipData} from '../../../../mock/server/myt.benefit.membership.mock';
import FormatHelper from '../../../../utils/format.helper';

class MyTBenefitMembershipDetailController extends TwViewController {

  private _code: any;

  private _getUrlPath(code: string): any {
    const urlPath = {
      VIP       : '../../components/benefit/myt.benefit.membership.detail.vip.html',
      'VIP-NON' : '../../components/benefit/myt.benefit.membership.detail.vip-non.html',
      T_CLASS   : '../../components/benefit/myt.benefit.membership.detail.t-class.html',
      CHOCOLATE : '../../components/benefit/myt.benefit.membership.detail.chocolate.html',
      MELON     : '../../components/benefit/myt.benefit.membership.detail.melon.html',
      '11ST'    : '../../components/benefit/myt.benefit.membership.detail.11st.html',
      FREE      : '../../components/benefit/myt.benefit.membership.detail.free.html',
      TPLE      : '../../components/benefit/myt.benefit.membership.detail.tple.html',
      COUPLE    : '../../components/benefit/myt.benefit.membership.detail.couple.html',
      LEADERS   : '../../components/benefit/myt.benefit.membership.detail.leaders.html',
      PLUS      : '../../components/benefit/myt.benefit.membership.detail.plus.html',
    };
    return urlPath[code];
  }

  get code(): any {
    return this._code;
  }

  set code(code: any) {
    this._code = code;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.code = req.query.code;
    if ( this.code === 'VIP' ) {
      Observable.combineLatest(
        this.reqVipAPI()
      ).subscribe(([data]) => {
        this.renderView(req, res, svcInfo, data);
      });
    } else {
      this.renderView(req, res, svcInfo, {});
    }
  }

  private renderView(req: Request, res: Response, svcInfo: any, data: any): any {
    if ( FormatHelper.isEmpty(data) || (data.code === API_CODE.CODE_00) ) {
      data = data.result || {};
      res.render('benefit/myt.benefit.membership.detail.html', this.getData(req, svcInfo, data) );
    } else {
      this.error.render(res, {
        code: data.code,
        msg: data.msg,
        svcInfo: svcInfo
      });
    }
  }

  private vipData(data: any): void {
    if ( this.code === 'VIP' ) {
      let accumDisc = data.accumDiscBenefit;
      accumDisc = parseInt(accumDisc, 10) + '';
      data.accumDiscBenefit = FormatHelper.addComma(accumDisc);
    }
  }

  private tClassData(req: Request, data: any): void {
    if ( this.code === 'T_CLASS' ) {
      data.plans = req.query.plans;
    }
  }

  private getData(req: Request, svcInfo: any, data: any): any {
    this.vipData(data);
    this.tClassData(req, data);

    data.detailPath = this._getUrlPath(this.code);
    return {
      svcInfo,
      data : data
    };
  }

  private reqVipAPI(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0098, {}).map((response) => {
      return response;
    });
  }

  private reqVipMock(): Observable<any> {
    return Observable.create((observer) => {
      observer.next(MytVipData);
      observer.complete();
    });
  }
}

export default MyTBenefitMembershipDetailController;
