import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class CustomerAgentsearch extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const filter = req.query.location || 'all';
    const locationInfo = {busan: 'true',
                        gwangju: 'true',
                        gyeonggi: 'true',
                        gyeongsangnamdo: 'true',
                        seoul: 'true',
                        ulsan : 'true',
                        agentNumber : 25,
                        filterNm : 'All'};
    if (filter === 'busan') {
      locationInfo.busan = 'true';
      locationInfo.gwangju = 'false';
      locationInfo.gyeonggi = 'false';
      locationInfo.gyeongsangnamdo = 'false';
      locationInfo.seoul = 'false';
      locationInfo.ulsan = 'false';
      locationInfo.agentNumber = 1;
      locationInfo.filterNm = 'Busan';
    }
    else if (filter === 'gwangju') {
      locationInfo.busan = 'false';
      locationInfo.gwangju = 'true';
      locationInfo.gyeonggi = 'false';
      locationInfo.gyeongsangnamdo = 'false';
      locationInfo.seoul = 'false';
      locationInfo.ulsan = 'false';
      locationInfo.agentNumber = 1;
      locationInfo.filterNm = 'Gwangju';
    }
    else if (filter === 'gyeonggi') {
      locationInfo.busan = 'false';
      locationInfo.gwangju = 'false';
      locationInfo.gyeonggi = 'true';
      locationInfo.gyeongsangnamdo = 'false';
      locationInfo.seoul = 'false';
      locationInfo.ulsan = 'false';
      locationInfo.agentNumber = 14;
      locationInfo.filterNm = 'Gyeonggi-do';
    }
    else if (filter === 'gyeongsangnamdo') {
      locationInfo.busan = 'false';
      locationInfo.gwangju = 'false';
      locationInfo.gyeonggi = 'false';
      locationInfo.gyeongsangnamdo = 'true';
      locationInfo.seoul = 'false';
      locationInfo.ulsan = 'false';
      locationInfo.agentNumber = 1;
      locationInfo.filterNm = 'Gyeongsangnam-do';
    }
    else if (filter === 'seoul') {
      locationInfo.busan = 'false';
      locationInfo.gwangju = 'false';
      locationInfo.gyeonggi = 'false';
      locationInfo.gyeongsangnamdo = 'false';
      locationInfo.seoul = 'true';
      locationInfo.ulsan = 'false';
      locationInfo.agentNumber = 7;
      locationInfo.filterNm = 'Seoul';
    }
    else if (filter === 'ulsan') {
      locationInfo.busan = 'false';
      locationInfo.gwangju = 'false';
      locationInfo.gyeonggi = 'false';
      locationInfo.gyeongsangnamdo = 'false';
      locationInfo.seoul = 'false';
      locationInfo.ulsan = 'true';
      locationInfo.agentNumber = 1;
      locationInfo.filterNm = 'Ulsan';
    }
    else if (filter === 'all') {
      locationInfo.busan = 'true';
      locationInfo.gwangju = 'true';
      locationInfo.gyeonggi = 'true';
      locationInfo.gyeongsangnamdo = 'true';
      locationInfo.seoul = 'true';
      locationInfo.ulsan = 'true';
      locationInfo.agentNumber = 25;
      locationInfo.filterNm = 'All';
    }
      res.render('../../views/containers/agentsearch/en.customer.agentsearch.html', {svcInfo, pageInfo, locationInfo});
  };
}

export default CustomerAgentsearch;
