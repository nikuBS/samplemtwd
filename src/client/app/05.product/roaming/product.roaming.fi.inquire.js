/**
 * @file product.roaming.fi.inquire.js
 * @desc T로밍 > baro Box 조회/취소
 * @author 김승규 (ksk4788@pineone.com)
 * @since 2018.11.27
 */
Tw.ProductRoamingFiInquire = function (rootEl, countryCode) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._formatHelper = Tw.FormatHelper;
  this._historyService = new Tw.HistoryService();
  this._countryCode = JSON.parse(countryCode);
  this._totoalList = [];
  this._receiveObj = {};
  this._returnObj = {};
  this._impbranchObj = {};
  this._requestYn = false;
  this._init();
};

Tw.ProductRoamingFiInquire.prototype = {

  _init: function() {
    this._cachedElement();
    this._bindEvent();
    this._getInitPeriod();
    $('#fe-listbox').hide();
    $('#fe-after-tip').hide();
  },

  _cachedElement: function() {
    this.$list = this.$container.find('#fe-list');
    this.$inputSdate = this.$container.find('#fe-sdate');
    this.$inputEdate = this.$container.find('#fe-edate');
    this.$inquirePeriod = this.$container.find('#fe-period');
    this.$totalCnt = this.$container.find('#fe-total-cnt');
    this.$inquire = this.$container.find('#fe-inquire');
    this.$more = this.$container.find('.bt-more');
    this.$moreCnt = this.$container.find('#fe-more-cnt');
    this.$certBtn = this.$container.find('#fe-cert');
  },

  _bindEvent: function() {
    this.$inquire.on('click', $.proxy(this._getTfiResponse, this));
    this.$container.on('click', '#fe-edit', $.proxy(this._clickEditBtn, this));
    this.$container.on('click', '#fe-cancel', $.proxy(this._clickCancelBtn, this));
    this.$container.on('click', '.bt-more', $.proxy(this._onMore, this));
    this.$container.on('change', '#flab02', $.proxy(this._changeCheck, this));
    this.$container.on('change', '#flab03', $.proxy(this._changeCheck, this));
    this.$certBtn.on('click', $.proxy(this._getTfiResponse, this));
  },

  /**
   * @function
   * @desc 조회기간 날짜 설정 초기화
   * @private
   */
  _getInitPeriod: function() {
    //최초 날짜 설정
    var startDate = moment().format('YYYY[-]MM[-]DD');
    var endDate = moment().add(6, 'month').format('YYYY[-]MM[-]DD');
    var getPeriod = this._dateHelper.getShortDateWithFormat(startDate, 'YYYY.M.DD' , 'YYYY-MM-DD') + ' - ' +
      this._dateHelper.getShortDateWithFormat(endDate, 'YYYY.M.DD' , 'YYYY-MM-DD');
    var minDate = moment().subtract(2, 'years').format('YYYY[-]MM[-]DD');
    var maxDate = moment().add(2, 'years').format('YYYY[-]MM[-]DD');

    this.$inputSdate.val(startDate);
    this.$inputSdate.attr('min',minDate);
    this.$inputSdate.attr('max',maxDate);
    this.$inputEdate.val(endDate);
    this.$inputEdate.attr('min',minDate);
    this.$inputEdate.attr('max',maxDate);
    this.$inquirePeriod.text(getPeriod);
  },

  /**
   * @function
   * @desc BFF_10_0067(new) 로밍> T파이 임대 > T파이 조회 API Request
   * @private
   */
  _getTfiResponse: function() {
    //연속 선택시 인증팝업 여러개 뜬다는 이슈로 인해 500ms의 시간 동안 재입력 불가
    if(this._requestYn){
      return;
    }
    this._requestYn = true;
    var self = this;
    setTimeout(function(){
      self._requestYn = false;
    },500);

    var sdate = this.$inputSdate.val() === undefined ? moment().format('YYYY[-]MM[-]DD') : this.$inputSdate.val();
    var edate = this.$inputEdate.val() === undefined ? moment().add(+6, 'month').format('YYYY[-]MM[-]DD') : this.$inputEdate.val();

    var rentfrom = this._dateHelper.getShortDateWithFormat(sdate, 'YYYYMMDD' , 'YYYY-MM-DD');
    var rentto = this._dateHelper.getShortDateWithFormat(edate, 'YYYYMMDD' , 'YYYY-MM-DD');

    var page = 1;

    this._apiService
      .request(Tw.API_CMD.BFF_10_0067, {
        page : page,
        rentfrom : rentfrom,
        rentto : rentto
      })
      .done($.proxy(this._renderTemplate, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc BFF_10_0067(new) 로밍> T파이 임대 > T파이 조회 API Response
   * @param res
   * @private
   */
  _renderTemplate: function(res) {
    if(res.code === Tw.API_CODE.CODE_00){
      res = res.result;
      this._renderListOne(res);
    }else{
      this._onFail(res);
    }
  },

  /**
   * 한글로된 국가 배열을 영문 코드 배열로 교체
   * @param code - 방문 국가 리스트
   * @private
   */
  _changeCountryCode: function(code) {
    var codeArr = code.split(',');
    var allCountryCode = this._countryCode;
    codeArr = codeArr.map(function(x){return x;});

    allCountryCode.forEach(function(key){
      if(codeArr.indexOf(key.countryCode) >= 0){
        codeArr.splice(codeArr.lastIndexOf(key.countryCode),1,key.countryNm);
      }
    });
    Handlebars.registerHelper('country', function() {
      return codeArr;
    });
    codeArr = codeArr.join('<br />');

    return codeArr;
  },

  /**
   * @function
   * @desc 서버에서 받은 예약 내역 데이터 가공
   * @param res
   * @returns {*}
   * @private
   */
  _parseList: function(res) {
    this._receiveObj = Tw.ROAMING_RECEIVE_CODE;
    this._returnObj = Tw.ROAMING_RETURN_CODE;

    // 서버에서 내려오는 데이터를 가공
    for( var x in res){
      res[x].visit_nat_lst = this._changeCountryCode(res[x].visit_nat_lst);
      res[x].show_rental_sale_org_id = this._returnObj[res[x].rental_sale_org_id].name;
      res[x].impbranch = this._receiveObj[res[x].rental_booth_org_id].code;
      res[x].show_rental_booth_org_id = this._receiveObj[res[x].rental_booth_org_id].name;
      res[x].rsv_rcv_dtm = this._dateHelper.getShortDateNoDot(res[x].rsv_rcv_dtm);
      if(this._dateHelper.getDifference(res[x].rental_schd_sta_dtm.substr(0,8)) > 0){ // 예약 시작 당일에 예약 취소/수정 버튼 비활성화
        res[x].dateDifference = this._dateHelper.getDifference(res[x].rental_schd_sta_dtm.substr(0,8));
      }
      res[x].rental_schd_sta_dtm = this._dateHelper.getShortDateWithFormat(res[x].rental_schd_sta_dtm.substr(0,8), 'YYYY.M.DD');
      res[x].rental_schd_end_dtm = this._dateHelper.getShortDateWithFormat(res[x].rental_schd_end_dtm, 'YYYY.M.DD');
      res[x].show_rental_st_nm = Tw.ROAMING_RESERVATION_STATE[res[x].rental_st_cd];

      if(res[x].rental_st_cd === '17') { // 예약취소 상태에서 버튼 비활성화
        res[x].dateDifference = '';
      }
    }

    return res;
  },

  /**
   * baro Box 예약 내역 화면 초기화
   * @param res
   * @private
   */
  _renderListOne: function(res){
    this._popupService.close();

    var list = res.romlist;

    // 핸들바에 바인딩할 데이터를 하나의 필드로 압축(romlist). romlist에 없는 데이터 파싱
    for(var x in list){
      list[x].rental_schd_end_dtm = res.roamTpieList[x].rental_schd_end_dtm;
      list[x].expbranch = res.roamTpieList[x].rtn_sale_org_id;
      list[x].boothcode = res.roamTpieList[x].rental_booth_org_id;
    }

    var total = res.iTotal + Tw.HISTORY_UNIT;
    var getPeriod = this._dateHelper.getShortDateWithFormat(res.rentfrom, 'YYYY.M.DD' , 'YYYY-MM-DD') + ' - ' +
      this._dateHelper.getShortDateWithFormat(res.rentto, 'YYYY.M.DD' , 'YYYY-MM-DD');

    this.$inquirePeriod.text(getPeriod);
    this.$totalCnt.text(total);
    this.$list.empty();
    this.$more.hide();

    $('#fe-listbox').show();
    $('#fe-certbox').hide();
    $('#fe-before-tip').hide();
    $('#fe-after-tip').show();

    if ( list.length > 0 ){ // 데이터가 있는 경우 최초에 20개까지만 노출
      this._totoalList = _.chunk(list, Tw.DEFAULT_LIST_COUNT); // 배열을 정해진 갯수의 배열로 나눔
      this._renderList(this.$list, this._totoalList.shift()); // .shift() 배열의 첫번째 요소를 제거하고 제거된 요소 반환
    }else{ // 조회 시 데이터가 없는 경우 ALERT_3_A87 호출
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A87;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
    }
  },

  /**
   * baro Box 예약 내역 템플릿 생성
   * @param $container
   * @param res
   * @private
   */
  _renderList: function($container, res) {
    /**
     * 객체를 json 형태로 출력해주는 Handlebars registerHelper
     * product.inquire.component.html 에서 {{json this}} 형태로 사용
     */
    Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
    });

    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var data = this._parseList(res);
    var output = template({ list : data });
    this.$list.append(output);

    this._moreButton();
  },

  /**
   * @function
   * @desc 데이터 갯수에 따라 더보기 버튼 Show/Hide 처리
   * @private
   */
  _moreButton: function(){
    var nextList = _.first(this._totoalList); // 배열의 첫번째 요소 반환

    if ( nextList ) {
      this.$moreCnt.text( '(0)'.replace('0', nextList.length) );
      this.$more.show();
    } else {
      this.$more.hide();
    }
  },

  /**
   * @function
   * @desc 더보기 버튼 선택
   * @private
   */
  _onMore : function () {
    if( this._totoalList.length > 0 ){
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  /**
   * 예약 수정 버튼 선택
   * @param e - 이벤트 객체
   * @private
   */
  _clickEditBtn: function(e){
    var data =  JSON.parse($(e.target).attr('data-response'));
    var rsvrcvdtm = this._dateHelper.getShortDateWithFormat(data.rsv_rcv_dtm, 'YYYYMMDD', 'YYYY.M.DD');
    var rentalmgmtnum = data.rental_mgmt_num;
    var rentalgubun = data.rental_st_cd;
    var opclcd = data.op_cl_cd;
    var changeCountry = data.visit_nat_lst.replace(/<br \/>/gi,', ');

    this._apiService
      .request(Tw.API_CMD.BFF_10_0068, {
        rentalmgmtnum : rentalmgmtnum,
        opclcd : opclcd,
        rsvrcvdtm : rsvrcvdtm,
        rentalgubun : rentalgubun
      })
      .done($.proxy(this._openEditPop, this, changeCountry, e))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * 예약 취소 버튼 선택
   * @param e - 이벤트 객체
   * @private
   */
  _clickCancelBtn : function(e){
    var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A26;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
      $.proxy(this._handleConfirmAlert, this, e), null, Tw.BUTTON_LABEL.CLOSE, ALERT.BUTTON, $(e.currentTarget));
  },

  /**
   * 예약 취소 Alert에서 확인 선택하여 취소 API 호출
   * @param e - 이벤트 객체
   * @private
   */
  _handleConfirmAlert : function(e){

    var data =  JSON.parse($(e.target).attr('data-response'));

    var rentalmgmtnum = data.rental_mgmt_num;
    var rentFrom = this._dateHelper.getShortDateWithFormat(data.rental_schd_sta_dtm, 'YYYYMMDD', 'YYYY.M.DD');
    var rentTo = this._dateHelper.getShortDateWithFormat(data.rental_schd_end_dtm, 'YYYYMMDD', 'YYYY.M.DD');
    var hsrsvrcvdtm = this._dateHelper.getShortDateWithFormat(data.rsv_rcv_dtm, 'YYYYMMDD', 'YYYY.M.DD');
    var impbranch = data.impbranch;
    var expbranch = data.expbranch;
    var boothcode = data.boothcode;
    var boothnm = data.rental_booth_org_id;
    var opClCd = data.rental_st_cd;

    var params = {
      'rentalmgmtnum' : rentalmgmtnum,
      'rentFrom': rentFrom,
      'rentTo': rentTo,
      'impbranch': impbranch,
      'expbranch': expbranch,
      'hsrsvrcvdtm': hsrsvrcvdtm,
      'boothcode': boothcode,
      'boothnm': boothnm,
      'opClCd' : opClCd,
      'phonemdlcd': 'A00B',
      'romingTypCd': '28',
      'type': 'D'
    };
    
    this._apiService
      .request(Tw.API_CMD.BFF_10_0066, params )
      .done($.proxy(this._openCancelAlert, this))
      .fail($.proxy(this._onFail, this));
  },

  _openCancelAlert: function (res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      var self = this;
      this._popupService.close();

      setTimeout(function(){
        self._cancleCompletePop();
      },100);
    }else{
      this._onFail(res);
    }
  },

  /**
   * @function
   * @desc 예약 취소 완료 팝업
   * @private
   */
  _cancleCompletePop: function (){
    var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A28;
    this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._reload, this));
  },

  /**
   * BFF_10_0068(new) 로밍> T파이 임대 > T파이 예약 상세 API Response
   * @param changeCountry
   * @param e - 이벤트 객체
   * @param res
   * @private
   */
  _openEditPop : function(changeCountry, e ,res ){
    if(res.code === Tw.API_CODE.CODE_00){

      // 예약 수정 팝업에서 필요한 데이터 가공
      res.result.rominfo.rental_schd_sta_dtm =
        this._dateHelper.getShortDateWithFormat(res.result.rominfo.rental_schd_sta_dtm.substr(0,8), 'YYYY-MM-DD');
      res.result.rominfo.rental_schd_end_dtm = this._dateHelper.getShortDateWithFormat(res.result.rominfo.rental_schd_end_dtm, 'YYYY-MM-DD');
      res.result.rominfo.receive_center_img =  this._receiveObj[res.result.rominfo.rental_booth_org_id].img;
      res.result.rominfo.receive_center_officeHour = this._receiveObj[res.result.rominfo.rental_booth_org_id].officeHour;
      res.result.rominfo.return_center_img = this._returnObj[res.result.rominfo.rental_sale_org_id].img;
      res.result.rominfo.return_center_officeHour = this._returnObj[res.result.rominfo.rental_sale_org_id].officeHour;
      res.result.rominfo.show_rtn_sale_org_nm = this._returnObj[res.result.rominfo.rental_sale_org_id].name;
      res.result.rominfo.show_rental_sale_org_nm = this._receiveObj[res.result.rominfo.rental_booth_org_id].name;
      res.result.rominfo.changeCountry = changeCountry;
      res.result.minDate = moment().add(2, 'days').format('YYYY-MM-DD');
      res.result.maxDate = this._dateHelper.getEndOfMonSubtractDate(undefined,-6,'YYYY-MM-DD');
      // 수령/반납장소 모두 대구황금점일 경우 반납장소 Disabled 처리
      res.result.isDisabled = (res.result.rominfo.rental_booth_org_id === '1430452300' && res.result.rominfo.rental_sale_org_id === '1430452300');

      var data = res.result;

      this._popupService.open({
          hbs: 'RM_14_03_02_01_01',
          layer: true,
          data: data
        },
        $.proxy(this._onEditPopOpened, this), null, 'edit', $(e.currentTarget)
      );
    }else{
      this._onFail(res);
    }
  },

  /**
   * @function
   * @desc 예약 수정 팝업 Open Callback
   * @param $popupLayer - 팝업 element 객체
   * @private
   */
  _onEditPopOpened : function($popupLayer){
    this.$btnRegister = $popupLayer.find('#fe-register');
    this.$inputPhone = $popupLayer.find('#flab01');
    this.$inputEditSdate = $popupLayer.find('#flab02');
    this.$inputEditEdate = $popupLayer.find('#flab03');
    this.$inputReceive = $popupLayer.find('#flab04');
    this.$inputReturn = $popupLayer.find('#flab05');
    this.$returnImg = $popupLayer.find('#fe-return-img');
    this.$returnOfficeHour = $popupLayer.find('#fe-return-officehour');
    this.$receiveImg = $popupLayer.find('#fe-receive-img');
    this.$receiveOfficeHour = $popupLayer.find('#fe-receive-officehour');

    $popupLayer.on('blur', '#flab01', $.proxy(this._insertDashPhone, this));
    $popupLayer.on('click', '#flab01', $.proxy(this._removeDashPhone, this));
    $popupLayer.on('keyup paste', '#flab01', $.proxy(this._changeCheck, this, 'keyup'));
    $popupLayer.on('change', '#flab01', $.proxy(this._changeCheck, this));
    $popupLayer.on('click', 'button[id=flab04],button[id=flab05]', $.proxy(this._openLocationPop, this));
    $popupLayer.on('click', '.cancel', $.proxy(this._changeCheck, this));
    $popupLayer.on('click', '#fe-link', $.proxy(this._goRoamingCenter, this));
    this.$btnRegister.click(_.debounce($.proxy(this._handleEditReservation, this), 500));

    this._insertDashPhone(); // 예약 수정 팝업 띄운 후 핸드폰 번호에 Dash 추가
    this._changeCheck();
  },

  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet Open
   * @param e
   * @private
   */
  _openLocationPop : function(e){
    var selected = e.target;
    var data = [];

    if(selected.id === 'flab04'){
      // 수령 장소 선택
      data = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE;
    }else{
      // 반납 장소 선택
      data = Tw.POPUP_TPL.ROAMING_RETURN_PLACE;
    }

    var currentCenter = $(selected).text();

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, selected, currentCenter), null, null, $(e.currentTarget)
    );

  },

  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet Open Callback
   * @param selected
   * @param currentCenter
   * @param $layer
   * @private
   */
  _onActionSheetOpened: function (selected, currentCenter, $layer) {
    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === currentCenter){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    });
    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, selected));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet 값 선택
   * @param selected - 수령/반납 event target
   * @param e
   * @private
   */
  _onActionSelected: function (selected, e) {

    if(selected.id === 'flab04'){ // 수령 장소 선택 ActionSheet
      $(selected).text($(e.target).parents('label').attr('value')); // 센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center')); // 부스코드를 data-code값에 넣기
      $(selected).attr('data-booth',$(e.target).parents('label').attr('data-booth'));
      this.selectIdx = Number($(e.target).parents('label').attr('id')) - 6; // 예약 완료 페이지에 넘기는 값

      // 약도 이미지 변경
      var imgUrl = this.$receiveImg.attr('src');
      var startLen = imgUrl.lastIndexOf('/');
      var cdnUrl = imgUrl.substring(0,startLen+1);
      this.$receiveImg.attr('src', cdnUrl + $(e.target).parents('label').attr('data-img') + '.png');
      this.$receiveOfficeHour.html($(e.target).parents('label').attr('data-officehour'));

      // 기본 반환장소 설정 (대구 황금점만 해당)
      // TODO: 반납 버튼 ID 하드코딩
      if( $(e.target).parents('label').attr('return-set') == "1" ) {
        $('#flab05').text($(e.target).parents('label').attr('return-value')); // 반납 센터명 출력
        $('#flab05').attr('data-center',$(e.target).parents('label').attr('return-data-center')); // 반납 센터코드 설정

        var returnImgUrl = $('#fe-return-img').attr('src');
        var returnStartLen = returnImgUrl.lastIndexOf('/');
        var returnCdnUrl = returnImgUrl.substring(0,returnStartLen+1);
        this.$returnImg.attr('src', returnCdnUrl + $(e.target).parents('label').attr('return-data-img') + '.png')
        this.$returnOfficeHour.html($(e.target).parents('label').attr('return-data-officehour'));
        $('#flab05').attr('disabled',true);
      } else {
        if ( $('#flab05').attr('disabled') == "disabled" ) {
          // 기본(Default) 반환장소로 변경하고 disabled 해제
          $('#flab05').text('인천공항 1터미널 1층 로밍센터'); // 반납 센터명 출력
          $('#flab05').attr('data-center','A100110000'); // 반납 센터코드 설정
  
          var defaultReturnImgUrl = $('#fe-return-img').attr('src');
          var defaultReturnStartLen = defaultReturnImgUrl.lastIndexOf('/');
          var defaultReturnCdnUrl = defaultReturnImgUrl.substring(0,defaultReturnStartLen+1);
          this.$returnImg.attr('src', defaultReturnCdnUrl + 'place-img-01-01' + '.png')
          this.$returnOfficeHour.html('<strong>업무시간</strong> | 업무시간 : 9-10 출구 : 06:00 ~ 22:00 / 5-6 출구 : 24시간');
        }
        $('#flab05').attr('disabled',false);
      }

    }else{ // 반납 장소 선택 ActionSheet
      $(selected).text($(e.target).parents('label').attr('value')); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center'));

      // 약도 이미지 변경
      var imgUrl1 = this.$returnImg.attr('src');
      var startLen1 = imgUrl1.lastIndexOf('/');
      var cdnUrl1 = imgUrl1.substring(0,startLen1+1);
      this.$returnImg.attr('src', cdnUrl1 + $(e.target).parents('label').attr('data-img') + '.png');
      this.$returnOfficeHour.html($(e.target).parents('label').attr('data-officehour'));
    }

    this._popupService.close();
  },

  /**
   * @function
   * @desc 정보수정 하단 버튼 활성화/비활성화 처리
   * @param state - 발생한 event 종류
   * @private
   */
  _changeCheck : function(state){
    if(state === 'keyup'){
      if(this.$inputPhone.val().length > 11){
        this.$inputPhone.val(this.$inputPhone.val().substring(0,11));
      }
    }

    var dateCheck = true;

    if(this.$inputEditSdate.val() === '' || this.$inputEditEdate.val() === ''){
      dateCheck = false;
    }

    // 예약 수정 팝업에서 예약 시작일, 예약 종료일, 핸드폰 번호 입력 되어있을 경우만 하단 버튼 활성화
    var self = this;
    setTimeout(function(){
      if(self.$inputPhone.val().length > 0 && dateCheck){
        self.$btnRegister.removeAttr('disabled');
      }else{
        self.$btnRegister.attr('disabled','disabled');
      }
    },0);
  },

  /**
   * @function
   * @desc 핸드폰 번호 하이픈(-) 생성
   * @private
   */
  _insertDashPhone : function() {
    // 9자리 이하 : 010-000-000, 10자리 이하 : 010-000-0000, 11자리 이하 010-0000-0000
    var phoneNum = this.$inputPhone.val().replace(/\-/gi, '');
    var hypenPhoneNum = Tw.FormatHelper.getDashedCellPhoneNumber(phoneNum);
    this.$inputPhone.val(hypenPhoneNum);
  },

  /**
   * @function
   * @desc Event listener for the button click on '#flab01'(핸드폰 번호 입력)
   * @private
   */
  _removeDashPhone : function() {
    var phoneNum = this.$inputPhone.val().replace(/\-/gi, '');
    this.$inputPhone.val(phoneNum);
  },

  /**
   * @function
   * @desc BFF_10_0066(new) 로밍> T파이 임대 > T파이 예약 수정 Request
   * @param e
   * @returns {*|void}
   * @private
   */
  _handleEditReservation: function(e) {
    var inputNumber = this.$inputPhone.val();
    if (!Tw.ValidationHelper.isCellPhone(inputNumber)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE, null, null, null, $(e.currentTarget));
    }

    // 시작일을 종료일 이후로 설정
    if (Tw.DateHelper.getDifference(this.$inputEditEdate.val(), this.$inputEditSdate.val()) < 0) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A84.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A84.TITLE, null, null, null, $(e.currentTarget));
    }

    // 시작일이 minDate(이틀 뒤)보다 작게 설정
    var getMinDate = this.$inputEditSdate.attr('min');
    if (Tw.DateHelper.getDifference(getMinDate, this.$inputEditSdate.val()) > 0) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A85.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A85.TITLE, null, null, null, $(e.currentTarget));
    }

    // 임대시작일 또는 반납일이 일요일 + 대구 황금점일 경우 Alert 호출 (휴무일)
    if ( this.$inputReceive.attr('data-booth') === '1430452300' ) {
      if ( Tw.DateHelper.getDayOfWeek(this.$inputEditSdate.val()) === '일' || Tw.DateHelper.getDayOfWeek(this.$inputEditEdate.val()) === '일' ) {
        return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A95.MSG,
          Tw.ALERT_MSG_PRODUCT.ALERT_3_A95.TITLE, null, null, null, $(e.currentTarget));
      }
    }

    var expbranchnm = this.$inputReturn.text();
    var boothcode = this.$inputReceive.attr('data-booth');
    var boothnm = this.$inputReceive.text();
    var impbranch = this.$inputReceive.attr('data-center');
    var expbranch = this.$inputReturn.attr('data-center');
    var rentFrom = this.$inputEditSdate.val().replace(/\-/gi, '');
    var rentTo = this.$inputEditEdate.val().replace(/\-/gi, '');
    var contphonenum = this.$inputPhone.val().replace(/\-/gi, '');
    var hsrsvrcvdtm = this._dateHelper.getCurrentDateTime('YYYYMMDD');
    var rentalmgmtnum = this.$btnRegister.attr('data-mgmt');
    var opClCd = this.$btnRegister.attr('data-opclcd');

    var params = {
      'rentalmgmtnum' : rentalmgmtnum,
      'rentFrom': rentFrom,
      'rentTo': rentTo,
      'impbranch': impbranch,
      'expbranch': expbranch,
      'expbranchnm': expbranchnm,
      'hsrsvrcvdtm': hsrsvrcvdtm,
      'boothcode': boothcode,
      'boothnm': boothnm,
      'contphonenum': contphonenum,
      'opClCd': opClCd,
      'phonemdlcd': 'A00B',
      'romingTypCd': '28',
      'type': 'U'
    };

    this._apiService.request(Tw.API_CMD.BFF_10_0066, params)
      .done($.proxy(this._handleSuccessEditReservation, this, $(e.currentTarget)))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc BFF_10_0066(new) 로밍> T파이 임대 > T파이 예약 수정 Response
   * @param e
   * @param res
   * @private
   */
  _handleSuccessEditReservation: function(e, res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A27;
        this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._reload, this), null, $(e.currentTarget));
    }else{
      this._onFail(res);
    }
  },

  /**
   * @function
   * @desc T로밍센터로 이동
   * @private
   */
  _goRoamingCenter: function() {
    this._historyService.goLoad('/product/roaming/info/center');
  },

  /**
   * @function
   * @desc 페이지 Reload
   * @private
   */
  _reload: function() {
    this._popupService.close();
    var self = this;
    setTimeout(function(){
      self._historyService.reload();
    },100);
  },

  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }

};