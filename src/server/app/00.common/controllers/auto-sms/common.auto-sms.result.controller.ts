/**
 * @file common.auto-sms.result.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.03.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


// BFF_05_0020 으로 전달받는 각 목록의 구성
interface ResListType {
  msgLvl1: string;
  msgLvl2: string;
  msgLvl3: string;
  msgLvl4: string;
  tmpltId: string;
  msgCtt: string;
}

// 각 목록의 최종 형태
interface CommonList {
  title: string;
  list: SubList[];
  table: string[][];
  table_sub?: string;
}

// 목록 하위 리스트 형태
interface SubList {
  span1: string;
  span2: string;
  classOption: boolean; // txt-smaller 리스트 예외 클래스 주기 위함
}

// 테이블일때의 케이스
enum TableCase {
  cell = 'W18-0000062',
  note = 'W18-0000063'
}

// 목록 리스트
enum TitleList {
  '내 휴대폰',
  '약정할인혜택',
  '요금제부가서비스',
  '납부청구정보',
  '가족결합멤버십',
  '필수 안내 사항'
}

class CommonAutoSmsResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0200, {})
      .subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          // welcomeTxt
          const welcomeTxtArr = resp.result.welcomeTxt.split('<br />');
          const welcomeTxt = welcomeTxtArr[0];
          const welcomeSubTxt = welcomeTxtArr.slice(1) ? (welcomeTxtArr.slice(1).join('<br />') || '') : '';

          const infoList = [
            { listT: TitleList[0], content: this._getCommonList(resp.result.myPhonInfoList, 3) }, // list 1 핸드폰
            { listT: TitleList[1], content: this._getCommonList(resp.result.agreeInfoList, 2, ['W18-0000030', 'W18-0000073']) }, // list 2 약정
            { listT: TitleList[2], content: this._getCommonList(resp.result.pricePlanInfoList, 3) }, // list 3 부가서비스
            { listT: TitleList[3], content: this._getCommonList(resp.result.payInfoList, 1) }, // list 4 납부청구
            { listT: TitleList[4], content: this._getCommonList(resp.result.combFmlyInfoList, 2) }, // list 5 가족관계 멤버십
            { listT: TitleList[5], content: this._getCommonList(resp.result.mndtGuidInfoList, 4) } // list 6 필수안내사항
          ];

          res.render('auto-sms/common.auto-sms.result.html', { pageInfo, data: Object.assign({}, resp.result,
            {
              welcomeTxt,
              welcomeSubTxt,
              infoList
            }  
          ) });
        } else {
          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });

  }

  // 리스트 
  private _getCommonList = (resList: ResListType[], showLv: number, classCode: string[] = []): CommonList[] => {
    return resList.length ? resList.reduce((prev: CommonList[], o: ResListType): CommonList[] => {
      // 노출여부 1 ~ showLv
      const msgLvl1 = parseFloat(o.msgLvl1);
      if ( msgLvl1 > 0 && msgLvl1 <= showLv) {
        // 제목여부 0 or 리스트
        if (o.msgLvl2 === '0') {
          prev.push(this._makeNewList());
          prev[prev.length - 1].title = o.msgCtt;
        } else if (TableCase.note === o.tmpltId) {
          // 표 하단 노트 케이스
          prev[prev.length - 1].table_sub = o.msgCtt;
        } else if (TableCase.cell === o.tmpltId) {
          // 표 케이스
          if (!prev.length) {
            prev.push(this._makeNewList());
          }
          prev[prev.length - 1].table.push(o.msgCtt.split('/'));
          
        } else {
          // 리스트 케이스
          o.msgCtt = o.msgCtt.indexOf('-') === 0 ? o.msgCtt.replace('- ', '') : o.msgCtt;
          const listArr = o.msgCtt.indexOf('href') >= 0 ? [o.msgCtt] : o.msgCtt.split(':'); // 링크케이스 제외
          const curList = {
            span1: listArr[0].trim(), 
            span2: listArr.slice(1) ? listArr.slice(1).join('') : '',
            classOption: this._exceptCase(o.tmpltId, classCode) || listArr[0].indexOf('*') === 0
          };
          if (!prev.length) {
            prev.push(this._makeNewList());
          } 
          prev[prev.length - 1].list.push(curList);
          
        }
      }
      
      return prev;
    }, []) : [];
  };

  private _makeNewList = () => ({title: '', list: [], table: [] });

  private _exceptCase = (id: string, arr: string[]): boolean => {
    const result = arr.length ? arr.map(code => id === code ? '1' : '') : [];
    return result.join('').indexOf('1') >= 0;
  }
  
}

export default CommonAutoSmsResult;
