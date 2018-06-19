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
  lineInfo: {},
  $init: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
      .done($.proxy(this.setDefaultLine, this));
  },

  _cachedElement: function () {
    this.$btn_line = $('#line-set');
  },

  _bindEvent: function () {
    this.$container.on('click', '.select-submit', $.proxy(this.setCurrentLine, this));
    this.$container.on('click', '#line-set', $.proxy(this.renderCurrentLine, this));
  },

  renderCurrentLine: function (e) {
    var sCurrentNumber = $(e.currentTarget).text().trim();

    setTimeout(function () {
      $('.radiobox').each(function (idx, item) {
        var itemNumber = $(item).text().trim();

        if ( itemNumber == sCurrentNumber ) {
          $(item).addClass('checked');
        }
      });
    }, 50);
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

    this._apiService.request(Tw.API_CMD.BFF_03_0004, {}, { svcMgmtNum: this.lineInfo.svcMgmtNum })
      .done(function (res) {
        this.$container.trigger('updateLineInfo', { lineInfo: this.lineInfo, lineList: this.lineList });
      }.bind(this));
  }
});
