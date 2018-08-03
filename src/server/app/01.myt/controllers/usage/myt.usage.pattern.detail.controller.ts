/**
 * FileName: myt.usage.pattern.detail.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.03
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import _ from 'lodash';
import DateHelper from '../../../../utils/date.helper';


class MyTUsagePatternDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.logger.info(this, 'UserInfo ', svcInfo);
    let data = {
      svcInfo: svcInfo
    };
    const api = this.getPatternApi(svcInfo);
    this.apiService.request(api, {}).subscribe((responseData) => {
      const conv_data = this.convertFeeData(responseData);
      data = _.extend(data, conv_data);
      res.render('usage/myt.usage.pattern.detail.html', { data });
    });
  }

  getPatternApi(svcInfo): any {
    const svcAttrCd = svcInfo.svcAttrCd;
    // 사용요금 조회
    switch ( svcAttrCd ) {
      case 'M1':
      case 'M3':
      case 'M4':
        return API_CMD.BFF_05_0059;
      default:
        return null;
    }
  }

  convertFeeData(response): any {
    const result: any = {};
    if ( response.result && response.result.useAmtMonthInfos ) {
      const data = response.result.useAmtMonthInfos;
      const months: any = [], basFee: any = [], domTcFee: any = [], dataTcFee: any = [], infoUseFee: any = [],
        optFee: any = [], msgUseFee: any = [], suplSvcUseFee: any = [], othrCoUseFee: any = [];
      let basFeeT = 0, domTcFeeT = 0, dataTcFeeT = 0, infoUseFeeT = 0, optFeeT = 0, msgUseFeeT = 0,
        suplSvcUseFeeT = 0, othrCoUseFeeT = 0;

      _.forEach(_.map(data, 'invDt'), (value) => {
        months.push(DateHelper.getShortKoreanMonth(value));
      });
      // 월정액
      _.forEach(_.map(data, 'basFee'), (value) => {
        const item = parseInt(value, 10);
        basFeeT += item;
        basFee.push(item);
      });
      // 국내 통화료
      _.forEach(_.map(data, 'domTcFee'), (value) => {
        const item = parseInt(value, 10);
        domTcFeeT += item;
        domTcFee.push(item);
      });
      // 데이터 통화료
      _.forEach(_.map(data, 'dataTcFee'), (value) => {
        const item = parseInt(value, 10);
        dataTcFeeT += item;
        dataTcFee.push(item);
      });
      // 콘텐츠 이용료
      _.forEach(_.map(data, 'infoUseFee'), (value) => {
        const item = parseInt(value, 10);
        infoUseFeeT += item;
        infoUseFee.push(item);
      });
      // 옵션요금제
      _.forEach(_.map(data, 'optFee'), (value) => {
        const item = parseInt(value, 10);
        optFeeT += item;
        optFee.push(item);
      });
      // 문자이용료
      _.forEach(_.map(data, 'msgUseFee'), (value) => {
        const item = parseInt(value, 10);
        msgUseFeeT += item;
        msgUseFee.push(item);
      });
      // 부가서비스 이용료
      _.forEach(_.map(data, 'suplSvcUseFee'), (value) => {
        const item = parseInt(value, 10);
        suplSvcUseFeeT += item;
        suplSvcUseFee.push(item);
      });
      // 소액결제
      _.forEach(_.map(data, 'othrCoUseFee'), (value) => {
        const item = parseInt(value, 10);
        othrCoUseFeeT += item;
        othrCoUseFee.push(item);
      });

      result.empty = {
        basFee: !basFeeT,
        domTcFee: !domTcFeeT,
        dataTcFee: !dataTcFeeT,
        infoUseFee: !infoUseFeeT,
        optFee: !optFeeT,
        msgUseFee: !msgUseFeeT,
        suplSvcUseFee: !suplSvcUseFeeT,
        othrCoUseFee: !othrCoUseFeeT
      };

      result.basFee = _.zip(months, basFee);
      result.domTcFee = _.zip(months, domTcFee);
      result.dataTcFee = _.zip(months, dataTcFee);
      result.infoUseFee = _.zip(months, infoUseFee);
      result.optFee = _.zip(months, optFee);
      result.msgUseFee = _.zip(months, msgUseFee);
      result.suplSvcUseFee = _.zip(months, suplSvcUseFee);
      result.othrCoUseFee = _.zip(months, othrCoUseFee);
    }
    return result;
  }
}

export default MyTUsagePatternDetail;

