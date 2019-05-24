/**
 * [나의 가입정보 - 장기/일시정지] 완료 화면 관련 처리
 * @author Hyeryoun Lee
 * @since 2019-1-29
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_SUSPEND_COMPLETE_MSG } from '../../../../types/string.type';
import { MYT_SUSPEND_REASON_CODE} from '../../../../types/bff.type';
import ParamsHelper from '../../../../utils/params.helper';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
/**
 * [나의 가입정보 - 장기/일시정지] 완료 화면 렌더링
 * @author Hyeryoun Lee
 * @since 2019-1-29
 */
class MyTJoinSuspendComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject: any = ParamsHelper.getQueryParams(req.url);
    const data = this._setParam(queryObject);
    res.render('suspend/myt-join.suspend.complete.html', { data, pageInfo });
  }

  private _setParam = (params) => {
    const data = { confirmUrl: '/myt-join/submain' };
    let duration = '';
    switch ( params.command ) {
      case 'longterm': // 장기 일시정지 신청
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.APPLY_LONGTERM;
        data['centerUrl'] = '/myt-join/submain/suspend/status';
        data['centerName'] = MYT_SUSPEND_COMPLETE_MSG.GO_TO_STATUS;

        if ( params.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.MILITARY
        || params.svcChgRsnCd === MYT_SUSPEND_REASON_CODE.SEMI_MILITARY ) {
          duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.M.D.') + '~' +
            DateHelper.getShortDateWithFormat(params.toDt, 'YYYY.M.D.');
          data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_LONG_TERM_SUSPEND_MESSAGE_MILITARY
            .replace('{DURATION}', duration)
            .replace('{SVC_INFO}', FormatHelper.conTelFormatWithDash(params.svcNum));
        } else {
          duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.M.D.');
          data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_LONG_TERM_SUSPEND_MESSAGE_ABROAD
            .replace('{DURATION}', duration)
            .replace('{SVC_INFO}', FormatHelper.conTelFormatWithDash(params.svcNum));
        }
        data['desc'] += '<br><br>' + MYT_SUSPEND_COMPLETE_MSG.LONG_TERM_SUSPEND_WARNING;
        break;

      case 'resuspend': // 장기 일시정지 재신청
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.RESUSPEND;
        data['centerUrl'] = '/myt-join/submain/suspend/status';
        data['centerName'] = MYT_SUSPEND_COMPLETE_MSG.GO_TO_STATUS;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.M.D.') + '~' + params.toDt;
        data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_RESUSPEND_MESSAGE.replace('{DURATION}', duration)
          .replace('{SVC_NUMBER}', FormatHelper.conTelFormatWithDash(params.svcNum));
        break;

      case 'cancel-resuspend': // 장기 일시정지 재신청 취소
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.CANCEL_RESUSPEND;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.M.D.');
        break;

      case 'reset':  // 일시정지 해제
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.RESET;
        break;

      case 'temporary': // 일시정지 신청
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.APPLY;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.M.D.') + '~' +
          DateHelper.getShortDateWithFormat(params.toDt, 'YYYY.M.D.');
        const type = params.icallPhbYn === 'Y' ?
          MYT_SUSPEND_COMPLETE_MSG.TYPE.ALL : MYT_SUSPEND_COMPLETE_MSG.TYPE.CALL;
        data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_SUSPEND_MESSAGE.replace('{DURATION}', duration)
          .replace('{SUSPEND_TYPE}', type);
        break;
    }
    return data;
  }
}

export default MyTJoinSuspendComplete;
