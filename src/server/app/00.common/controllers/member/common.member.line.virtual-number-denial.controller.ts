/**
 * @file common.member.line.virtual-number-denial.ts
 * @author Kangta Kim (kangta.kim@sktelecom.com)
 * @since 2019.11.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import ProductHelper from '../../../../utils/product.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_JOIN_WIRE_SVCATTRCD, NODE_ERROR_MSG } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Request, Response, NextFunction, response } from 'express';
import { Observable } from 'rxjs';
import { request } from 'https';

/**
 * @desc 공통 - 휴대전화 가상번호 제공 거부 등록
 */
class CommonMemberLineVirtualNumberDenial extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // 가상번호 제공 거부는 부가서비스 형태로 처리됨
    // 부가서비스 상품 유형에 따른 가입 가능한 회선 조회
    const allowedSvcAttrInfo: any = ProductHelper.getAllowedSvcAttrCd('C');

    // A : 통화내역 조회 가능 이동전화, Y : 일반 개인 이동전화
    const allowdSvcGr = ['A', 'Y'];

    // 모바일회선 중 svcAttrCd 적합하는 회선만 추출
    const selectedLines = allSvc[allowedSvcAttrInfo.group].filter((lineInfo) => 
      (
        allowedSvcAttrInfo.svcAttrCds.indexOf(lineInfo.svcAttrCd) !== -1
        && allowdSvcGr.indexOf(lineInfo.svcGr) !== -1
      )
    );

    if (FormatHelper.isEmpty(selectedLines)) {
      this.error.render(res, {
        code: API_CODE.NODE_1007,
        msg: NODE_ERROR_MSG[API_CODE.NODE_1007],
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    } else {

    // 가상번호 거부 신청여부 확인할 회선 별 Parameter들 세팅
    const requestIsDeniedParams: Observable<any>[] = selectedLines.map((line) => this.apiService.request(
      API_CMD.BFF_08_0081, { selectedSvcMgmtNum: line.svcMgmtNum }
    ));

    Observable.combineLatest.apply(Observable, requestIsDeniedParams).subscribe((resps: any) => {

      // Render용 데이터 정리
      const deniableLineList: any[] = resps.map((resp, index) => {
        const lineInfo = selectedLines[index];
  
        if (resp.code !== API_CODE.CODE_00) {

          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });

        }
        
        return (
          {
            // 회선명은 별명을 우선적으로 노출, 없으면 기본값 노출
            lineNm: lineInfo.nickNm || MYT_JOIN_WIRE_SVCATTRCD[lineInfo.svcAttrCd],
            svcNum: FormatHelper.conTelFormatWithDash(lineInfo.svcNum),
            eqpMdlNm: lineInfo.svcAttrCd === 'M1' || lineInfo.svcAttrCd === 'M2' ? lineInfo.eqpMdlNm : '',
            isDenied: resp.result.isAdditionUse,
            svcMgmtNum: lineInfo.svcMgmtNum
          }
        );
      });

      res.render('member/common.member.line.virtual-number-denial.html', { svcInfo, pageInfo, deniableLineList });  
    });
    }
  }
}

export default CommonMemberLineVirtualNumberDenial;