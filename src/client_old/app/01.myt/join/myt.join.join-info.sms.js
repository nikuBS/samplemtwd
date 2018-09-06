/**
 * FileName: myt.join.join-info.sms
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.07
 */
Tw.MyTJoinJoinInfoSms = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._validationH = Tw.ValidationHelper;
  this._history = new Tw.HistoryService(rootEl);
  this._init();
};

Tw.MyTJoinJoinInfoSms.prototype = {

  _init : function() {
    this._initVariables();
    this._bindEvent();
  },

  _initVariables: function () {
    this.$hpFirst = this.$container.find('#fe-hp-first');
    this.$hpNumbers = this.$container.find('.fe-num');
    this.$submit = this.$container.find('#fe-submit');
    this.$agree = this.$container.find('#fe-agree');
  },

  _bindEvent: function () {
    this.$hpFirst.on('click',$.proxy(this._openChoiceHpNum, this));
    this.$submit.on('click',$.proxy(this._submit, this));
  },

  _openChoiceHpNum : function() {
    var hpNumbers = [];
    _.forEach(Tw.HP_NUM_LIST, function (data) {
      var obj = {
        attr: 'class="hp-nums"',
        text: data
      };
      hpNumbers.push(obj);  
    });

    this._popupService.openChoice(Tw.POPUP_TITLE.MYT_SMS, hpNumbers, '', $.proxy(this._onOpenList, this));
  },

  _onOpenList : function ($layer) {
    $layer.on('click', '.hp-nums', $.proxy(this._selectChioceEvent, this));
  },

  _selectChioceEvent : function (event) {
    var $target = $(event.currentTarget);
    this.$hpFirst.text($target.text());
    this._popupService.close();
  },

  _validation : function () {
    var rs = {
      msg : '',
      code : '10'
    };
    // 개인정보 동의 체크여부
    if ( !this.$agree.is(':checked')  ) {
      rs.msg = Tw.MSG_MYT.SMS_A01;
      return rs;
    }

    var nums = [];
    nums.push(this.$hpNumbers.eq(0).text());
    nums.push(this.$hpNumbers.eq(1).val());
    nums.push(this.$hpNumbers.eq(2).val());

    var result = _.every(nums.slice(0), function (number) {
      if ( number === '' ) {
        rs.msg = Tw.MSG_MYT.SMS_A03;
        return false;
      } else {
        return true;
      }
    });

    if ( !result ) {
      return rs;
    }

    // 핸드폰 입력부분에 문자 입력했는지 확인
    if ( !_.isFinite( nums.join('') ) || !this._validationH.isCellPhone( nums.join('') ) ) {
      rs.msg = Tw.MSG_MYT.SMS_A02;
      return rs;
    }

    rs.code = Tw.API_CODE.CODE_00;
    rs.hpNums = nums;
    return rs;
  },

  _submit : function () {
    var rs = this._validation();
    if( rs.code !== Tw.API_CODE.CODE_00 ){
      this._popupService.openAlert(rs.msg);
      return false;
    }

    var data = {
      tel_num1 : rs.hpNums[0],
      tel_num2 : rs.hpNums[1],
      tel_num3 : rs.hpNums[2]
    };

    this._apiService.request(Tw.API_CMD.BFF_05_0062, data)
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  _onSuccess : function (res) {
    if( res.code !== Tw.API_CODE.CODE_00 ){
      this._popupService.openAlert(res.msg, res.code);
    } else {
      this._history.goBack();
    }
  },

  _onFail : function (err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
