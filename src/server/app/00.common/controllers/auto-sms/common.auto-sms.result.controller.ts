/**
 * FileName: common.auto-sms.result.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.03.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { isArray } from 'util';

interface CommonList {
  title: string;
  list: SubList[];
  table: string[][];
  table_sub?: string;
}

interface SubList {
  span1: string;
  span2: string;
  classOption: boolean; // txt-smaller 리스트 예외 클래스 주기 위함
}
interface ResListType {
  msgLvl1: string;
  msgLvl2: string;
  msgLvl3: string;
  msgLvl4: string;
  tmpltId: string;
  msgCtt: string;
}

enum TableCase {
  cell = 'W18-0000062',
  note = 'W18-0000063'
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
          const welcomeSubTxt = welcomeTxtArr.slice(1).join('<br />') || '';
          
          
          res.render('auto-sms/common.auto-sms.result.html', { pageInfo, data: Object.assign({}, resp.result,
            {
              welcomeTxt,
              welcomeSubTxt,
              phoneList: this._getCommonList(resp.result.myPhonInfoList, 3), // list 1 핸드폰
              agreeList: this._getCommonList(resp.result.agreeInfoList, 2, ['W18-0000030', 'W18-0000073']), // list 2 약정
              planList: this._getCommonList(resp.result.pricePlanInfoList, 3), // list 3 부가서비스
              payList: this._getCommonList(resp.result.payInfoList, 1), // list 4 납부청구
              familyList: this._getCommonList(resp.result.combFmlyInfoList, 2), // list 5 가족관계 멤버십
              GuidList: this._getCommonList(resp.result.mndtGuidInfoList, 4) // list 6 필수안내사항
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
          prev.push({title: o.msgCtt, list: [], table: []}); 
        } else if (TableCase.note === o.tmpltId) {
          // 표 하단 노트 케이스
          prev[prev.length - 1].table_sub = o.msgCtt;
        } else if (TableCase.cell === o.tmpltId) {
          // 표 케이스
          if (!prev.length) {
            prev.push({title: '', list: [], table: [] });
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
            prev.push({title: '', list: [curList], table: [] });
          } else {
            prev[prev.length - 1].list.push(curList);
          }
        }
      }
      
      return prev;
    }, []) : [];
  }

  private _exceptCase = (id: string, arr: string[]): boolean => {
    const result = arr.length ? arr.map(code => id === code ? '1' : '') : [];
    return result.join('').indexOf('1') >= 0;
  }
  
}

export default CommonAutoSmsResult;
