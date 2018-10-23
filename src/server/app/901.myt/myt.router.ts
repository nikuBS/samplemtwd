import TwRouter from '../../common/route/tw.router';
import MyTUsage from './controllers/usage/myt.usage.controller';
import MyTUsageDataShare from './controllers/usage/myt.usage.data-share.controller';
import MyTUsageChildren from './controllers/usage/myt.usage.children.controller';
import MyTUsageChange from './controllers/usage/myt.usage.change.controller';
import MyTUsageTDataShare from './controllers/usage/myt.usage.tdata-share.controller';
import MyTUsageTDataShareInfo from './controllers/usage/myt.usage.tdata-share-info.controller';
import MyTUsageTDataShareClose from './controllers/usage/myt.usage.tdata-share-close.controller';
import MyTUsageTRoamingShare from './controllers/usage/myt.usage.troaming-share.controller';
import MyTUsageTing from './controllers/usage/myt.usage.ting.controller';
import MyTUsage24hours50discount from './controllers/usage/myt.usage.24hours-50discount.controller';
import MyTUsageDataLimit from './controllers/usage/myt.usage.data-limit.controller';
import MyTUsagePattern from './controllers/usage/myt.usage.pattern.controller';
import MyTUsagePatternDetail from './controllers/usage/myt.usage.pattern.detail.controller';
import MyTUsageBandDataSharings from './controllers/usage/myt.usage.band-data-sharings.controller';
import MyTHotBill from './controllers/bill/myt.bill.hotbill.controller';
import MyTReissue from './controllers/bill/myt.bill.guidechange.reissue.controller';
import MyTReissueComplete from './controllers/bill/myt.bill.guidechange.reissue-complete.controller';
import MyTReturnHistory from './controllers/bill/myt.bill.guidechange.returnhistory.controller';

import MyTHotBillChild from './controllers/bill/myt.bill.hotbill.child.controller';
import MyTBillGuidechange from './controllers/bill/myt.bill.guidechange.controller';
import MyTBillGuidechangeChange from './controllers/bill/myt.bill.guidechange.change.controller';
import MyTBillGuideChangeComplete from './controllers/bill/myt.bill.guidechange.change-complete.controller';
import MyTBillGuidechangeUpdate from './controllers/bill/myt.bill.guidechange.update.controller';
import MyTBillGuidechangeUpdateComplete from './controllers/bill/myt.bill.guidechange.update-complete.controller';

import MyTBillHistoryMicro from './controllers/bill/myt.bill.history.micro.controller';
import MyTBillHistoryMicroPassword from './controllers/bill/myt.bill.history.micro.password.controller';
import MyTBillHistoryLimitCommon from './controllers/bill/myt.bill.history.limit.common.controller';
import MyTBillHistoryLimitChangeCommon from './controllers/bill/myt.bill.history.limit.change.common.controller';
import MyTBillHistoryContents from './controllers/bill/myt.bill.history.contents.controller';

import MyTJoinJoinInfo from './controllers/join/myt.join.join-info.controller';
import MyTJoinJoinInfoNoContract from './controllers/join/myt.join.join-info.no-contract.controller';
import MyTJoinJoinInfoSms from './controllers/join/myt.join.join-info.sms.controller';

import MyTBenefitDiscount from './controllers/benefit/myt.benefit.discount.main.controller';
import MyTBenefitDiscountDetail from './controllers/benefit/myt.benefit.discount.detail.controller';
import MyTBenefitPoint from './controllers/benefit/myt.benefit.point.controller';
import MyTBenefitRainbowPoint from './controllers/benefit/myt.benefit.rainbow-point.controller';
import MyTBenefitRainbowPointInfo from './controllers/benefit/myt.benefit.rainbow-point-info.controller';
import MyTBenefitRainbowPointHistory from './controllers/benefit/myt.benefit.rainbow-point-history.controller';
import MyTBenefitCookizPointHistory from './controllers/benefit/myt.benefit.cookiz-point-history.controller';
import MyTBenefitMilitaryPointHistory from './controllers/benefit/myt.benefit.military-point-history.controller';

