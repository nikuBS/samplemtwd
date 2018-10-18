import TwRouter from '../../common/route/tw.router';
import RechargeRefill from './controllers/refill/recharge.refill.controller';
import RechargeRefillHistory from './controllers/refill/recharge.refill.history.controller';
import RechargeRefillGift from './controllers/refill/recharge.refill.gift.controller';
import RechargeRefillGiftComplete from './controllers/refill/recharge.refill.gift-complete.controller';
import RechargeRefillGiftProducts from './controllers/refill/recharge.refill.gift-products.controller';
import RechargeGift from './controllers/gift/recharge.gift.controller';
import RechargeGiftMembersProcess from './controllers/gift/recharge.gift.members.controller';
import RechargeGiftFamilyProcess from './controllers/gift/recharge.gift.family.controller';
import RechargeGiftHistory from './controllers/gift/recharge.gift.history.controller';
import RechargeRefillSelect from './controllers/refill/recharge.refill.select.controller';
import RechargeRefillComplete from './controllers/refill/recharge.refill.complete.controller';
import RechargeGiftRequestProcess from './controllers/gift/recharge.gift.request.controller';
import RechargeRefillError from './controllers/refill/recharge.refill.error.controller';
import RechargeTing from './controllers/ting/recharge.ting.controller';
import RechargeLimit from './controllers/limit/recharge.limit.controller';
import RechargeLimitHistory from './controllers/limit/recharge.limit.history.controller';
import RechargeCookiz from './controllers/cookiz/recharge.cookiz.controller';
import RechargeTingHistory from './controllers/ting/recharge.ting.history.controller';
import RechargeCookizHistory from './controllers/cookiz/recharge.cookiz.history.controller';

class RechargeRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/refill', controller: RechargeRefill });
    this.controllers.push({ url: '/refill/history', controller: RechargeRefillHistory });
    this.controllers.push({ url: '/refill/select', controller: RechargeRefillSelect });
    this.controllers.push({ url: '/refill/complete', controller: RechargeRefillComplete });
    this.controllers.push({ url: '/refill/error', controller: RechargeRefillError });
    this.controllers.push({ url: '/refill/gift', controller: RechargeRefillGift });
    this.controllers.push({ url: '/refill/gift-complete', controller: RechargeRefillGiftComplete });
    this.controllers.push({ url: '/refill/gift-products', controller: RechargeRefillGiftProducts });
    this.controllers.push({ url: '/gift', controller: RechargeGift });
    this.controllers.push({ url: '/gift/process/family', controller: RechargeGiftFamilyProcess });
    this.controllers.push({ url: '/gift/process/members', controller: RechargeGiftMembersProcess });
    this.controllers.push({ url: '/gift/process/request', controller: RechargeGiftRequestProcess });
    this.controllers.push({ url: '/gift/history', controller: RechargeGiftHistory });
    this.controllers.push({ url: '/cookiz', controller: RechargeCookiz });
    this.controllers.push({ url: '/cookiz/history', controller: RechargeCookizHistory });
    this.controllers.push({ url: '/limit', controller: RechargeLimit });
    this.controllers.push({ url: '/limit/history', controller: RechargeLimitHistory });
    this.controllers.push({ url: '/ting', controller: RechargeTing });
    this.controllers.push({ url: '/ting/history', controller: RechargeTingHistory });
  }
}

export default RechargeRouter;
