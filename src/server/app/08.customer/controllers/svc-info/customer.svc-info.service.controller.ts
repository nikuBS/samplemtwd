/**
 * @file [이용안내-서비스_이용안내]
 * @author Lee Kirim
 * @since 2018-12-18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { CUSTOMER_SERVICE_OPTION_TYPE } from '../../../../types/string.type';
import { isArray } from 'util';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @interface
 * @desc dep list 형태 
 */
interface CustomerServiceDeps {
  dep_title: string; // 상세 제목
  type: string; // 콘텐츠 노출 형태 타입 현재는 사용하지 않음 (어드민에서 등록 되는 콘텐츠 그대로 뿌려줌)
  code: string; // 상세조회시 사용되는 코드
}

/**
 * @interface
 * @desc sub list 형태
 */
interface CustomerServiceSubs {
  listIndex?: number; // list index
  subIndex?: number; // sub list index
  sub_title: string; // 타이틀
  sub_text: string; // 설명
  type?: string; // dep list 의 type 과 상동
  code?: string; // dep list 없을 경우 조회 코드 
  dep_list: [CustomerServiceDeps];
}

/**
 * @interface
 * @desc 렌더링에 전송될 리스트 형태
 */
interface CustomerServiceList {
  unitedTitle?: string; // 다른카테고리와 연동되었을 경우 해당 타이틀 사용
  united?: string; // 다른 카테고리와 연동되었는지 여부
  title: string; // 디폴트 타이틀
  text?: string; // 카테고리 설명 
  upperCat?: boolean; // 서브리스트를 뎁 리스트로 옮길것인지 여부
  sub_list: [CustomerServiceSubs]; // 
}

class CustomerUseguideService extends TwViewController {

  constructor() {
    super();
  }

  united: Array<String> = [];

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any): void {
    res.render('svc-info/customer.svc-info.service.html', {
      svcInfo, 
      pageInfo, 
      data: {list: this.getFullList()} // 리스트 노출방식 예외 처리를 위해 수정
    });    

  }

  /**
   * @function
   * @desc CUSTOMER_SERVICE_OPTION_TYPE 에서 렌더링에 적합한 형태로 변경해 반환
   * @returns {Array<CustomerServiceList>}
   */
  private getFullList = (): Array<CustomerServiceList> => {
    const result = CUSTOMER_SERVICE_OPTION_TYPE.reduce((prev: any, list: any, listIndex) => {
      // 카테고리가 합쳐져야 하는 경우 실행됨
      if (!FormatHelper.isEmpty(list.united)) {
        if (this.isUnited(list.united)) {
          return prev;
        } else {
          return prev.concat(this.getUnitedList(list.united));
        }
      } else {
        // 디폴트 케이스
        return prev.concat({
          ...list,
          sub_list: this.getIndexedSubList(list.sub_list, listIndex)
        });
      }
    }, []); 
    return result; 
  }
  
  /**
   * @function
   * @desc 다른 카테고리 메뉴와 조합되는지 여부 AS-IS에서 카테고리가 다르지만 카테고리를 함께 보여주는 케이스가 있음
   * 두 카테고리가 이미 연결 되어 리스트에 포함되어있는지 여부
   * @param {string} unit_name
   * @return {boolean}
   */
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

  /**
   * @function
   * @desc isUnited 에서 false 반환시 호출됨
   * @return {CustomerServiceList}
   */
  private getUnitedList = (unit_name: string): CustomerServiceList => {
    const result = CUSTOMER_SERVICE_OPTION_TYPE.reduce((prev: any, list: any, listIndex) => {
      if (list.united === unit_name) {
        const subList: CustomerServiceSubs[] = this.getIndexedSubList(list.sub_list, listIndex);
        if (!FormatHelper.isEmpty(prev)) {
          return {
            ...prev,
            sub_list: list.upperCat ? [
              ...prev.sub_list,
              {
                sub_title: list.title,
                sub_text: list.text,
                listIndex: subList[0].listIndex, // maybe always listIndex
                subIndex: subList[0].subIndex, // maybe always 0
                dep_list: this.getDepsList(subList) // upperCat 옵션이 있는 경우 sub_list 를 dep_list 로 구조를 변경한다.
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
                listIndex: subList[0].listIndex, // maybe always listIndex
                subIndex: subList[0].subIndex, // maybe always 0
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

  /**
   * @function
   * @desc 파라미터로 전달된 리스트 각 객체에 listIndex(전달인자), subIndex 번호 넘버링
   * @param {CustomerServiceSubs[]} sub_list
   * @param {number} listIndex
   * @return {CustomerServiceSubs[]} 
   */
  private getIndexedSubList = (sub_list: Array<CustomerServiceSubs>, listIndex:  number): Array<CustomerServiceSubs> => {
    return sub_list.map((list: CustomerServiceSubs, subIndex: number) => {
      return Object.assign(list, { listIndex, subIndex });
    });
  }

  /**
   * @funcion
   * @desc upperCat 옵션이 있는 경우 sub_list 를 dep_list 와 같은 형태로 반환한다. (deps_list 는 렌더링에서 카테고리 셀렉트 박스 옵션에 해당한다)
   * @param {CustomerServiceSubs[]}
   * @return {CustomerServiceDeps[]}
   */
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
