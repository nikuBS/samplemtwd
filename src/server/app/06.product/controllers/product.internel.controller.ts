import TwViewController from '../../../common/controllers/tw.view.controller';

class ProductInternel extends TwViewController {
  constructor() {
    super();
  }

  render(req: any, res: any, next: any) {
    res.render('product.internet.html', {
      user: 'aaa'
    });
  }
}

export default ProductInternel;
