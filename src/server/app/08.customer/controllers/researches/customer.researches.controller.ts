/*
 * FileName: customer.researches.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';

interface IResearch {
  bnnrRsrchTypCd: string; // 배너리서치유형코드(R:설문조사, P:POLL, Q:QUIZ)
  bnnrRsrchTitleNm: string; // 배너리서치제목
  bnnrRsrchRpsTypCd: string; // 응답유형코드(S:단일, C:복수)
  bnnrRsrchSortMthdCd: string; // 좌우정렬방식
  hintExUrl: string; // POLL:사용안함, Quiz : 힌트보기URL , 설문조사 : 설문ID(qstn_id)
  cmplYn: string; // 참여여부
  staDtm: string; // 시작년월일
  endDtm: string; // 종료년월일
  motMsgHtmlCtt: string; // MOT메시지HTML내용
  canswNum?: string; // 정답번호(QUIZ)
  result?: IExample[]; // 보기 목록
  isProceeding?: boolean; // 종료 여부
}

interface IExample {
  exCtt: string; // 보기내용
  motExCtt?: string; // MOT
  exImgFilePathNm?: string; // 보기이미지
}

export default class CustomerResearches extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if (req.params.researchId) {
      res.render('researches/customer.researches.research.html', { svcInfo });
    } else {
      const mock: IResearch[] = [{
        bnnrRsrchTypCd: 'R',
        bnnrRsrchTitleNm: 'SKT 중고 거래 앱 서비스는 무엇일까요?',
        bnnrRsrchRpsTypCd: 'S',
        bnnrRsrchSortMthdCd: '',
        hintExUrl: '',
        cmplYn: 'N',
        canswNum: '',
        staDtm: '2018.07.19',
        endDtm: '2018.12.31',
        motMsgHtmlCtt: '<button class="bt-link-tx mb20">생활플랫폼 서비스 자세히보기<span class="ico"></span></button>',
        result: [{
          exCtt: 'T apps',
        }, {
          exCtt: 'T freemium',
        }, {
          exCtt: '딜라이트 딜라이트 딜라이트 딜라이트 딜라이트 딜라이트 딜라이트 딜라이트',
        }, {
          exCtt: 'T 가이드',
        }]
      }, {
        bnnrRsrchTypCd: 'R',
        bnnrRsrchTitleNm: '생활플랫폼 CF 중 인상이 많이 남는 모델은?',
        bnnrRsrchRpsTypCd: 'C',
        bnnrRsrchSortMthdCd: 'D',
        hintExUrl: '',
        cmplYn: 'N',
        canswNum: '',
        staDtm: '2018.07.19',
        endDtm: '2018.12.31',
        motMsgHtmlCtt: '<button class="bt-link-tx mb20">생활플랫폼 서비스 자세히보기<span class="ico"></span></button>',
        result: [{
          exCtt: '요즘 대세 설현',
          exImgFilePathNm: '/img/dummy/dummy_poll03.jpg'
        }, {
          exCtt: '폼나는 조진웅',
          exImgFilePathNm: '/img/dummy/dummy_poll04.jpg'
        }, {
          exCtt: '요즘 대세 설현',
          exImgFilePathNm: '/img/dummy/dummy_poll03.jpg'
        }, {
          exCtt: '잘 모르겠다',
          exImgFilePathNm: '/img/dummy/dummy_poll04.jpg'
        }]
      }, {
        bnnrRsrchTypCd: 'R',
        bnnrRsrchTitleNm: 'SKT 중고 거래 앱 서비스는 무엇일까요?',
        bnnrRsrchRpsTypCd: 'S',
        bnnrRsrchSortMthdCd: 'D',
        hintExUrl: '',
        cmplYn: 'N',
        canswNum: '',
        staDtm: '2018.07.19',
        endDtm: '2018.07.29',
        motMsgHtmlCtt: '<button class="bt-link-tx mb20">생활플랫폼 서비스 자세히보기<span class="ico"></span></button>',
      }].map(this.isOpen);

      res.render('researches/customer.researches.html', { svcInfo, researches: mock });
    }
  }

  private isOpen(research: IResearch): IResearch {
    return {
      ...research,
      isProceeding: DateHelper.getDifference(research.endDtm) > 0
    };
  }
}
