/**
 * FileName: product.roaming.fi.inquire-auth.js
 * Author: 김승규 (skt.P130715@partner.sk.com)
 * Date: 2018.11.27
 */
Tw.ProductRoamingFiInquireAuth = function (rootEl, countryCode) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._formatHelper = Tw.FormatHelper;
  this._historyService = new Tw.HistoryService();
  this._countryCode = JSON.parse(countryCode);
  this._init();
};

Tw.ProductRoamingFiInquireAuth.prototype = {

  _init: function() {
    this._cachedElement();
    this._bindEvent();
    this._getInitPeriod();
    this._getTfiResponse();;
  },

  _cachedElement: function() {
    this.$list = this.$container.find('#fe-list');
    this.$inputSdate = this.$container.find('#fe-sdate');
    this.$inputEdate = this.$container.find('#fe-edate');
    this.$inquire = this.$container.find('#fe-inquire');
  },

  _bindEvent: function() {
    this.$inquire.on('click', $.proxy(this._search,this));
    this.$container.on('click', '#fe-edit', $.proxy(this._clickEditBtn, this));
    this.$container.on('click', '#fe-cancel', $.proxy(this._clickCancelBtn, this));
  },

  _getInitPeriod: function() {
    //최초에 오늘 ~ 6개월 후 날짜 설정
    var startDate = moment().format('YYYY[-]MM[-]DD');
    var endDate = moment().add(+6, 'month').format('YYYY[-]MM[-]DD');

    this.$inputSdate.val(startDate);
    this.$inputEdate.val(endDate);
    this.page = 1;
  },

  // 조회 버튼 클릭 이벤트
  _search: function() {
    var sdate = $('#fe-sdate').val();
    var edate = $('#fe-edate').val();
  },

  _getTfiResponse: function() {
    var rentfrom = this._dateHelper.getShortDateWithFormat(this.$inputSdate.val(), 'YYYYMMDD' , 'YYYY-MM-DD');
    var rentto = this._dateHelper.getShortDateWithFormat(this.$inputEdate.val(), 'YYYYMMDD' , 'YYYY-MM-DD');
    this._apiService
      .request(Tw.API_CMD.BFF_10_0067, {
        page : this.page,
        rentfrom : rentfrom,
        rentto : rentto
      })
      .done($.proxy(this._renderTemplate, this));
  },

  _renderTemplate: function(res) {
    if(res.code === Tw.API_CODE.CODE_00){
      res = res.result;
      this._renderList(res);
    }
  },

  _changeCountryCode: function(code) {
    //한글로된 국가 배열 -> 코드 배열로 교체
    var codeArr = code.split(',');
    var allCountryCode = this._countryCode;
    codeArr = codeArr.map(function(x){return x});

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
    var receiveList = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE.data[0].list;
    var returnList = Tw.POPUP_TPL.ROAMING_RETURN_PLACE.data[0].list;
    var receiveObj = {};
    var returnObj = {};

    receiveList.forEach(function(element){
      var startlen = element.attr.indexOf('data-booth')+12;
      var key = element.attr.substr(startlen,10);
      receiveObj[key] = element.value;
    });
    returnList.forEach(function(element){
      var startlen = element.attr.indexOf('data-center')+13;
      var key = element.attr.substr(startlen,10);
      returnObj[key] = element.value;
    });

    for( var x in res.romlist){
      res.romlist[x].visit_nat_lst = this._changeCountryCode(res.romlist[x].visit_nat_lst);
      res.romlist[x].rental_sale_org_id = returnObj[res.romlist[x].rental_sale_org_id];
      res.romlist[x].rental_booth_org_id = receiveObj[res.romlist[x].rental_booth_org_id];
      res.romlist[x].rsv_rcv_dtm = this._dateHelper.getShortDateNoDot(res.rentfrom);
    }
    res.rentfrom = this._dateHelper.getShortDate(res.rentfrom);
    res.rentto = this._dateHelper.getShortDate(res.rentto);

    return res;
  },

  // 상단 템플릿 생성
  _renderList: function(res) {
    Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
    });

    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var data = this._parseList(res);

    var output = template({ list : data });
    this.$list.empty().append(output);

  },

  _clickEditBtn: function(e){
    var data =  JSON.parse($(e.target).attr('data-response'));
    var rsvrcvdtm = this._dateHelper.getShortDateWithFormat(data.rsv_rcv_dtm, 'YYYYMMDD', 'YYYY.M.DD');
    var rentalmgmtnum = data.rental_mgmt_num;
    var rentalgubun = data.rental_st_cd;
    var opclcd = data.op_cl_cd;

    this._apiService
      .request(Tw.API_CMD.BFF_10_0068, {
        rentalmgmtnum : rentalmgmtnum,
        opclcd : opclcd,
        rsvrcvdtm : rsvrcvdtm,
        rentalgubun : rentalgubun

      })
      .done($.proxy(this._openEditPop, this));
  },

  _clickCancelBtn : function(){
    var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A26;
    this._popupService.openConfirm(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleConfirmAlert, this));
  },

  _handleConfirmAlert : function(){
    this._apiService
      .request(Tw.API_CMD.BFF_10_0067, {
        page : this.page,
        rentfrom : rentfrom,
        rentto : rentto
      })
      .done($.proxy(this._renderTemplate, this));
  },

  _openEditPop : function(res){
    if(res.code === Tw.API_CODE.CODE_00){
      res.result.rominfo.rental_schd_sta_dtm = this._dateHelper.getShortDateWithFormat(res.result.rominfo.rental_schd_sta_dtm.substr(0,8), 'YYYY-MM-DD');
      res.result.rominfo.rental_schd_end_dtm = this._dateHelper.getShortDateWithFormat(res.result.rominfo.rental_schd_end_dtm, 'YYYY-MM-DD');
      var data = res.result;
      this.impbranch =

      this._popupService.open({
          hbs: 'RM_14_03_02_01_01',
          layer: true,
          data: data
        },
        $.proxy(this._onEditPopOpened, this)
      );
    }
  },

  _onEditPopOpened : function(){
    this.$container.on('blur', '#flab01', $.proxy(this._insertDashPhone, this));
    this.$container.on('click', '#flab01', $.proxy(this._removeDashPhone, this));
    this.$container.on('change keyup paste', '#flab01', $.proxy(this._changeCheck, this));
    this.$container.on('click', 'button[id=flab04],button[id=flab05]', $.proxy(this._openLocationPop, this));
    this.$container.on('click', '.cancel', $.proxy(this._changeCheck, this));
    this.$container.on('click', '#fe-register', $.proxy(this._handleEditReservation, this));
    this._changeCheck();
  },

  _openLocationPop : function(e){
    var selected = e.target;
    var title = '';
    var data = [];

    if(selected.id === 'flab04'){
      //수령 장소 선택
      title = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE.title;
      data = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE.data;
    }else{
      //반납 장소 선택
      title = Tw.POPUP_TPL.ROAMING_RETURN_PLACE.title;
      data = Tw.POPUP_TPL.ROAMING_RETURN_PLACE.data;
    }

    for(var x in data[0].list){
      data[0].list[x].option = 'hbs-card-type';
      if(data[0].list[x].value === $(selected).text()){
        data[0].list[x].option = 'checked';
      }
    }

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: title,
        data: data
      },
      $.proxy(this._onActionSheetOpened, this, selected)
    );
  },

  _onActionSheetOpened : function (selected, $root){
    $root.on('click', '.hbs-card-type', $.proxy(this._onActionSelected, this, selected));
  },

  _onActionSelected : function (selected, e){
    if($('.hbs-card-type').hasClass('checked')){
      $('.hbs-card-type').removeClass('checked');
    }
    $(e.target).parents('li').find('button').addClass('checked');
    if(selected.id === 'flab04'){
      $(selected).text($(e.target).parents('li').find('.info-value').text()); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('button').attr('data-center')); //부스코드를 data-code값에 넣기
      $(selected).attr('data-booth',$(e.target).parents('button').attr('data-booth'));
    }else{
      $(selected).text($(e.target).parents('li').find('.info-value').text());
      $(selected).attr('data-center',$(e.target).parents('button').attr('data-center'));
    }

    this._popupService.close();
  },

  _changeCheck : function(){
    setTimeout(function(){
      if($('#flab01').val().length > 0){
        $('.bt-red1 button').removeAttr('disabled');
      }else{
        $('.bt-red1 button').attr('disabled','disabled');
      }
    },0);
  },

  _insertDashPhone : function() {
    //9자리 이하 : 010-000-000, 10자리 이하 : 010-000-0000, 11자리 이하 010-0000-0000
    var phoneNum = $('#flab01').val();
    var hypenPhoneNum = Tw.FormatHelper.getDashedCellPhoneNumber(phoneNum);
    $('#flab01').val(hypenPhoneNum);
  },

  _removeDashPhone : function() {
    var phoneNum = $('#flab01').val().replace(/\-/gi, '');
    $('#flab01').val(phoneNum);
  },

  _handleEditReservation: function() {
    var expbranchnm = $('#flab05').text();
    var boothcode = $('#flab04').attr('data-booth');
    var boothnm = $('#flab04').text();
    var impbranch = $('#flab04').attr('data-center');
    var expbranch = $('#flab05').attr('data-center');
    var nationCode = $('#fe-visit-country').attr('data-list').split(',');
    var rentFrom = $('#flab02').val().replace(/\-/gi, '');
    var rentTo = $('#flab03').val().replace(/\-/gi, '');
    var contphonenum = $('#flab01').val().replace(/\-/gi, '');
    var hsrsvrcvdtm = this._dateHelper.getCurrentDateTime('YYYYMMDD');
    var rentalmgmtnum = $('#fe-register').attr('data-mgmt');

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
      'phonemdlcd': 'A00B',
      'contphonenum': contphonenum,
      'romingTypCd': '28',
      'nationcode': nationCode,
      'type': 'U'
    };

    this._apiService.request(Tw.API_CMD.BFF_10_0065, params).done($.proxy(this._handleSuccessEditReservation, this));
  },

  _handleSuccessEditReservation: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/product/roaming/fi/inquire-auth');
    }
  }

};