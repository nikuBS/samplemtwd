/**
 * FileName: customer.researches.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { RESEARCH_EXAMPLE_TYPE } from '../../../../types/string.old.type';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';


interface IResearchBFF {
  bnnrRsrchId: string; // 배너리서치ID
  bnnrRsrchTypCd: string; // 배너리서치유형코드(R:설문조사, P:POLL, Q:QUIZ)
  bnnrRsrchTitleNm: string; // 배너리서치제목
  cmplYn: string; // 참여여부
  staDtm: string; // 시작년월일
  endDtm: string; // 종료년월일
  bnnrRsrchRpsTypCd?: string; // 응답유형코드(S:단일, C:복수)
  bnnrRsrchSortMthdCd?: string; // 좌우정렬방식
  hintExUrl?: string; // POLL:사용안함, Quiz : 힌트보기URL , 설문조사 : 설문ID(qstn_id)
  exCttCnt?: string; // 총 보기 건수
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

interface ISimpleResearch {
  id: string; // 리서치 ID
  type: string; // 리서치 타입
  title: string; // 리서치 타이틀
  isMultiple: boolean; // 응답유형 코드
  isMultiStage: boolean; // 정렬 타입 
  startDate: string; // 설문 시작일
  endDate: string; // 설문 종료일
  motHtml?: string; // mot HTML 내용
  isProceeding: boolean; // 설문 진행여부
  examples: IExample[]; // 보기 배열
  hintUrl?: string; // 힌트 URL
  answerNum?: string;
}

interface IExample {
  content: string; // 보기 내용
  isEtc: boolean; // 기타항목 여부
  image?: string; // 보기 이미지
  motHtml?: string; // 보기 MOT
}

interface IStepResearch {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  questionCount: number;
  questions: { [key: number]: IStepQuestion };
  htmlContent?: string;
}

interface IStepQuestion {
  content: string;
  isMultiple: boolean;
  isMultiStage: boolean;
  isNecessary: boolean;
  answerType: string;
  htmlContent?: string;
  examples?: { [key: number]: IStepExample };
}

interface IStepExample {
  content: string;
  nextQuestion: number;
  isEtc: boolean;
}


export default class CustomerResearches extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if (req.params.researchId) {
      this.apiService.request(API_CMD.BFF_08_0038, { qstnId: req.params.researchId }).subscribe(resp => {
        const research: IStepResearch = this.getProperResearchData(resp.result);
        res.render('researches/customer.researches.research.html', { svcInfo, research });
      });
    } else {
      this.apiService.request(API_CMD.BFF_08_0023, {}).subscribe(resp => {
        const researches = resp.result.map(this.setData);
        res.render('researches/customer.researches.html', { svcInfo, researches });
      });
    }
  }

  private setData = (research: IResearchBFF): ISimpleResearch => {
    const examples: IExample[] = [];
    const count = Number(research.exCttCnt);

    for (let i = 0; i < count; i++) {
      const idx = i + 1;
      const isEtc = idx === count && research['exCtt' + idx] === 'QSTNETC';

      examples.push({
        content: isEtc ? RESEARCH_EXAMPLE_TYPE.ETC : research['exCtt' + idx] || '',
        image: research['exImgFilePathNm' + idx],
        motHtml: research['motExCtt' + idx],
        isEtc
      });
    }

    return {
      id: research.bnnrRsrchId,
      type: research.bnnrRsrchTypCd,
      title: research.bnnrRsrchTitleNm,
      isMultiple: research.bnnrRsrchRpsTypCd === 'C',
      isMultiStage: research.bnnrRsrchSortMthdCd === 'D',
      startDate: research.staDtm,
      endDate: research.endDtm,
      motHtml: research.motMsgHtmlCtt,
      isProceeding: DateHelper.getDifference(research.endDtm.replace(/\./g, '')) > 0,
      examples,
      hintUrl: this.getUrlFromHint(research.hintExUrl),
      answerNum: research.canswNum
    };
  }

  private getUrlFromHint = (hint: string = '') => {
    const HINT_REGEX = /^(?:goLink\('|")?([/\w\.\?#:]+)(?:"|'.*)?$/;

    const matches = hint.match(HINT_REGEX);
    if (matches) {
      const url = matches[1];
      return !url.includes('http') && FormatHelper.removeNumber(url) ? 'http://' + matches[1] : url;
    }

    return hint;
  }

  private getProperResearchData = (research: any): IStepResearch => {
    const researchData = research.surveyQstnMaster[0] || {};
    const questionData: any[] = research.surveyQstnInqItm;
    const exampleData: any[] = research.surveyQstnAnswItm;
    const questions: { [key: number]: IStepQuestion } = {};

    for (let i = 0; i < questionData.length; i++) {
      const question = questionData[i];
      const idx = Number(question.inqItmNum);

      let examples: { [key: number]: IStepExample } | undefined;

      if (question.inqItmTypCd !== '2') {
        examples = {};
      }

      questions[idx] = {
        content: question.inqDtlCtt,
        answerType: question.inqItmTypCd,
        isMultiple: question.inqItmTypCd === '1',
        isMultiStage: question.inqSortMthdCd === 'D',
        isNecessary: question.mndtAnswYn === 'Y',
        htmlContent: question.inqItmHtmlCtt,
        examples
      };
    }

    for (let i = 0; i < exampleData.length; i++) {
      const example = exampleData[i];
      const questionIdx = Number(example.inqItmNum);
      const exampleIdx = Number(example.answItmNum);
      const question = questions[questionIdx];
      const isEtc = example.answItmCtt === 'QSTNETC';

      if (question && question.examples) {
        question.examples[exampleIdx] = {
          content: isEtc ? RESEARCH_EXAMPLE_TYPE.ETC : example.answItmCtt || '',
          nextQuestion: Number(example.nxtInqItmNum),
          isEtc
        };
      }
    }

    return {
      id: researchData.qstnId,
      title: researchData.qstnTitleNm,
      startDate: researchData.staDtm,
      endDate: researchData.endDtm,
      questionCount: researchData.totInqItmNum,
      questions,
      htmlContent: researchData.qstnHtmlCtt,
    };
  }
}
