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
import MyTBillBillguide from './controllers/bill/myt.bill.billguide.controller';
import MyTHotBillChild from './controllers/bill/myt.bill.hotbill.child.controller';
import MyTBillGuidechange from './controllers/bill/myt.bill.guidechange.controller';
import MyTBillGuidechangeChange from './controllers/bill/myt.bill.guidechange.change.controller';
import MyTBillGuideChangeComplete from './controllers/bill/myt.bill.guidechange.change-complete.controller';
import MyTBillGuidechangeUpdate from './controllers/bill/myt.bill.guidechange.update.controller';
import MyTBillGuidechangeUpdateComplete from './controllers/bill/myt.bill.guidechange.update-complete.controller';
import MyTBillBillguideSubDetailSpecification from './controllers/bill/myt.bill.billguide.subDetailSpecification.controller';
import MyTBillBillguideSubSelPayment from './controllers/bill/myt.bill.billguide.subSelPayment.controller';
import MyTBillBillguideSubSusRelease from './controllers/bill/myt.bill.billguide.subSusRelease.controller';
import MyTBillBillguideSubChildBill from './controllers/bill/myt.bill.billguide.subChildBill.controller';
import MyTBillBillguideSubCallBill from './controllers/bill/myt.bill.billguide.subCallBill.controller';
import MyTBillBillguideSubRoamingBill from './controllers/bill/myt.bill.billguide.subRoamingBill.controller';
import MyTBillBillguideSubDonationBill from './controllers/bill/myt.bill.billguide.subDonationBill.controller';
import MyTBillHistoryMicro from './controllers/bill/myt.bill.history.micro.controller';
import MyTBillHistoryMicroPassword from './controllers/bill/myt.bill.history.micro.password.controller';
import MyTBillHistoryLimitCommon from './controllers/bill/myt.bill.history.limit.common.controller';
import MyTBillHistoryLimitChangeCommon from './controllers/bill/myt.bill.history.limit.change.common.controller';
import MyTBillHistoryContents from './controllers/bill/myt.bill.history.contents.controller';




import MyTJoinProtectChangeController from './controllers/join/myt.join.protect.change.controller';
import MyTJoinJoinInfoController from './controllers/join/myt.join.join-info.controller';
import MyTJoinJoinInfoNoContractController from './controllers/join/myt.join.join-info.no-contract.controller';
import MyTJoinJoinInfoSmsController from './controllers/join/myt.join.join-info.sms.controller';


import MyTJoinProductService from './controllers/join/myt.join.product-service.controller';
import MyTJoinProductServiceFeeAlarmController from './controllers/join/myt.join.product-service.fee-alarm.controller';
import MyTJoinProductServiceFeeAlarmChangeController from './controllers/join/myt.join.product-service.fee-alarm.change.controller';

import MyTBenefitDiscount from './controllers/benefit/myt.benefit.discount.main.controller';
import MyTBenefitDiscountDetail from './controllers/benefit/myt.benefit.discount.detail.controller';
import MyTBenefitPoint from './controllers/benefit/myt.benefit.point.controller';
import MyTBenefitRainbowPoint from './controllers/benefit/myt.benefit.rainbow-point.controller';
import MyTBenefitRainbowPointInfo from './controllers/benefit/myt.benefit.rainbow-point-info.controller';
import MyTBenefitRainbowPointHistory from './controllers/benefit/myt.benefit.rainbow-point-history.controller';
import MyTBenefitCookizPointHistory from './controllers/benefit/myt.benefit.cookiz-point-history.controller';
import MyTBenefitMilitaryPointHistory from './controllers/benefit/myt.benefit.military-point-history.controller';

import MyTJoinProductServiceCombinationController from './controllers/join/myt.join.product-service.combination.controller';

