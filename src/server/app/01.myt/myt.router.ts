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
import MytBillGuidechange from './controllers/bill/myt.bill.guidechange.controller';
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
import MyTBillHistoryMicroLimit from './controllers/bill/myt.bill.history.micro.limit.controller';
import MyTBillHistoryMicroLimitChange from './controllers/bill/myt.bill.history.micro.limit.change.controller';
import MyTBillHistoryContents from './controllers/bill/myt.bill.history.contents.controller';
import MyTBillHistoryContentsLimit from './controllers/bill/myt.bill.history.contents.limit.controller';
import MyTBillHistoryContentsLimitChange from './controllers/bill/myt.bill.history.contents.limit.change.controller';

import MytJoinPayClaim from './controllers/join/myt.join.pay-claim.controller';
import MytJoinPayClaimPhone from './controllers/join/myt.join.pay-claim.phone.controller';
import MytJoinPayClaimIptv from './controllers/join/myt.join.pay-claim.iptv.controller';
import MytJoinPayClaimIptvSk from './controllers/join/myt.join.pay-claim.iptvSk.controller';
import MytJoinPayClaimTlogin from './controllers/join/myt.join.pay-claim.tlogin.controller';
import MytJoinPayClaimTwibro from './controllers/join/myt.join.pay-claim.twibro.controller';
import MytJoinPayClaimTpocketfi from './controllers/join/myt.join.pay-claim.tpocketfi.controller';
import MytJoinPayClaimPointcam from './controllers/join/myt.join.pay-claim.pointcam.controller';
import MytJoinContractTerminal from './controllers/join/myt.join.contract-terminal.controller';
import MytJoinContractTerminalPhone from './controllers/join/myt.join.contract-terminal.phone.controller';
import MytJoinContractTerminalPhoneDetail from './controllers/join/myt.join.contract-terminal.phone.detail.controller';
import MytJoinContractTerminalTpocketfi from './controllers/join/myt.join.contract-terminal.tpocketfi.controller';
import MytJoinContractTerminalTpocketfiDetail from './controllers/join/myt.join.contract-terminal.tpocketfi.detail.controller';
import MytJoinContractTerminalTwibro from './controllers/join/myt.join.contract-terminal.twibro.controller';
import MytJoinContractTerminalTlogin from './controllers/join/myt.join.contract-terminal.tlogin.controller';
import MytJoinContractTerminalTloginDetail from './controllers/join/myt.join.contract-terminal.tlogin.detail.controller';
import MytJoinProtectChangeController from './controllers/join/myt.join.protect.change.controller';
import MytJoinJoinInfoController from './controllers/join/myt.join.join-info.controller';


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
    this.controllers.push({ url: '/bill/guidechange', controller: new MytBillGuidechange() });
    this.controllers.push({ url: '/bill/guidechange/change', controller: new MyTBillGuidechangeChange() });
    this.controllers.push({ url: '/bill/guidechange/change-complete', controller: new MyTBillGuideChangeComplete() });
    this.controllers.push({ url: '/bill/guidechange/update', controller: new MyTBillGuidechangeUpdate() });
    this.controllers.push({ url: '/bill/guidechange/update-complete', controller: new MyTBillGuidechangeUpdateComplete() });

    this.controllers.push({ url: '/bill/history/micro', controller: new MyTBillHistoryMicro() });
    this.controllers.push({ url: '/bill/history/micro/detail', controller: new MyTBillHistoryMicro() });
    this.controllers.push({ url: '/bill/history/micro/password', controller: new MyTBillHistoryMicroPassword() });
    this.controllers.push({ url: '/bill/history/micro/limit', controller: new MyTBillHistoryMicroLimit() });
    this.controllers.push({ url: '/bill/history/micro/limit/change', controller: new MyTBillHistoryMicroLimitChange() });
    this.controllers.push({ url: '/bill/history/contents', controller: new MyTBillHistoryContents() });
    this.controllers.push({ url: '/bill/history/contents/detail', controller: new MyTBillHistoryContents() });
    this.controllers.push({ url: '/bill/history/contents/limit', controller: new MyTBillHistoryContentsLimit() });
    this.controllers.push({ url: '/bill/history/contents/limit/change', controller: new MyTBillHistoryContentsLimitChange() });

    this.controllers.push({ url: '/join/pay-claim', controller: new MytJoinPayClaim() });
    this.controllers.push({ url: '/join/pay-claim/phone', controller: new MytJoinPayClaimPhone() });
    this.controllers.push({ url: '/join/pay-claim/iptv', controller: new MytJoinPayClaimIptv() });
    this.controllers.push({ url: '/join/pay-claim/iptvSk', controller: new MytJoinPayClaimIptvSk() });
    this.controllers.push({ url: '/join/pay-claim/tlogin', controller: new MytJoinPayClaimTlogin() });
    this.controllers.push({ url: '/join/pay-claim/twibro', controller: new MytJoinPayClaimTwibro() });
    this.controllers.push({ url: '/join/pay-claim/tpocketfi', controller: new MytJoinPayClaimTpocketfi() });
    this.controllers.push({ url: '/join/pay-claim/pointcam', controller: new MytJoinPayClaimPointcam() });

    this.controllers.push({ url: '/join/contract-terminal', controller: new MytJoinContractTerminal() });
    this.controllers.push({ url: '/join/contract-terminal/phone', controller: new MytJoinContractTerminalPhone() });
    this.controllers.push({ url: '/join/contract-terminal/phone/detail', controller: new MytJoinContractTerminalPhoneDetail() });
    this.controllers.push({ url: '/join/contract-terminal/tpocketfi', controller: new MytJoinContractTerminalTpocketfi() });
    this.controllers.push({ url: '/join/contract-terminal/tpocketfi/detail', controller: new MytJoinContractTerminalTpocketfiDetail() });
    this.controllers.push({ url: '/join/contract-terminal/twibro', controller: new MytJoinContractTerminalTwibro() });
    this.controllers.push({ url: '/join/contract-terminal/tlogin', controller: new MytJoinContractTerminalTlogin() });
    this.controllers.push({ url: '/join/contract-terminal/tlogin/detail', controller: new MytJoinContractTerminalTloginDetail() });

    this.controllers.push({ url: '/join/join-info', controller: new MytJoinJoinInfoController() });
    this.controllers.push({ url: '/join/protect/change', controller: new MytJoinProtectChangeController() });
  }
}

export default MytRouter;
