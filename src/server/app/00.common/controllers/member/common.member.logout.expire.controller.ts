/**
 * @file common.member.logout.expire.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 * @desc 공통 > 로그인/로그아웃 > 세션만료
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { COOKIE_KEY } from '../../../../types/common.type';
import RedisService from '../../../../services/redis.service';
import { API_CODE } from '../../../../types/api-command.type';
/**
 * @desc 공통 - 세션만료 class
 */
class CommonMemberLogoutExpire extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 세션만표 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    const sessInvalid = req.query.sess_invalid || '';

    // Session 뒤바뀜 방어로직 추가(Sensing)
    if (this.loginService.isLogin(req) && !FormatHelper.isEmpty(sessInvalid)) {
      this.processInvalidSession(req, res);
    }

    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, this.loginService.getSessionId(req));
      res.render('member/common.member.logout.expire.html', { svcInfo, pageInfo, target });
    });
  }

  /***
   * 로그 출력
   * @param req
   */
  private processInvalidSession(req: any, res: any) {

    res.clearCookie(COOKIE_KEY.TWM_LOGIN);

    const redisService = RedisService.getInstance();
    const preTWM = req.query.pre_twm || '';
    const url = req.query.url;
    const commandPath = req.query.command_path || '';
    const point = req.query.point || '';
    const device = this.loginService.getDevice(req);
    const headerComment = '[Invalid Session(Change Session)] ' + point;
    const curSession = req.session;

    // Client에서 세션 변경이 감지된 경우
    if (point.indexOf('CLIENT') !== -1) {

      // 이전 session의 정보를 가져온다.
      const key = 'session:' + preTWM.replace('s:', '').split('.')[0];
      this.redisService.getData(key)
        .subscribe((resp) => {
          let preSession = 'undefined';
          if ( resp.code === API_CODE.CODE_00 ) {
            preSession = resp.result;
          }
  
          this.logger.error(this
            , headerComment
            , 'IP :' + this.loginService.getNodeIp(req)                             // 사용자 IP
            , 'DEVICE : ' + device                                                  // User Agent
            , 'URL : ' + url                                                        // 발생 페이지의 URL
            , 'COMMAND : ' + commandPath                                            // 발생 command
            , 'PRE_TWM : ' + preTWM    // 이전 session ID
            , preSession                                                            // 이전 session
            , 'CUR_TWM : ' + this.loginService.getCookie(req, COOKIE_KEY.TWM)       // 현재 session ID
            , curSession);                                                         // 현재 session
      });
    } else {
      const preServerSession = req.query.pre_server_se || '';
      const curServerSession = req.query.cur_server_se || '';

      this.logger.error(this
        , headerComment
        , 'IP :' + this.loginService.getNodeIp(req)                                 // 사용자 IP
        , 'DEVICE : ' + device                                                      // User Agent
        , 'URL : ' + url                                                            // 발생 페이지의 URL
        , 'COMMAND : ' + commandPath                                                // 발생 command
        , 'PRE_SERVER_SESSION : ' + preServerSession                                // 이전 server session ID
        , 'CUR_SERVER_SESSION : ' + curServerSession                                // 현재 server session ID
        , 'CUR_TWM : ' + this.loginService.getCookie(req, COOKIE_KEY.TWM)           // 현재 session ID 
        , curSession);                                                              // 현재 session(변경되지 않았으므로, 이전과 현재가 동일함)
    }
  }
}

export default CommonMemberLogoutExpire;
