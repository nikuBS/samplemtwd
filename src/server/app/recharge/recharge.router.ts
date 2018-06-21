import TwRouter from '../../common/route/tw.router';
import RechargeRefill from './controllers/refill/recharge.refill.controller';
import RechargeRefillHistory from './controllers/refill/recharge.refill.history.controller';
import RechargeRefillGift from './controllers/refill/recharge.refill.gift.controller';
import RechargeRefillGiftComplete from './controllers/refill/recharge.refill.gift-complete.controller';
import RechargeRefillGiftProducts from './controllers/refill/recharge.refill.gift-products.controller';
import RechargeGift from './controllers/gift/recharge.gift.controller';
import RechargeGiftMembersProcess from './controllers/gift/recharge.gift.members.controller';
import RechargeGiftFamilyProcess from './controllers/gift/recharge.gift.family.controller';
import RechargeGiftComplete from './controllers/gift/recharge.gift.complete.controller';
import RechargeGiftHistory from './controllers/gift/recharge.gift.history.controller';
import RechargeRefillSelect from './controllers/refill/recharge.refill.select.controller';
import RechargeRefillComplete from './controllers/refill/recharge.refill.complete.controller';
import RechargeGiftRequestProcess from './controllers/gift/recharge.gift.request.controller';
import RechargeRefillError from './controllers/refill/recharge.refill.error.controller';

class RechargeRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/refill', controller: new RechargeRefill() });
    this.controllers.push({ url: '/refill/history', controller: new RechargeRefillHistory() });
    this.controllers.push({ url: '/refill/select', controller: new RechargeRefillSelect() });
    this.controllers.push({ url: '/refill/complete', controller: new RechargeRefillComplete() });
    this.controllers.push({ url: '/refill/error', controller: new RechargeRefillError() });
    this.controllers.push({ url: '/refill/gift', controller: new RechargeRefillGift() });
    this.controllers.push({ url: '/refill/gift-complete', controller: new RechargeRefillGiftComplete() });
    this.controllers.push({ url: '/refill/gift-products', controller: new RechargeRefillGiftProducts() });
    this.controllers.push({ url: '/gift', controller: new RechargeGift() });
    this.controllers.push({ url: '/gift/process/family', controller: new RechargeGiftFamilyProcess() });
    this.controllers.push({ url: '/gift/process/members', controller: new RechargeGiftMembersProcess() });
    this.controllers.push({ url: '/gift/process/request', controller: new RechargeGiftRequestProcess() });
    this.controllers.push({ url: '/gift/complete', controller: new RechargeGiftComplete() });
    this.controllers.push({ url: '/gift/history', controller: new RechargeGiftHistory() });
  }
}

export default RechargeRouter;