import { MyTBenefitRainbowPointAdjustmentController } from './controllers/benefit/myt.benefit.rainbow-point.adjustment.controller';
import MyTBenefitRainbowPointTransferController from './controllers/benefit/myt.benefit.rainbow-point.transfer.controller';
import MyTJoinPayClaim from './controllers/join/myt.join.pay-claim.controller';
import MyTJoinContractTerminal from './controllers/join/myt.join.contract-terminal.controller';
import MyTJoinContractTerminalDetail from './controllers/join/myt.join.contract-terminal.detail.controller';
import MyTBenefitRecommendController from './controllers/benefit/myt.benefit.recommend.controller';
import MyTBenefitRecommendDetailController from './controllers/benefit/myt.benefit.recommend.detail.controller';
import MyTBenefitMembershipController from './controllers/benefit/myt.benefit.membership.controller';
import MyTBenefitMembershipDetailController from './controllers/benefit/myt.benefit.membership.detail.controller';


class MytRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTUsage() });
    this.controllers.push({ url: '/usage/change', controller: new MyTUsageChange() });
    this.controllers.push({ url: '/usage/children', controller: new MyTUsageChildren() });
    this.controllers.push({ url: '/usage/datalimit', controller: new MyTUsageDataLimit() });
    this.controllers.push({ url: '/usage/datashare', controller: new MyTUsageDataShare() });
    this.controllers.push({ url: '/usage/tdatashare', controller: new MyTUsageTDataShare() });
    this.controllers.push({ url: '/usage/tdatashare/info', controller: new MyTUsageTDataShareInfo() });
    this.controllers.push({ url: '/usage/tdatashare/close', controller: new MyTUsageTDataShareClose() });
    this.controllers.push({ url: '/usage/troaming', controller: new MyTUsageTRoamingShare() });
    this.controllers.push({ url: '/usage/ting', controller: new MyTUsageTing() });
    this.controllers.push({ url: '/usage/24hourdiscount', controller: new MyTUsage24hours50discount() });
    this.controllers.push({ url: '/usage/pattern', controller: new MyTUsagePattern() });
    this.controllers.push({ url: '/usage/pattern/detail', controller: new MyTUsagePatternDetail() });
    this.controllers.push({ url: '/usage/band-data-sharings', controller: new MyTUsageBandDataSharings() });
    this.controllers.push({ url: '/bill/hotbill', controller: new MyTHotBill() });
    this.controllers.push({ url: '/bill/guidechange/reissue', controller: new MyTReissue() });
    this.controllers.push({ url: '/bill/guidechange/reissue/complete', controller: new MyTReissueComplete() });
    this.controllers.push({ url: '/bill/billguide/returnhistory', controller: new MyTReturnHistory() });

    this.controllers.push({ url: '/bill/billguide', controller: new MyTBillBillguide() });
    this.controllers.push({ url: '/bill/billguide/subDetailSpecification', controller: new MyTBillBillguideSubDetailSpecification() });
    this.controllers.push({ url: '/bill/billguide/subSelPayment', controller: new MyTBillBillguideSubSelPayment() });
    this.controllers.push({ url: '/bill/billguide/subSusRelease', controller: new MyTBillBillguideSubSusRelease() });
    this.controllers.push({ url: '/bill/billguide/subChildBill', controller: new MyTBillBillguideSubChildBill() });
    this.controllers.push({ url: '/bill/billguide/subCallBill', controller: new MyTBillBillguideSubCallBill() });
    this.controllers.push({ url: '/bill/billguide/subRoamingBill', controller: new MyTBillBillguideSubRoamingBill() });
    this.controllers.push({ url: '/bill/billguide/subDonationBill', controller: new MyTBillBillguideSubDonationBill() });

    this.controllers.push({ url: '/bill/hotbill/child', controller: new MyTHotBillChild() });
    this.controllers.push({ url: '/bill/guidechange', controller: new MyTBillGuidechange() });
    this.controllers.push({ url: '/bill/guidechange/change', controller: new MyTBillGuidechangeChange() });
    this.controllers.push({ url: '/bill/guidechange/change-complete', controller: new MyTBillGuideChangeComplete() });
    this.controllers.push({ url: '/bill/guidechange/update', controller: new MyTBillGuidechangeUpdate() });
    this.controllers.push({ url: '/bill/guidechange/update-complete', controller: new MyTBillGuidechangeUpdateComplete() });

    this.controllers.push({ url: '/bill/history/micro', controller: new MyTBillHistoryMicro() });
    this.controllers.push({ url: '/bill/history/micro/detail', controller: new MyTBillHistoryMicro() });
    this.controllers.push({ url: '/bill/history/micro/password', controller: new MyTBillHistoryMicroPassword() });
    this.controllers.push({ url: '/bill/history/micro/password/set', controller: new MyTBillHistoryMicroPassword() });
    this.controllers.push({ url: '/bill/history/micro/limit', controller: new MyTBillHistoryLimitCommon() });
    this.controllers.push({ url: '/bill/history/micro/limit/change', controller: new MyTBillHistoryLimitChangeCommon() });
    this.controllers.push({ url: '/bill/history/contents', controller: new MyTBillHistoryContents() });
    this.controllers.push({ url: '/bill/history/contents/detail', controller: new MyTBillHistoryContents() });
    this.controllers.push({ url: '/bill/history/contents/limit', controller: new MyTBillHistoryLimitCommon() });
    this.controllers.push({ url: '/bill/history/contents/limit/change', controller: new MyTBillHistoryLimitChangeCommon() });

    this.controllers.push({ url: '/join/pay-claim', controller: new MyTJoinPayClaim() });
    this.controllers.push({ url: '/join/contract-terminal', controller: new MyTJoinContractTerminal() });
    this.controllers.push({ url: '/join/contract-terminal/detail', controller: new MyTJoinContractTerminalDetail() });
    this.controllers.push({ url: '/join/join-info', controller: new MyTJoinJoinInfoController() });
    this.controllers.push({ url: '/join/protect/change', controller: new MyTJoinProtectChangeController() });
    this.controllers.push({ url: '/join/join-info/no-contract', controller: new MyTJoinJoinInfoNoContractController() });
    this.controllers.push({ url: '/join/join-info/sms', controller: new MyTJoinJoinInfoSmsController() });

    this.controllers.push({ url: '/join/product-service', controller: new MyTJoinProductService() });
    this.controllers.push({ url: '/join/product-service/fee-alarm', controller: new MyTJoinProductServiceFeeAlarmController() });
    this.controllers.push({ url: '/join/product-service/fee-alarm/change', controller: new MyTJoinProductServiceFeeAlarmChangeController() });
    this.controllers.push({ url: '/join/product-service/combination', controller: new MyTJoinProductServiceCombinationController() });

    this.controllers.push({ url: '/benefit/discount', controller: new MyTBenefitDiscount() });
    this.controllers.push({ url: '/benefit/discount/detail', controller: new MyTBenefitDiscountDetail() });
    this.controllers.push({ url: '/benefit/point', controller: new MyTBenefitPoint() });
    this.controllers.push({ url: '/benefit/rainbow-point', controller: new MyTBenefitRainbowPoint() });
    this.controllers.push({ url: '/benefit/rainbow-point/info', controller: new MyTBenefitRainbowPointInfo() });
    this.controllers.push({ url: '/benefit/rainbow-point/history', controller: new MyTBenefitRainbowPointHistory() });
    this.controllers.push({ url: '/benefit/cookiz-point', controller: new MyTBenefitCookizPointHistory() });
    this.controllers.push({ url: '/benefit/military-point', controller: new MyTBenefitMilitaryPointHistory() });

    this.controllers.push({ url: '/benefit/recommend', controller: new MyTBenefitRecommendController() });
    this.controllers.push({ url: '/benefit/recommend/detail', controller: new MyTBenefitRecommendDetailController() });

    this.controllers.push({ url: '/benefit/membership', controller: new MyTBenefitMembershipController() });
    this.controllers.push({ url: '/benefit/membership/detail', controller: new MyTBenefitMembershipDetailController() });
    this.controllers.push({ url: '/benefit/rainbow-point/adjustment', controller: new MyTBenefitRainbowPointAdjustmentController() });
    this.controllers.push({ url: '/benefit/rainbow-point/transfer', controller: new MyTBenefitRainbowPointTransferController() });
  }
}

export default MytRouter;
