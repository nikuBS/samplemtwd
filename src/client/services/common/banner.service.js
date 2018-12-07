Tw.BannerService = function(rootEl) {
  this.$conatiner = rootEl;
  this._bindEvent();
};

Tw.BannerService.prototype = {
  _bindEvent: function() {
    this.$conatiner.on('click', '.fe-banner', $.proxy(this._openBannerLink, this));
  },

  _openBannerLink: function(e) {
    var target = e.currentTarget,
      linkType = target.getAttribute('data-link-type'),
      link = target.getAttribute('data-link'),
      isBill = target.getAttribute('data-is-bill');

    switch (linkType) {
      case Tw.BANNER_LINK_TYPE.CHANNEL_APP:
      case Tw.BANNER_LINK_TYPE.CHANNER_WEB: {
        window.location.href = link;
        break;
      }
      case Tw.BANNER_LINK_TYPE.OTHER_APP:
      case Tw.BANNER_LINK_TYPE.OTHER_WEB: {
        if (isBill) {
          Tw.CommonHelper.showDataCharge(function() {
            Tw.CommonHelper.openUrlExternal(link);
          });
        } else {
          Tw.CommonHelper.openUrlExternal(link);
        }
        break;
      }
    }
  }
};