import { MyTBenefitRainbowPointAdjustment } from './controllers/benefit/myt.benefit.rainbow-point.adjustment.controller';
import MyTBenefitRainbowPointTransfer from './controllers/benefit/myt.benefit.rainbow-point.transfer.controller';
import MyTJoinPayClaim from './controllers/join/myt.join.pay-claim.controller';
import MyTJoinContractTerminal from './controllers/join/myt.join.contract-terminal.controller';
import MyTJoinContractTerminalDetail from './controllers/join/myt.join.contract-terminal.detail.controller';
import MyTBenefitRecommend from './controllers/benefit/myt.benefit.recommend.controller';
import MyTBenefitRecommendDetail from './controllers/benefit/myt.benefit.recommend.detail.controller';
import MyTBenefitMembership from './controllers/benefit/myt.benefit.membership.controller';
import MyTBenefitMembershipDetail from './controllers/benefit/myt.benefit.membership.detail.controller';


class MytRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTUsage });
    this.controllers.push({ url: '/usage/change', controller: MyTUsageChange });
    this.controllers.push({ url: '/usage/children', controller: MyTUsageChildren });
    this.controllers.push({ url: '/usage/datalimit', controller: MyTUsageDataLimit });
    this.controllers.push({ url: '/usage/datashare', controller: MyTUsageDataShare });
    this.controllers.push({ url: '/usage/tdatashare', controller: MyTUsageTDataShare });
    this.controllers.push({ url: '/usage/tdatashare/info', controller: MyTUsageTDataShareInfo });
    this.controllers.push({ url: '/usage/tdatashare/close', controller: MyTUsageTDataShareClose });
    this.controllers.push({ url: '/usage/troaming', controller: MyTUsageTRoamingShare });
    this.controllers.push({ url: '/usage/ting', controller: MyTUsageTing });
    this.controllers.push({ url: '/usage/24hourdiscount', controller: MyTUsage24hours50discount });
    this.controllers.push({ url: '/usage/pattern', controller: MyTUsagePattern });
    this.controllers.push({ url: '/usage/pattern/detail', controller: MyTUsagePatternDetail });
    this.controllers.push({ url: '/usage/band-data-sharings', controller: MyTUsageBandDataSharings });
    this.controllers.push({ url: '/bill/hotbill', controller: MyTHotBill });
    this.controllers.push({ url: '/bill/guidechange/reissue', controller: MyTReissue });
    this.controllers.push({ url: '/bill/guidechange/reissue/complete', controller: MyTReissueComplete });
    this.controllers.push({ url: '/bill/billguide/returnhistory', controller: MyTReturnHistory });

    // this.controllers.push({ url: '/bill/billguide', controller: MyTBillBillguide });
    // this.controllers.push({ url: '/bill/billguide/subDetailSpecification', controller: MyTBillBillguideSubDetailSpecification });
    // this.controllers.push({ url: '/bill/billguide/subSelPayment', controller: MyTBillBillguideSubSelPayment });
    // this.controllers.push({ url: '/bill/billguide/subSusRelease', controller: MyTBillBillguideSubSusRelease });
    // this.controllers.push({ url: '/bill/billguide/subChildBill', controller: MyTBillBillguideSubChildBill });
    // this.controllers.push({ url: '/bill/billguide/subCallBill', controller: MyTBillBillguideSubCallBill });
    // this.controllers.push({ url: '/bill/billguide/subRoamingBill', controller: MyTBillBillguideSubRoamingBill });
    // this.controllers.push({ url: '/bill/billguide/subDonationBill', controller: MyTBillBillguideSubDonationBill });

    this.controllers.push({ url: '/bill/hotbill/child', controller: MyTHotBillChild });
    this.controllers.push({ url: '/bill/guidechange', controller: MyTBillGuidechange });
    this.controllers.push({ url: '/bill/guidechange/change', controller: MyTBillGuidechangeChange });
    this.controllers.push({ url: '/bill/guidechange/change-complete', controller: MyTBillGuideChangeComplete });
    this.controllers.push({ url: '/bill/guidechange/update', controller: MyTBillGuidechangeUpdate });
    this.controllers.push({ url: '/bill/guidechange/update-complete', controller: MyTBillGuidechangeUpdateComplete });

    this.controllers.push({ url: '/bill/history/micro', controller: MyTBillHistoryMicro });
    this.controllers.push({ url: '/bill/history/micro/detail', controller: MyTBillHistoryMicro });
    this.controllers.push({ url: '/bill/history/micro/password', controller: MyTBillHistoryMicroPassword });
    this.controllers.push({ url: '/bill/history/micro/password/set', controller: MyTBillHistoryMicroPassword });
    this.controllers.push({ url: '/bill/history/micro/limit', controller: MyTBillHistoryLimitCommon });
    this.controllers.push({ url: '/bill/history/micro/limit/change', controller: MyTBillHistoryLimitChangeCommon });
    this.controllers.push({ url: '/bill/history/contents', controller: MyTBillHistoryContents });
    this.controllers.push({ url: '/bill/history/contents/detail', controller: MyTBillHistoryContents });
    this.controllers.push({ url: '/bill/history/contents/limit', controller: MyTBillHistoryLimitCommon });
    this.controllers.push({ url: '/bill/history/contents/limit/change', controller: MyTBillHistoryLimitChangeCommon });

    this.controllers.push({ url: '/join/pay-claim', controller: MyTJoinPayClaim });
    this.controllers.push({ url: '/join/contract-terminal', controller: MyTJoinContractTerminal });
    this.controllers.push({ url: '/join/contract-terminal/detail', controller: MyTJoinContractTerminalDetail });
    this.controllers.push({ url: '/join/join-info', controller: MyTJoinJoinInfo });
    // this.controllers.push({ url: '/join/protect/change', controller: MyTJSProtectChange });
    this.controllers.push({ url: '/join/join-info/no-contract', controller: MyTJoinJoinInfoNoContract });
    this.controllers.push({ url: '/join/join-info/sms', controller: MyTJoinJoinInfoSms });

    // this.controllers.push({ url: '/join/product-service', controller: MyTJoinProductService });
    // this.controllers.push({ url: '/join/product-service/fee-alarm', controller: MyTJoinProductServiceFeeAlarm });
    // this.controllers.push({ url: '/join/product-service/fee-alarm/change', controller: MyTJoinProductServiceFeeAlarmChange });
    // this.controllers.push({ url: '/join/product-service/combination', controller: MyTJoinProductServiceCombination });

    this.controllers.push({ url: '/benefit/discount', controller: MyTBenefitDiscount });
    this.controllers.push({ url: '/benefit/discount/detail', controller: MyTBenefitDiscountDetail });
    this.controllers.push({ url: '/benefit/point', controller: MyTBenefitPoint });
    this.controllers.push({ url: '/benefit/rainbow-point', controller: MyTBenefitRainbowPoint });
    this.controllers.push({ url: '/benefit/rainbow-point/info', controller: MyTBenefitRainbowPointInfo });
    this.controllers.push({ url: '/benefit/rainbow-point/history', controller: MyTBenefitRainbowPointHistory });
    this.controllers.push({ url: '/benefit/cookiz-point', controller: MyTBenefitCookizPointHistory });
    this.controllers.push({ url: '/benefit/military-point', controller: MyTBenefitMilitaryPointHistory });
    this.controllers.push({ url: '/benefit/recommend', controller: MyTBenefitRecommend });
    this.controllers.push({ url: '/benefit/recommend/detail', controller: MyTBenefitRecommendDetail });

    this.controllers.push({ url: '/benefit/membership', controller: MyTBenefitMembership });
    this.controllers.push({ url: '/benefit/membership/detail', controller: MyTBenefitMembershipDetail });
    this.controllers.push({ url: '/benefit/rainbow-point/adjustment', controller: MyTBenefitRainbowPointAdjustment });
    this.controllers.push({ url: '/benefit/rainbow-point/transfer', controller: MyTBenefitRainbowPointTransfer });
  }
}

export default MytRouter;
