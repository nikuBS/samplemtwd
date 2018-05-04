import TwViewController from '../../../common/controllers/tw.view.controller';

class ProductInternelController extends TwViewController {
  constructor() {
    super();
  }

  render(req: any, res: any, next: any) {
    res.render('product.internet.html', {
      user: 'aaa'
    });
  }
}

export default ProductInternelController;
