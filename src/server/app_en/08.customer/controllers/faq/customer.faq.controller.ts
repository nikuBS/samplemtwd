import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CustomerFaq extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const filter = req.query.faq || 'all';
    const filterInfo = {appAddOns: 'true',
                        plans: 'true',
                        roaming: 'true',
                        subscription: 'true',
                        tworldguide: 'true',
                        filter: 'All'};
    if (filter === 'appAddOns') {
      filterInfo.appAddOns = 'true';
      filterInfo.plans = 'false';
      filterInfo.roaming = 'false';
      filterInfo.subscription = 'false';
      filterInfo.tworldguide = 'false';
      filterInfo.filter = 'App/Add-ons';
    } else if (filter === 'plans') {
      filterInfo.appAddOns = 'false';
      filterInfo.plans = 'true';
      filterInfo.roaming = 'false';
      filterInfo.subscription = 'false';
      filterInfo.tworldguide = 'false';
      filterInfo.filter = 'Plans';
    } else if (filter === 'roaming') {
      filterInfo.appAddOns = 'false';
      filterInfo.plans = 'false';
      filterInfo.roaming = 'true';
      filterInfo.subscription = 'false';
      filterInfo.tworldguide = 'false';
      filterInfo.filter = 'Roaming';
    } else if (filter === 'subscription') {
      filterInfo.appAddOns = 'false';
      filterInfo.plans = 'false';
      filterInfo.roaming = 'false';
      filterInfo.subscription = 'true';
      filterInfo.tworldguide = 'false';
      filterInfo.filter = 'Subscription/Change/Cancellation';
    } else if (filter === 'tworldguide') {
      filterInfo.appAddOns = 'false';
      filterInfo.plans = 'false';
      filterInfo.roaming = 'false';
      filterInfo.subscription = 'false';
      filterInfo.tworldguide = 'true';
      filterInfo.filter = 'T world Guide';
    } else if (filter === 'all') {
      filterInfo.appAddOns = 'true';
      filterInfo.plans = 'true';
      filterInfo.roaming = 'true';
      filterInfo.subscription = 'true';
      filterInfo.tworldguide = 'true';
      filterInfo.filter = 'All';
    }
    res.render('../../views/containers/faq/en.customer.faq.html', { svcInfo, pageInfo, filterInfo });
  }
}

export default CustomerFaq;

