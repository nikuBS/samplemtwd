/**
 * FileName: myt-fare.info.bill-tax.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareInfoBillTax = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this.data = JSON.parse(data);

  this._cachedElement();
  
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoBillTax.prototype = {
  _init: function () {
    var initedListTemplate;
    var totalDataCounter = this.data.items.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = 20;

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.items.slice(0, this.listRenderPerPage);
      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      initedListTemplate = this.$template.$listTaxWrapper({
        limitMonth:this.data.limitMonth,
        listViewMoreHide:this.listViewMoreHide,
        renderableListData:this.renderableListData,
      });
    }

    this.$template.$domTaxListWrapper.append(initedListTemplate);

    this.$listWrapper = this.$container.find('#fe-tax-list-wrapper');
    this.$btnListViewMorewrapper = this.$listWrapper.find('.bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updateTaxList, this)); // 더보기버튼
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
    this.$listWrapper.on('click', '.myfare-result-wrap .bt-slice button', $.proxy(this._reRequestHandler, this));
  },
  _updateTaxList: function (e) {
    this._updateTaxListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.items.length ? 'none' : ''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var insertCompareData = this.data.items[this.listLastIndex - this.listRenderPerPage - 1],
        $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML;
      
      $domAppendTarget = $('.fe-list-inner div.myfare-result-wrap:last-child');

      renderedHTML = this.$template.$templateTaxItem({renderableListData: [o]});

      $domAppendTarget.after(renderedHTML);

    }, this));
  },

  _updateTaxListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.items.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.items.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.items.length ?
        this.data.items.length : this.listNextIndex;
  },

  _reRequestHandler: function (e) {
    var target = $(e.currentTarget);

    this.isFax  = target.attr('class').search('fax') >= 0;
    this.targetData = this.data.items[target.data('listId')];

    if (this.isFax) {
      this._openResendByFax(this.targetData);
    } else {
      this._openResendByEmail(this.targetData);
    }
  },

  _cachedElement: function () {
    this.$template = {
      $domTaxListWrapper: this.$container.find('#fe-tax-list-wrapper'),

      $templateTaxItem: Handlebars.compile($('#fe-template-tax-items').html()),
      $listTaxWrapper: Handlebars.compile($('#fe-template-tax-list').html()),


      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    Handlebars.registerPartial('taxList', $('#fe-template-tax-items').html());

  },
  _bindEvent: function () {

  },
  _updateViewMoreBtnRestCounter: function (e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  },
  _openResendByFax: function (data) {
    data.hbs = 'MF_08_01_01_01';
    this._popupService.open(data,
        $.proxy(this._openResendByFaxCallback, this), null,
        Tw.MYT_PAYMENT_HISTORY_HASH.BILL_RESEND_BY_FAX,
        'byFax'
    );
  },
  _openResendByFaxCallback: function ($container) {
    this.$faxNumberInput = $container.find('.input input[type="number"]');
    this.$rerequestSendBtn = $container.find('.bt-slice button');
    this.$rerequestSendBtn.on('click', $.proxy(this._sendRerequestByFax, this));
    this.$faxNumberInput.on('keyup', $.proxy(this._checkFaxNumber, this));
    this.$faxNumberInput.siblings('.cancel').on('click', $.proxy(function() {
      this.$rerequestSendBtn.attr('disabled', true);
    }, this));
    this.$faxNumberInput.trigger('keyup');
  },
  _checkFaxNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
    this.$rerequestSendBtn.attr('disabled', ( $(e.currentTarget).val().length < 8 ));
  },
  _sendRerequestByFax: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0019, {
        fax:this.$faxNumberInput.val(),
        selSearch:this.targetData.taxBillYearMonth,
        selType:'M'
      })
        .done($.proxy(this._resSendCallback, this)).fail();
  },
  _openResendByEmail: function (data) {
    data.hbs = 'MF_08_01_01_02';
    this._popupService.open(data,
        $.proxy(this._openResendByEmailCallback, this), null,
        Tw.MYT_PAYMENT_HISTORY_HASH.BILL_RESEND_BY_EMAIL,
        'byEmail'
    );
  },
  _openResendByEmailCallback: function ($container) {
    this.$emailInput = $container.find('.input input[type="text"]');
    this.$rerequestSendBtn = $container.find('.bt-slice button');
    this.$rerequestSendBtn.on('click', $.proxy(this._sendRerequestByEmail, this));
    this.$emailInput.on('keyup', $.proxy(this._checkEmailValue, this));
    this.$emailInput.siblings('.cancel').on('click', $.proxy(function() {
      this.$rerequestSendBtn.attr('disabled', true);
    }, this));
    this.$emailInput.trigger('keyup');
  },
  _checkEmailValue: function (e) {
    this.$rerequestSendBtn.attr('disabled', !Tw.ValidationHelper.isEmail($(e.currentTarget).val()));
  },
  _sendRerequestByEmail: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0018, {
        eMail:this.$emailInput.val(), 
        selType:'M', 
        selSearch:this.targetData.taxBillYearMonth
      }).done($.proxy(this._resSendCallback, this)).fail();
  },
  _resSendCallback: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }
    this._popupService.openAlert(this.isFax ? this.$faxNumberInput+ " "+ Tw.ALERT_MSG_MYT_FARE.ALERT_2_A28 : this.$emailInput.val()+ " "+ Tw.ALERT_MSG_MYT_FARE.ALERT_2_A29,
        Tw.POPUP_TITLE.NOTIFY, Tw.BUTTON_LABEL.CONFIRM, $.proxy(function() {
          this._popupService.close();
        }, this));
  }
};