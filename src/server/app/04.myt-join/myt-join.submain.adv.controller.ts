/*
 * @file myt-join.submain.adv.controller.ts
 * @author Kim InHwan
 * @since 2021-01-19
 *
 */

import CommonHelper from '../../utils/common.helper';
import {NextFunction, Request, Response} from 'express';
import MyTJoinSubmainController from './myt-join.submain.controller';
import {API_CMD, API_CODE, API_VERSION, SESSION_CMD} from '../../types/api-command.type';
import {Observable} from "rxjs/Observable";
import {MYT_JOIN_SUBMAIN_TITLE} from "../../types/title.type";
import FormatHelper from "../../utils/format.helper";
import DateHelper from "../../utils/date.helper";
import {MYT_SUSPEND_MILITARY_RECEIVE_CD, MYT_SUSPEND_REASON_CODE} from "../../types/bff.type";
import {MYT_SUSPEND_STATE_EXCLUDE} from "../../types/string.type";

class MyTJoinSubmainAdvController extends MyTJoinSubmainController {

	constructor() {
		super();
	}

	render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
		super.render(req, res, next, svcInfo, allSvc, child, pageInfo);
	}

	__requestApiAfterRender(res, data) {
		const requestApiList = this._requestApiList(data.svcInfo);
		Observable.combineLatest(
				requestApiList
		).subscribe(([myline, myif, myhs, myap, mycpp, myinsp,
									 myps, mylps, numSvc, wlap, myjinfo, prodDisInfo, benefitInfo, billInfo]) => {
			const responses = [myline, myif, myhs, myap, mycpp, myinsp,
				myps, mylps, numSvc, wlap];
			const newResponses = [myjinfo, prodDisInfo, benefitInfo, billInfo];
			this.__parsingRequestData({
				res, responses, data
			});
			// 신규 API 추가로 인하여 구조 변경이 필요하여 함수로 분리 후 처리
			this.__newParsingRequestData({
				res, responses: newResponses, data
			});
			// 다른 페이지를 찾고 계신가요 통계코드 추가
			this.getXtEid(data);
			res.render('myt-join.submain.adv.html', {data});
		});
	}

	__newParsingRequestData(parsingInfo) {
		const {res, responses, data} = parsingInfo;
		const [myjinfo, mydisinfo, benefitInfo, billInfo] = responses;
		// 가입개통정보
		data.myJoinInfo = myjinfo;
		// 약정 및 단말 상환 정보
		if (mydisinfo) {
			data.myDeviceInstallment = mydisinfo.deviceIntallment;
			data.myDiscountInfo = mydisinfo.prodDisInfo;
		}

		console.log('####################+==>> ', responses);
	}

	_requestApiList(svcInfo) {
		return [
			this._getMyLine(),
			this._getMyInfo(),
			this._getMyHistory(),
			this._getAddtionalProduct(),
			this._getContractPlanPoint(),
			this._getInstallmentInfo(),
			this._getPausedState(),
			this._getLongPausedState(),
			this._getChangeNumInfoService(),
			this._wirelessAdditions(svcInfo),
			this._getMyMobileJoinInfo(svcInfo),
			this._getProductDiscountInfo(),
			this._getBenefitInfo(),
			this._getBillInfo(svcInfo)
		];
	}

	/**
	 * 개통정보 조회
	 * @param svcInfo
	 */
	_getMyMobileJoinInfo(svcInfo) {
		return this.apiService.request(API_CMD.BFF_05_0216, {
			svcNum: svcInfo.svcNum
		}).map(resp => resp.code === API_CODE.CODE_00 ? resp.result : null);
	}

	/**
	 * 약정할인 및 단말분할상환정보 V2
	 */
	_getProductDiscountInfo() {
		return this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2)
				.map(resp => {
					if (resp.code === API_CODE.CODE_00) {
						const responseResult = resp.result;
						const prodDisList: any = [];
						const deviceIntallment: any = [];
						// 약정할인정보
						if (!FormatHelper.isEmpty(responseResult.priceList)) {
							prodDisList.push(...responseResult.priceList.sort((cur, next) => {
								const curStartDate = parseInt(cur.agrmtDcStaDt, 10);
								const nextStartDate = parseInt(next.agrmtDcStaDt, 10);
								return nextStartDate - curStartDate;
							}).map((item, index) => {
								if (index === 0) {
									return {
										name: item.disProdNm.slice(0, item.disProdNm.indexOf('(')).trim(),
										startDate: item.agrmtDcStaDt,
										endDate: item.agrmtDcEndDt
									};
								}
							}));
						}
						// 태블릿 약정
						if (!FormatHelper.isEmpty(responseResult.tablet)) {
							prodDisList.push({
								name: '태블릿약정할인',
								startDate: responseResult.tablet.agrmtDcStaDt,
								endDate: responseResult.tablet.agrmtDcEndDt
							});
						}
						// T 지원금 약정
						if (!FormatHelper.isEmpty(responseResult.tAgree)) {
							prodDisList.push({
								name: 'T지원금약정',
								startDate: responseResult.tAgree.staDt,
								endDate: responseResult.tAgree.agrmtTermDt
							});
						}
						// T약정 할부지원
						if (!FormatHelper.isEmpty(responseResult.tInstallment)) {
							prodDisList.push({
								name: 'T약정 할부지원',
								startDate: responseResult.tInstallment.tInstallmentOpDt,
								endDate: null,
								months: responseResult.tInstallment.allotMthCnt
							});
						}
						// 약정 위약금2
						if (!FormatHelper.isEmpty(responseResult.rsvPenTAgree)) {
							prodDisList.push({
								name: '약정 위약금2',
								startDate: responseResult.rsvPenTAgree.astamtOpDt,
								endDate: responseResult.rsvPenTAgree.rtenAgrmtEndDt
							});
						}
						// T 렌탈 - 사용이 필요하면 주석 제거
						// if (!FormatHelper.isEmpty(prodDisInfo.tRental)) {
						// 	prodDisList.push({
						// 		name: 'T렌탈',
						// 		startDate: prodDisInfo.tRental.rentalStaDt,
						// 		endDate: prodDisInfo.tRental.allotEndSchdDt
						// 	});
						// }
						const prodDisInfo = prodDisList.sort((cur, next) => {
							const curStartDate = parseInt(cur.startDate, 10);
							const nextStartDate = parseInt(next.startDate, 10);
							return nextStartDate - curStartDate;
						}).map((item, index) => {
							if (index === 0) {
								const curDate = DateHelper.getCurrentShortDate();
								const startDate = DateHelper.getShortDate(item.startDate);
								const endDate = DateHelper.getShortDate(item.endDate);
								const totDate = DateHelper.getDiffByUnit(item.endDate, item.startDate, 'day') + 1;  // 전체 일수(첫날 포함)
								const ingDate = DateHelper.getDiffByUnit(curDate, item.startDate, 'day');  // 진행 일수(첫날 미포함, 잔여일수 계산을 위해)
								const remainDate = totDate - ingDate; // 잔여일수
								const percentage = 100 - Math.floor((ingDate / totDate) * 100);
								const graphPercent = percentage < 0 ? 0 : percentage > 100 ? 100 : percentage;
								return {
									name: item.name,
									startDate,
									endDate,
									remainDate,
									graphPercent
								}
							}
						});
						// 단말상환정보
						if (!FormatHelper.isEmpty(responseResult.installmentList)) {
							deviceIntallment.push(...responseResult.installmentList.sort((cur, next) => {
								const curStartDate = parseInt(cur.allotStaDt, 10);
								const nextStartDate = parseInt(next.allotStaDt, 10);
								return nextStartDate - curStartDate;
							}).map((item, index) => {
								if (index === 0) {
									return {
										name: item.eqpMdlNm,
										invRmn: item.invRmn,
										invBamt: FormatHelper.addComma(item.invBamt)
									};
								}
							}));
						}
						return {
							deviceIntallment: deviceIntallment.length? deviceIntallment[0] : null,
							prodDisInfo: prodDisInfo.length? prodDisInfo[0] : null
						}
					}
					return null;
				});
	}

	/**
	 * 요금,결합,혜택 정보 (멤버십카드)
	 * API 에러 발생 시 별도의 에러 처리 없이 처리
	 */
	_getBenefitInfo() {
		let benefitDiscount = 0;
		return this.apiService.requestStore(SESSION_CMD.BFF_05_0106, {}) // 요금할인 (bill-discounts)
				.switchMap((discountResp) => {
					if (discountResp.code === API_CODE.CODE_00) {
						// 요금할인
						benefitDiscount += discountResp.result.priceAgrmtList.length;
						// 클럽
						benefitDiscount += discountResp.result.clubYN ? 1 : 0;
						// 척척
						benefitDiscount += discountResp.result.chucchuc ? 1 : 0;
						// T끼리플러스
						benefitDiscount += discountResp.result.tplus ? 1 : 0;
						// 요금할인- 복지고객
						benefitDiscount += (discountResp.result.wlfCustDcList && discountResp.result.wlfCustDcList.length > 0) ?
								discountResp.result.wlfCustDcList.length : 0;
						// 특화 혜택
						benefitDiscount += discountResp.result.thigh5 ? 1 : 0;
						benefitDiscount += discountResp.result.kdbthigh5 ? 1 : 0;
						// 데이터 선물
						benefitDiscount += (discountResp.result.dataGiftYN) ? 1 : 0;
					}
					return this.apiService.requestStore(SESSION_CMD.BFF_05_0094, {}); // 결합할인 (combination-discounts)
				})
				.switchMap((combinationResp) => {
					// 결합할인
					if (combinationResp.code === API_CODE.CODE_00) {
						if (combinationResp.result.prodNm.trim().length > 0) {
							benefitDiscount += Number(combinationResp.result.etcCnt) + 1;
						}
					}
					return this.apiService.requestStore(SESSION_CMD.BFF_05_0196, {}); // 장기가입혜택 (loyalty-benefits)
				}).map((loyalty) => {
					if (loyalty.code === API_CODE.CODE_00) {
						// 장기가입 요금
						benefitDiscount += (loyalty.result.dcList && loyalty.result.dcList.length > 0) ?
								loyalty.result.dcList.length : 0;
						// 쿠폰
						benefitDiscount += (loyalty.result.benfList && loyalty.result.benfList.length > 0) ? 1 : 0;
					}
					return {
						code: API_CODE.CODE_00,
						msg: 'success',
						result: {
							count: benefitDiscount
						}
					};
				});
	}

	/**
	 * 요금카드 (청구, 이용)
	 * @param svcInfo
	 */
	_getBillInfo(svcInfo) {
		const cmd = svcInfo.actRepYn === 'Y' ? API_CMD.BFF_04_0009 : API_CMD.BFF_04_0008;
		return this.apiService.request(cmd, {})
				.map(resp => resp.code === API_CODE.CODE_00 ? resp.result : null);
	}

	/**
	 * 멤버십카드
	 */
	_getMembershipInfo() {
		return this.apiService.request(API_CMD.BFF_11_0001, {})
				.map(resp => resp.code === API_CODE.CODE_00 ? resp.result : null);
	}
}


export default MyTJoinSubmainAdvController;
