/*
 * FileName: product.dis-pgm.detail.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';

class ProductDisPgmDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.params && req.params.prodId || '';
    const selMonth = req.query && req.query.type || '';
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId
    };
    if ( prodId === 'NA00004430' ) {
      if ( selMonth === 'M0012' ) {
        data.selMonth = '12';
      } else if ( selMonth === 'M0024' ) {
        data.selMonth = '24';
      }

      Observable.combineLatest(
        /*this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId),*/
        this.apiService.request(API_CMD.BFF_10_0062, {}, {}, prodId)
      ).subscribe(([seldisSets /*,joinTermInfo*/]) => {
        if ( seldisSets.code === API_CODE.CODE_00 ) {
          data.isContractPlan = (seldisSets.result.isNoContractPlanYn === 'Y');
          data.contractPlanPoint = FormatHelper.addComma(seldisSets.result.noContractPlanPoint);
        } else {
          return this.error.render(res, {
            code: seldisSets.code,
            msg: seldisSets.msg,
            svcInfo: svcInfo,
            title: '가입'
          });
        }
       /* if ( joinTermInfo.code === API_CODE.CODE_00 ) {
          data.preinfo = this._convertAdditionsPreInfo(joinTermInfo.preinfo);
          data.stipulationInfo = this._convertStipulationInfo(joinTermInfo.stipulationInfo);
        } else {
          return this.error.render(res, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg,
            svcInfo: svcInfo,
            title: '가입'
          });
        }*/
        res.render('product.sel-contract.input.html', { data });
      });
    }
  }

  _convertAdditionsPreInfo(preInfo): any {
    const isNumberBasFeeInfo = !isNaN(parseInt(preInfo.reqProdInfo.basFeeInfo, 10));

    return Object.assign(preInfo, {
      reqProdInfo: Object.assign(preInfo.reqProdInfo, {
        isNumberBasFeeInfo: isNumberBasFeeInfo,
        basFeeInfo: isNumberBasFeeInfo ? FormatHelper.addComma(preInfo.reqProdInfo.basFeeInfo) : preInfo.reqProdInfo.basFeeInfo
      }),
      autoJoinList: this._convertAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: this._convertAutoJoinTermList(preInfo.autoTermList)
    });
  }

  _convertAutoJoinTermList(autoList): any {
    const autoListConvertResult: any = [];

    autoList.forEach((item) => {
      if ( FormatHelper.isEmpty(autoListConvertResult[item.svcProdCd]) ) {
        autoListConvertResult[item.svcProdCd] = {
          svcProdNm: item.svcProdNm,
          svcProdList: []
        };
      }

      autoListConvertResult[item.svcProdCd].svcProdList.push(item.prodNm);
    });

    return autoListConvertResult;
  }

  _convertStipulationInfo(stipulationInfo): any {
    if ( FormatHelper.isEmpty(stipulationInfo) || FormatHelper.isEmpty(stipulationInfo.stipulation) ) {
      return null;
    }

    return Object.assign(stipulationInfo, {
      stipulation: Object.assign(stipulationInfo.stipulation, {
        scrbStplAgreeCttSummary: stipulationInfo.stipulation.scrbStplAgreeYn === 'Y' ?
          this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.scrbStplAgreeHtmlCtt) : '',
        psnlInfoCnsgCttSummary: stipulationInfo.stipulation.psnlInfoCnsgAgreeYn === 'Y' ?
          this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.psnlInfoCnsgHtmlCtt) : '',
        psnlInfoOfrCttSummary: stipulationInfo.stipulation.psnlInfoOfrAgreeYn === 'Y' ?
          this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.psnlInfoOfrHtmlCtt) : '',
        adInfoOfrCttSummary: stipulationInfo.stipulation.adInfoOfrAgreeYn === 'Y' ?
          this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.psnlInfoCnsgHtmlCtt) : '',
        existsCount: this._getStipulationYnCnt([stipulationInfo.stipulation.scrbStplAgreeYn, stipulationInfo.stipulation.psnlInfoCnsgAgreeYn,
          stipulationInfo.stipulation.psnlInfoOfrAgreeYn, stipulationInfo.stipulation.adInfoOfrAgreeYn])
      })
    });
  }

  _getStripTagsAndSubStrTxt(html): any {
    return html.replace(/(<([^>]+)>)|&nbsp;/ig, '');
  }

  _getStipulationYnCnt(yNarray): any {
    let count = 0;

    yNarray.forEach((flag) => {
      if ( flag === 'Y' ) {
        count++;
      }
    });

    return count;
  }
}

export default ProductDisPgmDetail;
