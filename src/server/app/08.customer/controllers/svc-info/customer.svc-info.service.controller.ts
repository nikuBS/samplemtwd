

/**
 * FileName: customer.svc-info.service.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.12.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { CUSTOMER_SERVICE_OPTION_TYPE } from '../../../../types/string.type';
import { isArray } from 'util';
import FormatHelper from '../../../../utils/format.helper';

interface CustomerServiceDeps {
  dep_title: string;
  type: string;
  code: string;
}

interface CustomerServiceSubs {
  listIndex?: number;
  subIndex?: number;
  sub_title: string;
  sub_text: string;
  type?: string;
  code?: string;
  dep_list: [CustomerServiceDeps];
}

interface CustomerServiceList {
  unitedTitle?: string;
  united?: string;
  title: string;
  text?: string;
  upperCat?: boolean;
  sub_list: [CustomerServiceSubs];
}

class CustomerUseguideService extends TwViewController {

  constructor() {
    super();
  }

  united: Array<String> = [];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    res.render('svc-info/customer.svc-info.service.html', {
      svcInfo, 
      pageInfo, 
      // data: {list: CUSTOMER_SERVICE_OPTION_TYPE}
      data: {list: this.getFullList()} // 리스트 노출방식 예외 처리를 위해 수정
    });    

  }

  private getFullList = (): Array<CustomerServiceList> => {
    const result = CUSTOMER_SERVICE_OPTION_TYPE.reduce((prev: any, list: any, listIndex) => {
      if (!FormatHelper.isEmpty(list.united)) {
        if (this.isUnited(list.united || '')) {
          return prev;
        } else {
          return prev.concat(this.getUnitedList(list.united || ''));
        }
      } else {
        return prev.concat({
          ...list,
          sub_list: this.getIndexedSubList(list.sub_list, listIndex)
        });
      }
    }, []); 
    return result; 
  }

  // 다른 카테고리 메뉴와 조합되는지 여부 
  private isUnited = (unit_name: string): boolean => {
    let result = false;
    this.united.map(name => {
      if (name === unit_name) {
        result = true;
      }
    });
    if (!result) {
      this.united.push(unit_name);
    }
    return result;
  }

  private getUnitedList = (unit_name: string): CustomerServiceList => {
    const result = CUSTOMER_SERVICE_OPTION_TYPE.reduce((prev: any, list: any, listIndex) => {
      if (list.united === unit_name) {
        const subList = this.getIndexedSubList(list.sub_list, listIndex);
        if (!FormatHelper.isEmpty(prev)) {
          return {
            ...prev,
            sub_list: list.upperCat ? [
              ...prev.sub_list,
              {
                sub_title: list.title,
                sub_text: list.text,
                listIndex: subList[0].listIndex,
                subIndex: subList[0].subIndex,
                dep_list: this.getDepsList(subList)
              }
            ] : [
              ...prev.sub_list,
              ...subList
            ]
          };
        } else {
          return {
            title: list.unitedTitle,
            sub_list: list.upperCat ? [
              {
                sub_title: list.title,
                sub_text: list.text,
                listIndex: subList[0].listIndex,
                subIndex: subList[0].subIndex,
                dep_list: this.getDepsList(subList)
              }
            ] : subList
          };
        }
      } 
      return prev;
    }, {});

    return result;
  }

  // subIndex 추가
  private getIndexedSubList = (sub_list: Array<CustomerServiceSubs>, listIndex:  number): Array<CustomerServiceSubs> => {
    return sub_list.map((list: CustomerServiceSubs, subIndex: number) => {
      return Object.assign(list, { listIndex, subIndex });
    });
  }

  private getDepsList = (sub_list: Array<CustomerServiceSubs>): Array<CustomerServiceDeps> => {
    const result = sub_list.map((list: CustomerServiceSubs) => {
      return {
        dep_title: list.sub_title,
        type: isArray(list.dep_list) ? list.dep_list[0].type : list.type || '',
        code: isArray(list.dep_list) ? list.dep_list[0].code : list.code || ''
      };
    }); 
    return result;
  }
}

export default CustomerUseguideService;
