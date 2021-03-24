/**
 * MenuName: 나의 요금 > 요금안내서 통합(대표,일반)청구회선(MF_02_01)
 *           나의 요금 > 요금안내서 통합(일반)청구회선(MF_02_02)
 *           나의 요금 > 요금안내서 개별청구회선(MF_02_03)
 *           나의 요금 > 요금안내서 선불폰(PPS)(MF_02_04)
 *           나의 요금 > 요금안내서 > SK브로드밴드
 * @file myt-fare.bill.guide.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.09.12
 * Summary: 요금안내서 화면으로 진입 후 조건에 맞게 화면 분기 및 청구요금/사용요금 조회
 */

import {NextFunction, Request, Response} from 'express';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {SVC_CDNAME} from '../../../../types/bff.type';
import {MytFareInfoMiriService} from '../../services/info/myt-fare.info.miri.service';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {MytFareSubmainGuideService} from '../../services/submain/myt-fare.submain.guide.service';

class MyTFareBillGuideAdv extends TwViewController {
  private _miriService!: MytFareInfoMiriService;
  private _mytFareSubmainGuideService!: MytFareSubmainGuideService;
  private _billpayInfo: any = {};

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    try {
      this._miriService = new MytFareInfoMiriService(req, res, svcInfo, req.query.line);
      this._mytFareSubmainGuideService = new MytFareSubmainGuideService(req, res, svcInfo, allSvc, childInfo, pageInfo);
      this._mytFareSubmainGuideService.getBillCharge(svcInfo, res).subscribe(resp => {
        const urlTplInfo = this._mytFareSubmainGuideService._urlTplInfo;
        // sk brodband
        if (resp.lineType === SVC_CDNAME.S1) {
          this._mytFareSubmainGuideService.skbroadbandCircuit(res);
          return;
        } else if (resp.code && resp.code !== API_CODE.CODE_00) { // 응답 결과 실패일때
          return this._mytFareSubmainGuideService.fail(res, resp);
        } else if (resp.lineType === SVC_CDNAME.M2) { // PPS
          this._mytFareSubmainGuideService.renderView(res, urlTplInfo.prepaidPage, resp);
        } else {
          this.reqButtonView(res, urlTplInfo.commonPage, resp);
          // 기업솔루션 | svcInfo.svcAttrCd : O1, 이건 페이지가 없음.
        }
      });
    } catch (e) {
      this.logger.error(this, e);
    }
  }

  /**
   * 로밍, 기부금, 콜기프트 버튼 보여질지 조회 후 화면 이동
   * 로밍(성능개선 항목으로 조회X)
   * @param res
   * @param view - 이동할 html
   * @param data - 청구/사용요금 조회데이터 등
   */
  private reqButtonView(res: Response, view: string, data: any): any {
    const invDt = data.data.billpayInfo.invDt;
    const params = {
      startDt: DateHelper.getStartOfMonDate( String(invDt), 'YYYYMMDD'),
      endDt: DateHelper.getEndOfMonDate( String(invDt), 'YYYYMMDD')
    };

    // 로밍api호출이 느려서 일단 무조건 노출함
    // -> 성능 이슈로 로밍버튼 삭제(DV001-19072 2019.03.28)
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0038, params),
      this.apiService.request(API_CMD.BFF_05_0045, params),
      this._miriService.getMiriPayment(this._billpayInfo.invDt),
      this._mytFareSubmainGuideService.getFeePlan() // 요금제 조회
    ).subscribe((resp) => {
      data.roamDonaCallBtnYn = {
        roamingYn: 'N',
        donationYn: 'N',
        callgiftYn: 'N'
      };
      const apiError = this.error.apiError(resp.slice(0, 2));
      if (FormatHelper.isEmpty(apiError)) {
        const {donationList = []} = resp[0].result;
        const {callData} = resp[1].result;
        Object.assign(data.roamDonaCallBtnYn, {
          donationYn: donationList.length > 0 ? 'Y' : 'N',
          callgiftYn: Number(callData) ? 'Y' : 'N'
        });
      }
      data.miriPayment = resp[2];
      data.feePlan = resp[3];
      this._mytFareSubmainGuideService.renderView(res, view, data);
    });

  }
}

export default MyTFareBillGuideAdv;
