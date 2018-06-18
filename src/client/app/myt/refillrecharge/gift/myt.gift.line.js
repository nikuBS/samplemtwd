Tw.MytGiftLine = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this.$init();
};

Tw.MytGiftLine.prototype = Object.create(Tw.View.prototype);
Tw.MytGiftLine.prototype.constructor = Tw.MytGiftLine;

Tw.MytGiftLine.prototype = Object.assign(Tw.MytGiftLine.prototype, {
  lineIndex: 0,
  lineInfo: {},
  lineList: [],

  $init: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
      .done($.proxy(this.setDefaultLine, this));

    $(document).on('click', '.select-submit', function () {
      this.setCurrentLine();
    }.bind(this));
  },

  _cachedElement: function () {
    this.$btn_line = $('#btn_change_line');
  },

  _bindEvent: function () {
    this.$btn_line.on('click', function (e) {
      var sCurrentNumber = $(e.currentTarget).text().trim();

      setTimeout(function () {
        $('.radiobox').each(function (idx, item) {
          if ( $(item).text() == sCurrentNumber ) {
            $(item).addClass('checked');
          }
        });
      }, 50);
    });
  },

  getCurrentLine: function () {
    return this.lineInfo;
  },

  setDefaultLine: function (res) {
    this.lineList = res.result;

    var queryParams = Tw.UrlHelper.getQueryParams();

    if ( queryParams.lineIndex != null ) {
      this.lineIndex = Number(queryParams.lineIndex);
      this.lineInfo = this.lineList[this.lineIndex];
    }

    this.setCurrentLine();
  },

  setCurrentLine: function () {
    var sCurrentNumber = this.$btn_line.text().trim();

    if ( sCurrentNumber !== "" ) {
      this.lineInfo = _.find(this.lineList, function (line) {
        return line.svcNum == sCurrentNumber;
      });
    }

    $(document).trigger('updateLineInfo', this.lineInfo);
  }
});
