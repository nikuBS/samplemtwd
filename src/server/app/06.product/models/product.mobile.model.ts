class ProductMobileModel {
  private _test1: string = 'home test';

  get test1(): string {
    return this._test1;
  }

  set test1(test1: string) {
    this._test1 = test1;
  }
}

export default ProductMobileModel;
