/*
 * FileName: customer.researches.result.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.08.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { RESEARCH_EXAMPLE_TYPE } from '../../../../types/string.type';

interface IResultBFF {
  bnnrRsrchId: string; // 리서치 ID, '0132',
  bnnrRsrchTypCd: string; // 배너리서치유형코드(P:POLL, Q:QUIZ), 'Q',
  bnnrRsrchTitleNm: string; // 배너리서치제목, '요즘 조진웅이 광고하는 가족 간 소통앱은 무엇일까요? ',
  staDtm: string; // 시작년월일, '2016.06.22',
  endDtm: string; // 종료년월일, '2017.03.29',
  bnnrRsrchRpsTypCd: string; // 응답유형코드(S:단일, C:복수), 'R',
  exCtt1?: string; // 보기내용1, 'T 페이',
  exCtt2?: string; // 보기내용2, '케이크',
  exCtt3?: string; // 보기내용3, '딜라이트',
  exCtt4?: string; // 보기내용4, '쿠키즈',
  canswNum: string; // 정답번호(QUIZ), '2',
  motMsgHtmlCtt?: string; // MOT메세지HTML, "<P>MOT메세지<P>",
  hintExUrl?: string; // POLL:사용안함, Quiz : 힌트보기URL, 'goLink(\'youtu.be/_o0zkUbkUpg\',\'Y\',\'H0002\');',
  rpsCtt1Cnt?: number; // 결과1 건수, 1,
  rpsCtt2Cnt?: number; // 결과2 건수, 2,
  rpsCtt3Cnt?: number; // 결과3 건수, 1,
  rpsCtt4Cnt?: number; // 결과4 건수, 2,
  totRpsCnt: number; // 토탈 건수, 6 
}

interface IResult {
  type: string;
  title: string;
  startDate: string;
  endDate: string;
  examples: IExample[];
  totalCount: number;
  mot?: string;
}

interface IExample {
  content: string;
  count: number;
  rate: number;
  isAnswer: boolean;
}

export default class CustomerResearchResult extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_08_0024, { bnnrRsrchId: req.query.researchId }).subscribe((resp: { result: IResultBFF[] }) => {
      const result = this.getProperData(resp.result[0]);
      res.render('researches/customer.researches.result.html', { svcInfo, result });
    });
  }

  private getProperData(result: IResultBFF): IResult {
    const examples: IExample[] = [];

    let i = 1;
    const totalCount = result.totRpsCnt;
    const answer = Number(result.canswNum || 0);

    while (result['exCtt' + i]) {
      const content = result['exCtt' + i];
      examples.push({
        content: content === 'QSTNETC' ? RESEARCH_EXAMPLE_TYPE.ETC : content,
        count: result['rpsCtt' + i + 'Cnt'],
        rate: totalCount === 0 ? 0 : Math.floor(result['rpsCtt' + i + 'Cnt'] / totalCount * 100),
        isAnswer: answer === i
      });
      i++;
    }

    return {
      type: result.bnnrRsrchTypCd,
      title: result.bnnrRsrchTitleNm,
      startDate: result.staDtm,
      endDate: result.endDtm,
      mot: result.motMsgHtmlCtt,
      examples,
      totalCount
    };
  }
}
