/**
 * @file common.util.service-block.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.01.17
 * @desc Common > Util > 화면 차단
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { REDIS_KEY } from '../../../../types/redis.type';

/**
 * @desc 화면 차단 초기화를 위한 class
 */
class CommonUtilServiceBlock extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > Util > 화면 차단 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    let hideTime = FormatHelper.isEmpty(req.query.fromDtm) || req.query.fromDtm === 'undefined';
    let fromDtm = DateHelper.getShortDateAnd24Time(req.query.fromDtm);
    let toDtm = DateHelper.getShortDateAnd24Time(req.query.toDtm);
    let today = new Date().getTime();
    let result;
    let blockYn = 'N';
    let startTime;
    let endTime;
    let title;
    let content;

    const DEFAULT_PARAM = {
      property: REDIS_KEY.COMMON_BLOCK
    };
    this.apiService.request(API_CMD.BFF_01_0069, DEFAULT_PARAM).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        // Y|202008220000|202008310000|코로나19인해 고객센터 사옥 폐쇄 안내드립니다.|<div class=\"wrap checking_wrap\">
        // <i class=\"icon-warning-120\"><span class=\"blind\">warning</span></i>    <p class=\"tit\">시스템 점검 중입니다</p>
        // <p class=\"txt\">이용에 불편을 드려 죄송합니다.<br>더욱 편리하고 안정된 서비스를 제공하기 위해<br>
        // T world 시스템을 점검하고 있습니다.</p>    &lt;% if (hideTime) { %&gt;
        // <p class=\"subTxt\">&lt;%= fromDtm %&gt; ~ &lt;%= toDtm %&gt;</p>    &lt;% } %&gt;</div>
        today = new Date().getTime();
        result = resp.result.split('|');
        blockYn = result[0];
        startTime = DateHelper.convDateFormat(result[1]).getTime();
        endTime = DateHelper.convDateFormat(result[2]).getTime();
        title = result[3];
        content = result[4];
        this.logger.info(this, '[Person startTime // endTime]', startTime, endTime);
        // 게시 여부
        if (blockYn === 'Y') {
          // 기간 체크
          if ((today >= startTime && today <= endTime)) {
            // console.log('[TEST] 1', blockYn,today,startTime,endTime);
            fromDtm = startTime.toString();
            toDtm = endTime.toString();
            hideTime = FormatHelper.isEmpty(fromDtm) || fromDtm === 'undefined';
            // 노출
            res.render('util/common.util.service-block.html', {
              fromDtm,
              toDtm,
              pageInfo,
              hideTime,
              title,
              content,
              blockYn
            });
          } else {
            // console.log('[TEST] 2', blockYn,today,startTime,endTime);
            // 비노출
            blockYn = 'N';
            res.render('util/common.util.service-block.html', {
              fromDtm,
              toDtm,
              pageInfo,
              hideTime,
              title,
              content,
              blockYn
            });
          }
        } else {
          // console.log('[TEST] 3', blockYn,today,startTime,endTime);
          // 비노출
          blockYn = 'N';
          res.render('util/common.util.service-block.html', {
            fromDtm,
            toDtm,
            pageInfo,
            hideTime,
            title,
            content,
            blockYn
          });
        }

      } else {
        // console.log('[TEST] 4', blockYn,today,startTime,endTime);
        // 비노출
        blockYn = 'N';
        res.render('util/common.util.service-block.html', {
          fromDtm,
          toDtm,
          pageInfo,
          hideTime,
          title,
          content,
          blockYn
        });
      }
    });
  }
}

export default CommonUtilServiceBlock;
