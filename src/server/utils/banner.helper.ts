import { NextFunction, Request, Response } from "express";
import { Observable } from "rxjs";
import { of } from "rxjs/observable/of";
import LoginService from "../services/login.service";
import RedisService from "../services/redis.service";
import { API_CODE } from "../types/api-command.type";
import { REDIS_KEY, REDIS_TOS_KEY } from "../types/redis.type";
import { NODE_API_ERROR } from "../types/string.type";
import DateHelper from "./date.helper";
import FormatHelper from "./format.helper";

class BannerHelper {

    private readonly redisService: RedisService;
    private readonly ERROR_MSG: string = '해당 값이 없습니다.';

    constructor() {
        this.redisService = RedisService.getInstance();
    }

    public getTextBannerTos(req): Observable<any> {
        req.query.code = "0023"; // 본래는 구좌가 정해져 있는데 텍스트배너는 5가지 케이스를 모두 돌려라고 함.
        return this.getNewBannerTos(req)
            .switchMap(resp => {
                if (!!resp) {
                    if (resp.code === API_CODE.CODE_00) {
                        resp.result.code = API_CODE.CODE_00;
                        resp.result.msg = '';
                        resp.result.bannerType = "0023";
                        return of(resp)
                    } else {
                        resp.result.code = API_CODE.CODE_01;
                        resp.result.msg = this.ERROR_MSG;
                        return of(resp);
                    }
                } else {
                    req.query.code = "0024";
                    return this.getNewBannerTos(req);
                }
            })
            .switchMap(resp => {
                if (!!resp) {
                    if (resp.code === API_CODE.CODE_00) {
                        resp.result.code = API_CODE.CODE_00;
                        resp.result.msg = '';
                        resp.result.bannerType = "0024";
                        return of(resp)
                    } else {
                        resp.result.code = API_CODE.CODE_01;
                        resp.result.msg = this.ERROR_MSG;
                        return of(resp);
                    }
                } else {
                    req.query.code = "0025";
                    return this.getNewBannerTos(req);
                }
            })
            .switchMap(resp => {
                if (!!resp) {
                    if (resp.code === API_CODE.CODE_00) {
                        resp.result.code = API_CODE.CODE_00;
                        resp.result.msg = '';
                        resp.result.bannerType = "0025";
                        return of(resp)
                    } else {
                        resp.result.code = API_CODE.CODE_01;
                        resp.result.msg = this.ERROR_MSG;
                        return of(resp);
                    }
                } else {
                    req.query.code = "0026";
                    return this.getNewBannerTos(req);
                }
            })
            .switchMap(resp => {
                if (!!resp) {
                    if (resp.code === API_CODE.CODE_00) {
                        resp.result.code = API_CODE.CODE_00;
                        resp.result.msg = '';
                        resp.result.bannerType = "0026";
                        return of(resp)
                    } else {
                        resp.result.code = API_CODE.CODE_01;
                        resp.result.msg = this.ERROR_MSG;
                        return of(resp);
                    }
                } else {
                    req.query.code = "0027";
                    return this.getNewBannerTos(req);
                }
            })
            .switchMap(resp => {
                if (!!resp) {
                    if (resp.code === API_CODE.CODE_00) {
                        resp.result.code = API_CODE.CODE_00;
                        resp.result.msg = '';
                        resp.result.bannerType = "0027";
                        return of(resp);
                    } else {
                        resp.result.code = API_CODE.CODE_01;
                        resp.result.msg = this.ERROR_MSG;
                        return of(resp);
                    }
                } else {
                    resp.result.code = API_CODE.CODE_01;
                    resp.result.msg = this.ERROR_MSG;
                    return of(resp);
                }
            });
    }
    /**
       * TOS 배너 조회
       * @param req
       * @param res
       * @param next
       */
    public getNewBannerTos(req: Request): Observable<any> {
        const loginService = new LoginService();
        let code = req.query.code;
        const svcInfo = loginService.getSvcInfo(req) || {};
        let svcMgmtNum = '', userId = '';

        // 서비스 관리자 번호가 없을때 준회원인 경우이지만 예시대로 해야 하나?
        if (FormatHelper.isEmpty(svcInfo)) { // 준회원
            svcMgmtNum = svcInfo.svcMgmtNum || 'null';
            userId = svcInfo.userId || 'jin5931';
            code = userId === 'jin5931' ? '0001' : code
        } else { // 정회원 
            svcMgmtNum = svcInfo.svcMgmtNum || 'null';
            userId = svcInfo.userId;
        }

        let bannerLink = null;
        let serialNums = '';
        let realTimeBanner, campaignBanner;

        return this.redisService.getData(REDIS_KEY.BANNER_TOS_LINK + code)
            .switchMap((resp) => {  // TOS 정보를 호출함
                if (resp.code === API_CODE.CODE_00) {
                    if (resp.result.bltnYn === 'N') {
                        return of({
                            code: API_CODE.NODE_1001,
                            msg: '게시여부 닫힘'
                        });
                    } else {
                        resp.result.bltnYn = 'Y';
                        if (resp.result.tosLnkgYn === 'Y') {
                            bannerLink = resp.result;
                            return this.redisService.getStringTos(REDIS_TOS_KEY.BANNER_TOS_KEY + code + ':' + userId + ':' + svcMgmtNum);
                        } else {
                            return of({
                                code: API_CODE.NODE_1001,
                                msg: '토스연동여부 닫힘'
                            });
                        }
                    }
                } else {
                    return of({
                        code: API_CODE.NODE_1001,
                        msg: '토스 조회 실패'
                    });
                }
            })
            .switchMap((resp) => {// 조회된 TOS정보 중 실시간배너(R)인것만 추출하여 배너를 조회함
                if (resp.code === API_CODE.CODE_00) {
                    serialNums = (resp.result || '').trim();
                    realTimeBanner = serialNums.split('|').filter(e => e.indexOf('R') > -1);
                    campaignBanner = serialNums.split('|').filter(e => e.indexOf('C') > -1);

                    if (serialNums === '') {
                        return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
                    } else {
                        return Observable.combineLatest(
                            ...(realTimeBanner.map(e => this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + e))),
                            ...(campaignBanner.map(e => this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + e)))
                        ).switchMap(([...args]: any[]) => {
                            const imgList = args.filter(e => e.code === API_CODE.CODE_00)
                                .filter(e => {
                                    const start = DateHelper.convDateCustomFormat(e.result.summary.cmpgnStaDt + e.result.summary.cmpgnStaHm, 'YYYYMMDDhhmm').getTime();
                                    const end = DateHelper.convDateCustomFormat(e.result.summary.cmpgnEndDt + e.result.summary.cmpgnEndHm, 'YYYYMMDDhhmm').getTime();
                                    const today = new Date().getTime();
                                    return start < today && end > today;
                                }).reduce((p, n) => {
                                    n.result.imgList.forEach(e => p.push(Object.assign({}, n.result.summary, e)));
                                    return p;
                                }, []);
                            return of({
                                code: API_CODE.CODE_00,
                                result: {
                                    summary: {},
                                    imgList: imgList
                                }
                            });

                        });
                    }

                } else {
                    return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
                }
            });
    }
}

export default BannerHelper;