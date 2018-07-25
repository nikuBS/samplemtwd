import TwViewController from '../../../common/controllers/tw.view.controller';

class CustomerPreventDamageRelateSite extends TwViewController {
  constructor() {
    super();
  }

  render(req: any, res: any, next: any, svcInfo: any) {
    console.log(req.params.id);
    res.render('customer.prevent-damage.relate-site.html', {
      svcInfo: svcInfo
    });
  }
}

export default CustomerPreventDamageRelateSite;
