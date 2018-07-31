/*
 * FileName: customer.researches.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { Researches } from '../../../../mock/server/customer.researches.mock';


interface IResearchBFF {
  bnnrRsrchId: string; // 배너리서치ID
  bnnrRsrchTypCd: string; // 배너리서치유형코드(R:설문조사, P:POLL, Q:QUIZ)
  bnnrRsrchTitleNm: string; // 배너리서치제목
  bnnrRsrchRpsTypCd: string; // 응답유형코드(S:단일, C:복수)
  bnnrRsrchSortMthdCd: string; // 좌우정렬방식
  hintExUrl: string; // POLL:사용안함, Quiz : 힌트보기URL , 설문조사 : 설문ID(qstn_id)
  cmplYn: string; // 참여여부
  staDtm: string; // 시작년월일
  endDtm: string; // 종료년월일
  exCttCnt: string; // 총 보기 건수
  motMsgHtmlCtt?: string; // MOT메시지HTML내용
  exCtt1?: string; // 보기1,          
  exCtt2?: string; // 보기2          
  exCtt3?: string; // 보기3          
  exCtt4?: string; // 보기4          
  exImgFilePathNm1?: string; // 이미지1
  exImgFilePathNm2?: string; // 이미지2
  exImgFilePathNm3?: string; // 이미지3
  exImgFilePathNm4?: string; // 이미지4         
  motExCtt1?: string; // mot보기1
  motExCtt2?: string; // mot보기2
  motExCtt3?: string; // mot보기3
  motExCtt4?: string; // mot보기4
  canswNum?: string; // 정답번호(QUIZ)
}

interface IResearch {
  id: string; // 리서치 ID
  type: string; // 리서치 타입
  title: string; // 리서치 타이틀
  isMultiple: boolean; // 응답유형 코드
  isMultiStage: boolean; // 정렬 타입 
  isParticipate: boolean; // 참여 여부
  startDate: string; // 설문 시작일
  endDate: string; // 설문 종료일
  motHtml?: string; // mot HTML 내용
  isProceeding: boolean; // 설문 진행여부
  examples: IExample[]; // 보기 배열
  hintUrl?: string; // 힌트 URL
}



interface IExample {
  content: string; // 보기 내용
  image?: string; // 보기 이미지
  motHtml?: string; // 보기 MOT
}

export default class CustomerResearches extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if (req.params.researchId) {
      res.render('researches/customer.researches.research.html', { svcInfo });
    } else {
      const mock: IResearch[] = Researches.map(this.isOpen);

      res.render('researches/customer.researches.html', { svcInfo, researches: mock });
    }
  }

  private isOpen(research: IResearchBFF): IResearch {
    const examples: IExample[] = [];
    const count = Number(research.exCttCnt);

    for (let i = 0; i < count; i++) {
      const idx = i + 1;
      examples.push({
        content: research['exCtt' + idx] || '',
        image: research['exImgFilePathNm' + idx],
        motHtml: research['motExCtt' + idx],
      });
    }

    return {
      id: research.bnnrRsrchId,
      type: research.bnnrRsrchTypCd,
      title: research.bnnrRsrchTitleNm,
      isMultiple: research.bnnrRsrchRpsTypCd === 'C',
      isMultiStage: research.bnnrRsrchSortMthdCd === 'D',
      isParticipate: research.cmplYn === 'Y',
      startDate: research.staDtm,
      endDate: research.endDtm,
      motHtml: research.motMsgHtmlCtt,
      isProceeding: DateHelper.getDifference(research.endDtm) > 0,
      examples,
      hintUrl: research.hintExUrl
    };
  }
}
