/**
 * @file product.roaming.fi.reservation.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.11.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import moment from 'moment';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {NODE_ERROR_MSG} from '../../../../types/string.type';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingFiReservation extends TwViewController {

    render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

        // 14세 미만 체크
        this.checkIsOverFourteen(res, svcInfo, pageInfo).subscribe((isOverFourteen) => {
            if (isOverFourteen) {

                const minDate = moment().add(2, 'days').format('YYYY-MM-DD'); // 예약 시작일 default 값 : 현재 날짜 + 2일
                const maxDate = DateHelper.getEndOfMonSubtractDate(undefined, '-6', 'YYYY-MM-DD'); // 예약 종료일 default 값 : 6개월 후 마지막 일
                const formatDate = {minDate, maxDate};
                let step = req.query.step;
                console.log( '#### >>step =>'+step );
                svcInfo.showSvcNum = FormatHelper.conTelFormatWithDash(svcInfo.svcNum);

            //    res.render('roaming/product.roaming.fi.reservation-step1.html', {data:{svcInfo: svcInfo, pageInfo: pageInfo, formatDate: formatDate}});
            //   res.render('roaming/product.roaming.fi.reservation.org.html', {svcInfo: svcInfo, pageInfo: pageInfo, formatDate: formatDate});
                res.render('roaming/product.roaming.fi.reservation.html', {data:{svcInfo: svcInfo, pageInfo: pageInfo, formatDate: formatDate}});
            //    res.render('roaming/product.roaming.fi.reservation.test.html', {data:{svcInfo: svcInfo, pageInfo: pageInfo, formatDate: formatDate}});
            
            } else {
                this.showError(res, svcInfo, pageInfo, API_CODE.NODE_1009, NODE_ERROR_MSG[API_CODE.NODE_1009]);
            }
        });
    }



    /**
     * @function
     * @desc 14세 이상 확인
     * @param  {Response} res - Response
     * @param  {any} svcInfo - 사용자 정보
     * @param  {any} pageInfo - page 정보
     * @returns Observable BFF로 조회된 결과를 Observable로 return
     */
    private checkIsOverFourteen(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
        return this.apiService.request(API_CMD.BFF_08_0080, {/*mbrChlId : svcInfo.mbrChlId*/}).map((resp) => {
            if (resp.code === API_CODE.CODE_00) {
                return resp.result.age >= 19 ? true : false;
            }
            this.showError(res, svcInfo, pageInfo, resp.code, resp.msg);
            return false;
        });
    }

    private showError(res: Response, svcInfo: any, pageInfo: any, code: string, msg: string) {
        this.error.render(res, {
            code: code,
            msg: msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
        });
    }
}
