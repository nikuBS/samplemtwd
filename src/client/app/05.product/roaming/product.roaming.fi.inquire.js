/**
 * FileName: product.roaming.fi.inquire.js
 * Author: 김승규 (ksk4788@pineone.com)
 * Date: 2018.11.27
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
    this.$btnPopupClose = this.$container.find('.popup-closeBtn');
    this.$certBtn = this.$container.find('#fe-cert');
  },

  _bindEvent: function() {
    this.$inquire.on('click', $.proxy(this._getTfiResponse, this));
    this.$container.on('click', '#fe-edit', $.proxy(this._clickEditBtn, this));
    this.$container.on('click', '#fe-cancel', $.proxy(this._clickCancelBtn, this));
    this.$container.on('click', '.bt-more', $.proxy(this._onMore, this));
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
    this.$container.on('change', '#flab02', $.proxy(this._changeCheck, this));
    this.$container.on('change', '#flab03', $.proxy(this._changeCheck, this));
    this.$certBtn.on('click', $.proxy(this._getTfiResponse, this));
  },

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

  _getTfiResponse: function(state) {
    if(state === 'cancel'){
      //예약 취소시 스크롤 상단 위치
      $('.container-wrap').scrollTop(0);
    };

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
      .done($.proxy(this._renderTemplate, this));
  },

  _renderTemplate: function(res) {
    if(res.code === Tw.API_CODE.CODE_00){
      res = res.result;
      this._renderListOne(res);
    }else{
      this._onFail(res);
    }
  },

  _changeCountryCode: function(code) {
    //한글로된 국가 배열 -> 코드 배열로 교체
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

  _parseList: function(res) {
    this._receiveObj = Tw.ROAMING_RECEIVE_CODE;
    this._returnObj = Tw.ROAMING_RETURN_CODE;

    for( var x in res){
      res[x].visit_nat_lst = this._changeCountryCode(res[x].visit_nat_lst);
      res[x].show_rental_sale_org_id = this._returnObj[res[x].rental_sale_org_id].name;
      res[x].impbranch = this._receiveObj[res[x].rental_booth_org_id].code;
      res[x].show_rental_booth_org_id = this._receiveObj[res[x].rental_booth_org_id].name;
      res[x].rsv_rcv_dtm = this._dateHelper.getShortDateNoDot(res[x].rsv_rcv_dtm);
      if(this._dateHelper.getDifference(res[x].rental_schd_sta_dtm.substr(0,8)) > 0){
        res[x].dateDifference = this._dateHelper.getDifference(res[x].rental_schd_sta_dtm.substr(0,8));
      }
      res[x].rental_schd_sta_dtm = this._dateHelper.getShortDateWithFormat(res[x].rental_schd_sta_dtm.substr(0,8), 'YYYY.M.DD');
      res[x].rental_schd_end_dtm = this._dateHelper.getShortDateWithFormat(res[x].rental_schd_end_dtm, 'YYYY.M.DD');
    }

    return res;
  },
  
  _renderListOne: function(res){
    this._popupService.close();

    var list = res.romlist;

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

    if ( list.length > 0 ){
      this._totoalList = _.chunk(list, Tw.DEFAULT_LIST_COUNT);
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  // 예약내역 템플릿 생성
  _renderList: function($container, res) {
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

  _moreButton: function(){
    var nextList = _.first(this._totoalList);

    if ( nextList ) {
      this.$moreCnt.text( '(0)'.replace('0', nextList.length) );
      this.$more.show();
    } else {
      this.$more.hide();
    }
  },

  _onMore : function () {
    if( this._totoalList.length > 0 ){
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

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
      .done($.proxy(this._openEditPop, this, changeCountry));
  },

  _clickCancelBtn : function(selected){
    var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A26;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
      $.proxy(this._handleConfirmAlert, this, selected), null, Tw.BUTTON_LABEL.CLOSE, ALERT.BUTTON);
  },

  _handleConfirmAlert : function(selected){

    var data =  JSON.parse($(selected.target).attr('data-response'));

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
      .done($.proxy(this._openCancelAlert, this));
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

  _cancleCompletePop: function (){
    var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A28;
    this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._getTfiResponse, this, 'cancel'));
  },

  _openEditPop : function(changeCountry ,res){
    if(res.code === Tw.API_CODE.CODE_00){
      res.result.rominfo.rental_schd_sta_dtm = this._dateHelper.getShortDateWithFormat(res.result.rominfo.rental_schd_sta_dtm.substr(0,8), 'YYYY-MM-DD');
      res.result.rominfo.rental_schd_end_dtm = this._dateHelper.getShortDateWithFormat(res.result.rominfo.rental_schd_end_dtm, 'YYYY-MM-DD');
      res.result.rominfo.receive_center_img =  this._receiveObj[res.result.rominfo.rental_booth_org_id].img;
      res.result.rominfo.return_center_img = this._returnObj[res.result.rominfo.rental_sale_org_id].img;
      res.result.rominfo.show_rtn_sale_org_nm = this._returnObj[res.result.rominfo.rental_sale_org_id].name;
      res.result.rominfo.show_rental_sale_org_nm = this._receiveObj[res.result.rominfo.rental_booth_org_id].name;
      res.result.rominfo.changeCountry = changeCountry;
      res.result.minDate = moment().add(2, 'days').format('YYYY-MM-DD');
      res.result.maxDate = this._dateHelper.getEndOfMonSubtractDate(undefined,-6,'YYYY-MM-DD');

      var data = res.result;

      this._popupService.open({
          hbs: 'RM_14_03_02_01_01',
          layer: true,
          data: data
        },
        $.proxy(this._onEditPopOpened, this), null, 'edit'
      );
    }else{
      this._onFail(res);
    }
  },

  _onEditPopOpened : function($root){
    $root.on('blur', '#flab01', $.proxy(this._insertDashPhone, this));
    $root.on('click', '#flab01', $.proxy(this._removeDashPhone, this));
    $root.on('keyup paste', '#flab01', $.proxy(this._changeCheck, this, 'keyup'));
    $root.on('change', '#flab01', $.proxy(this._changeCheck, this));
    $root.on('click', 'button[id=flab04],button[id=flab05]', $.proxy(this._openLocationPop, this));
    $root.on('click', '.cancel', $.proxy(this._changeCheck, this));
    $root.on('click', '#fe-register', $.proxy(this._handleEditReservation, this));
    $root.on('click', '#fe-link', $.proxy(this._goRoamingCenter, this));
    this._insertDashPhone();
    this._changeCheck();
  },

  _openLocationPop : function(e){
    var selected = e.target;
    var data = [];

    if(selected.id === 'flab04'){
      //수령 장소 선택
      data = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE;
    }else{
      //반납 장소 선택
      data = Tw.POPUP_TPL.ROAMING_RETURN_PLACE;
    }

    var currentCenter = $(selected).text();

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, selected, currentCenter)
    );

  },

  _onActionSheetOpened: function (selected, currentCenter, $layer) {
    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === currentCenter){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    })
    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, selected));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  _onActionSelected: function (selected, e) {

    if(selected.id === 'flab04'){
      $(selected).text($(e.target).parents('label').attr('value')); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center')); //부스코드를 data-code값에 넣기
      $(selected).attr('data-booth',$(e.target).parents('label').attr('data-booth'));
      this.selectIdx = Number($(e.target).parents('label').attr('id')) - 6; //예약 완료 페이지에 넘기는 값

      //약도 이미지 변경
      var imgUrl = $('#fe-receive-img').attr('src');
      var startLen = imgUrl.lastIndexOf('/');
      var cdnUrl = imgUrl.substring(0,startLen+1);
      $('#fe-receive-img').attr('src', cdnUrl + $(e.target).parents('label').attr('data-img') + '.png');
    }else{
      $(selected).text($(e.target).parents('label').attr('value')); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center'));

      //약도 이미지 변경
      var imgUrl = $('#fe-return-img').attr('src');
      var startLen = imgUrl.lastIndexOf('/');
      var cdnUrl = imgUrl.substring(0,startLen+1);
      $('#fe-return-img').attr('src', cdnUrl + $(e.target).parents('label').attr('data-img') + '.png');
    }

    this._popupService.close();
  },

  _changeCheck : function(state){
    if(state === 'keyup'){
      if($('#flab01').val().length > 11){
        $('#flab01').val($('#flab01').val().substring(0,11));
      }
    }

    var dateCheck = true;

    if($('#flab02').val() === '' || $('#flab03').val() === ''){
      dateCheck = false;
    }

    setTimeout(function(){
      if($('#flab01').val().length > 0 && dateCheck){
        $('.bt-red1 button').removeAttr('disabled');
      }else{
        $('.bt-red1 button').attr('disabled','disabled');
      }
    },0);
  },

  _insertDashPhone : function() {
    //9자리 이하 : 010-000-000, 10자리 이하 : 010-000-0000, 11자리 이하 010-0000-0000
    var phoneNum = $('#flab01').val().replace(/\-/gi, '');
    var hypenPhoneNum = Tw.FormatHelper.getDashedCellPhoneNumber(phoneNum);
    $('#flab01').val(hypenPhoneNum);
  },

  _removeDashPhone : function() {
    var phoneNum = $('#flab01').val().replace(/\-/gi, '');
    $('#flab01').val(phoneNum);
  },

  _handleEditReservation: function() {
    var inputNumber = $('#flab01').val();
    if (!Tw.ValidationHelper.isCellPhone(inputNumber)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    var expbranchnm = $('#flab05').text();
    var boothcode = $('#flab04').attr('data-booth');
    var boothnm = $('#flab04').text();
    var impbranch = $('#flab04').attr('data-center');
    var expbranch = $('#flab05').attr('data-center');
    var rentFrom = $('#flab02').val().replace(/\-/gi, '');
    var rentTo = $('#flab03').val().replace(/\-/gi, '');
    var contphonenum = $('#flab01').val().replace(/\-/gi, '');
    var hsrsvrcvdtm = this._dateHelper.getCurrentDateTime('YYYYMMDD');
    var rentalmgmtnum = $('#fe-register').attr('data-mgmt');
    var opClCd = $('#fe-register').attr('data-opclcd');

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

    this._apiService.request(Tw.API_CMD.BFF_10_0066, params).done($.proxy(this._handleSuccessEditReservation, this));
  },

  _handleSuccessEditReservation: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A27;
        this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._reload, this));
    }else{
      this._onFail(res);
    }
  },

  _goRoamingGuide: function() {
    this._historyService.goLoad('/product/roaming/fi/guide');
  },

  _goRoamingCenter: function() {
    this._historyService.goLoad('/product/roaming/info/center');
  },

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