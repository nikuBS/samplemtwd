/**
 * FileName: myt-data.familydata.history.js
 * @author Jiyoung Jo
 * Date: 2019.01.21
 */

Tw.MyTDataFamilyHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._histories = histories;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyHistory.prototype = {
  _init: function() {
    this._historyChange = new Tw.MyTDataFamilyHistoryChange();
    this._ingTmpl = Handlebars.compile($('#fe-tmpl-ing').html());
    this._afterTmpl = Handlebars.compile($('#fe-tmpl-after').html());
    this._noneTmpl = Handlebars.compile($('#fe-tmpl-after-none').html());
    this._itemsTmpl = Handlebars.compile($('#fe-tmpl-items').html());
    this._leftCount = this._histories.length - Tw.DEFAULT_LIST_COUNT;
  },

  _bindEvent: function() {
    this.$container.on('click', '.fe-before', $.proxy(this._handleRetrieveData, this));
    this.$container.on('click', '.fe-edit', $.proxy(this._handleClickEditData, this));
    this.$container.on('click', '.btn-more', $.proxy(this._handleLoadMore, this));
  },

  _cachedElement: function() {
    this.$list = this.$container.find('ul.type1');
  },

  _handleRetrieveData: function(e) {
    var $target = $(e.currentTarget),
      $parent = $target.parent('li');

    $target.addClass('none').attr('aria-hidden', true);
    $parent.append(this._ingTmpl());
    this._requestRetrieve('0', $target, $parent);
  },

  _requestRetrieve: function(requestCount, $before, $parent) {
    var serial = $parent.data('serial-number');
    // this._handleDoneRetrieve($before, $parent, { code: '00', result: { remGbGty: '1', remMbGty: '11' } });
    this._apiService
      .request(Tw.API_CMD.BFF_06_0072, { reqCnt: requestCount, shrpotSerNo: serial })
      .done($.proxy(this._handleDoneRetrieve, this, $before, $parent));
  },

  _handleDoneRetrieve: function($before, $parent, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
      this._setRetrieveStatus($before, resp);
      return;
    }

    if (resp.result.nextReqYn === 'Y') {
      setTimeout($.proxy(this._requestRetrieve, this, resp.result.reqCnt, $before, $parent), 3000);
    } else if (!resp.result.remGbGty && !resp.result.remMbGty) {
      this._setRetrieveStatus($before);
    } else {
      this._handleSuccessRetrieve(resp.result, $before, $parent);
    }
  },

  _setRetrieveStatus: function($before, resp) {
    $before.removeClass('none').attr('aria-hidden', false);
    $before
      .siblings('.fe-ing')
      .addClass('none')
      .attr('aria-hidden', true);
    if (resp && resp.code) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A218, Tw.POPUP_TITLE.NOTIFY, undefined, undefined, undefined, $before);
    }
  },

  _handleSuccessRetrieve: function(share, $before, $parent) {
    var serial = $parent.data('serial-number');
    $before.siblings('.fe-ing').remove();

    var nData = Number((Number(share.remGbGty) + Number(share.remMbGty) / 1024 || 0).toFixed(2));
    if (nData > 0) {
      if (nData < 1) {
        $parent.append(this._afterTmpl({ data: share.remMbGty + Tw.DATA_UNIT.MB, serial: serial, gb: share.remGbGty, mb: share.remMbGty }));
      } else {
        $parent.append(this._afterTmpl({ data: nData + Tw.DATA_UNIT.GB, serial: serial, gb: share.remGbGty, mb: share.remMbGty }));
      }
    } else {
      $parent.append(this._noneTmpl({}));
    }
  },

  _handleClickEditData: function(e) {
    var $target = $(e.currentTarget),
      $parent = $target.closest('li'),
      idx = $parent.data('idx') || 0,
      serial = $parent.data('serial-number'),
      changable = {
        gb: $target.data('gb'),
        mb: $target.data('mb')
      };

    changable.data = Number((Number(changable.gb) + Number(changable.mb) / 1024 || 0).toFixed(2));

    if (serial) {
      this._apiService
        .request(Tw.API_CMD.BFF_06_0073, { shrpotSerNo: serial })
        .done($.proxy(this._handleDoneGetHistories, this, $parent, idx, changable));
    }
  },

  _handleDoneGetHistories: function($parent, idx, changable, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var detail = this._histories[idx];
    var histories = _.map(resp.result.sharePotCancel || [], function(history) {
      history.cancelAplyDt = Tw.DateHelper.getShortDate(history.cancelAplyDt);
      return history;
    });

    var $target = $parent.find('.fe-edit');

    this._popupService.open(
      {
        hbs: 'DC_02_04_01',
        layer: true,
        detail: detail,
        data: changable.data,
        histories: histories,
        lessThanOne: changable.data < 1
      },
      $.proxy(this._handleOpenChangePopup, this, $parent, changable),
      $.proxy(this._handleCloseChangePopup, this, $target),
      'change',
      $target
    );
  },

  _handleCloseChangePopup: function($target) {
    if (this._historyChange.isSuccess) {
      this._historyChange.isSuccess = false;
      this._popupService.open(
        {
          hbs: 'complete',
          text: Tw.MYT_DATA_FAMILY_SUCCESS_CHANGE_DATA,
          layer: true
        },
        $.proxy(this._handleOpenComplete, this),
        undefined,
        undefined,
        $target
      );
    }
  },

  _handleOpenComplete: function($layer) {
    $layer.on('click', '.fe-submain', this._popupService.close);
  },

  _handleOpenChangePopup: function($parent, changable, $layer) {
    this._historyChange.init($layer, $parent, changable);
    if (changable.data < 1) {
      $layer.find('.fe-all').trigger('click');
    }
    $layer.on('click', '.prev-step', this._popupService.close);
  },

  // _handleClickClose: function() {
  //   this._popupService.close();
  // this._popupService.openConfirmButton(
  //   Tw.ALERT_CANCEL,
  //   null,
  //   $.proxy(this._goBack, this),
  //   $.proxy(this._handleAfterClose, this),
  //   Tw.BUTTON_LABEL.NO,
  //   Tw.BUTTON_LABEL.YES
  // );
  // },

  // _goBack: function() {
  //   this._popupService.close();
  //   this._isClose = true;
  // },

  // _handleAfterClose: function() {
  //   if (this._isClose) {
  //     history.back();
  //     this._isClose = false;
  //   }
  // },

  _handleLoadMore: function(e) {
    var display = this._histories.length - this._leftCount,
      items = _.map(this._histories.slice(display, display + Tw.DEFAULT_LIST_COUNT), function(item, idx) {
        item.idx = display + idx;
        return item;
      });

    this.$list.append(this._itemsTmpl({ items: items }));
    this._leftCount = this._leftCount - Tw.DEFAULT_LIST_COUNT;
    if (this._leftCount <= 0) {
      $(e.currentTarget).remove();
    }
  }
};
