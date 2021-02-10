/**
 * @file product.roaming.fi.reservation.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.11.16
*/
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils_en/date.helper';
import FormatHelper from '../../../../utils/Format.helper';
import moment from 'moment';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingFiReservationComplete extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const boothCd   = req.query.boothCd;
    // const rentfrom  = FormatHelper.conDateFormatWithDash(req.query.rentfrom);
    // const rentto    = FormatHelper.conDateFormatWithDash(req.query.rentto);
    console.log(req.query.rentfrom);
    console.log(req.query.rentto);
    const rentfrom  = moment(DateHelper.convDateFormat(req.query.rentfrom)).format('YYYY. M. DD.');
    const rentto    = moment(DateHelper.convDateFormat(req.query.rentto)).format('YYYY. M. DD.');
    
    const countryArr= req.query.countryArr;

 //   const centerInfo  = ROAMING_RECEIVE_CODE[boothCd];

    const data = {
      rentInfo:{
        countryArr:countryArr
        ,rentfrom :rentfrom
        ,rentto   :rentto
        ,boothCd  :boothCd
      }
     // ,centerInfo:centerInfo
    };

//    console.log('centerInfo ==>'+centerInfo);
/*
    switch (selectIdx) {
      case '0':
        // 인천공항 1터미널 3층 로밍센터(F 카운터)
        centerImg = 'place-img-01-f';
        break;
      case '1' :
        // 인천공항 1터미널 3층 로밍센터(H 카운터)
        centerImg = 'place-img-01-h';
        break;
      case '2' :
        // 인천공항 2터미널 3층 로밍센터(D-E 카운터)
        centerImg = 'place-img-02-de';
        break;
      case '3' :
        // 김포공항 1층 로밍센터
        centerImg = 'place-img-03';
        break;
      case '4' :
        // 제주공항 국제선 1층 로밍센터
        centerImg = 'place-img-04';
        break;
      case '5' :
        // 김해공항 3층 로밍센터
        centerImg = 'place-img-05';
        break;
      case '6' :
        // 대구공항 2층 로밍센터
        centerImg = 'place-img-06';
        break;
      case '7' :
        // 부산항 국제여객터미널 2층 로밍센터
        centerImg = 'place-img-08';
        break;
      case '8' :
        // 대구 SKT 황금점 매장
        centerImg = 'place-img-10';
        break;
      default : break;
    }

    const data = {
      centerName,
      centerImg
    };
*/
    res.render('roaming/product.roaming.fi.reservation-complete.html',
      { svcInfo : svcInfo , pageInfo : pageInfo, data : data });
  }
}
