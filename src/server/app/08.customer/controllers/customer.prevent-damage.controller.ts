import TwViewController from '../../../common/controllers/tw.view.controller';

class CustomerPreventDamage extends TwViewController {
  constructor() {
    super();
  }

  render(req: any, res: any, next: any, svcInfo: any) {
    res.render('customer.prevent-damage.html', {
      svcInfo: svcInfo
    });
  }
}

export default CustomerPreventDamage;
