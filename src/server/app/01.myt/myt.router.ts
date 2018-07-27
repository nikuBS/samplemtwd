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
import MyTUsageCombineWithMine from './controllers/usage/myt.usage.combine-with-mine.controller';
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
import MyTBillHistoryContents from './controllers/bill/myt.bill.history.contents.controller';
import MyTBillHistoryContentsLimit from './controllers/bill/myt.bill.history.contents.limit.controller';

import MytJoinServicePayClaimInfo from './controllers/joinService/myt.joinService.payClaimInfo.controller';
import MytJoinServicePayClaimInfoPhone from './controllers/joinService/myt.joinService.payClaimInfo.phone.controller';
import MytJoinServicePayClaimInfoIptv from './controllers/joinService/myt.joinService.payClaimInfo.iptv.controller';
import MytJoinServicePayClaimInfoTlogin from './controllers/joinService/myt.joinService.payClaimInfo.tlogin.controller';
import MytJoinServicePayClaimInfoTwibro from './controllers/joinService/myt.joinService.payClaimInfo.twibro.controller';
import MytJoinServicePayClaimInfoTpocketfi from './controllers/joinService/myt.joinService.payClaimInfo.tpocketfi.controller';
import MytJoinServicePayClaimInfoPointcam from './controllers/joinService/myt.joinService.payClaimInfo.pointcam.controller';
import MytJoinServiceContractTerminalInfo from './controllers/joinService/myt.joinService.contractTerminalInfo.controller';
import MytJoinServiceContractTerminalInfoPhoneDetail from './controllers/joinService/myt.joinService.contractTerminalInfo.phone.detail.controller';
import MytJoinServiceContractTerminalInfoTpocketfi from './controllers/joinService/myt.joinService.contractTerminalInfo.tpocketfi.controller';
import MytJoinServiceContractTerminalInfoTpocketfiDetail from './controllers/joinService/myt.joinService.contractTerminalInfo.tpocketfi.detail.controller';
import MytJoinServiceContractTerminalInfoTwibro from './controllers/joinService/myt.joinService.contractTerminalInfo.twibro.controller';
import MytJoinServiceContractTerminalInfoTlogin from './controllers/joinService/myt.joinService.contractTerminalInfo.tlogin.controller';
import MytJoinServiceContractTerminalInfoTloginDetail from './controllers/joinService/myt.joinService.contractTerminalInfo.tlogin.detail.controller';
import MytJoinServiceContractTerminalInfoPhone from './controllers/joinService/myt.joinService.contractTerminalInfo.phone.controller';
import MytJoinServicePayClaimInfoIptvSk from './controllers/joinService/myt.joinService.payClaimInfo.iptvSk.controller';


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
    this.controllers.push({ url: '/usage/combinewithmine', controller: new MyTUsageCombineWithMine() });

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
    this.controllers.push({ url: '/bill/history/micro/password', controller: new MyTBillHistoryMicroPassword() });
    this.controllers.push({ url: '/bill/history/micro/limit', controller: new MyTBillHistoryMicroLimit() });
    this.controllers.push({ url: '/bill/history/contents', controller: new MyTBillHistoryContents() });
    this.controllers.push({ url: '/bill/history/contents/limit', controller: new MyTBillHistoryContentsLimit() });

    this.controllers.push({ url: '/joinService/payClaimInfo', controller: new MytJoinServicePayClaimInfo() });
    this.controllers.push({ url: '/joinService/payClaimInfo/phone', controller: new MytJoinServicePayClaimInfoPhone() });
    this.controllers.push({ url: '/joinService/payClaimInfo/iptv', controller: new MytJoinServicePayClaimInfoIptv() });
    this.controllers.push({ url: '/joinService/payClaimInfo/iptvSk', controller: new MytJoinServicePayClaimInfoIptvSk() });
    this.controllers.push({ url: '/joinService/payClaimInfo/tlogin', controller: new MytJoinServicePayClaimInfoTlogin() });
    this.controllers.push({ url: '/joinService/payClaimInfo/twibro', controller: new MytJoinServicePayClaimInfoTwibro() });
    this.controllers.push({ url: '/joinService/payClaimInfo/tpocketfi', controller: new MytJoinServicePayClaimInfoTpocketfi() });
    this.controllers.push({ url: '/joinService/payClaimInfo/pointcam', controller: new MytJoinServicePayClaimInfoPointcam() });

    this.controllers.push({ url: '/joinService/contractTerminalInfo', controller: new MytJoinServiceContractTerminalInfo() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/phone', controller: new MytJoinServiceContractTerminalInfoPhone() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/phone/detail', controller: new MytJoinServiceContractTerminalInfoPhoneDetail() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/tpocketfi', controller: new MytJoinServiceContractTerminalInfoTpocketfi() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/tpocketfi/detail',
      controller: new MytJoinServiceContractTerminalInfoTpocketfiDetail() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/twibro', controller: new MytJoinServiceContractTerminalInfoTwibro() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/tlogin', controller: new MytJoinServiceContractTerminalInfoTlogin() });
    this.controllers.push({ url: '/joinService/contractTerminalInfo/tlogin/detail',
      controller: new MytJoinServiceContractTerminalInfoTloginDetail() });
  }
}

export default MytRouter;
