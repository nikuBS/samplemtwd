/**
 * FileName: common.util.intro.js
 */

Tw.CommonUtilIntro = function (rootEl) {
  this.$container = rootEl;
  this.videoManager = (function () {
    var $videos = rootEl.find('video');
    var currentVideos = [];

    var _calculateOffset = function () {
      var headerHeight = $('.h-belt').height();

      return function (element) {
        var $element = $(element);
        return {
          top: $element.offset().top,
          bottom: $element.offset().top + $element.height() - headerHeight
        };
      };
    }();

    function _getCurrentVideos(top) {
      var bottom = top + $(window).height();
      return $videos.filter(function () {
        return bottom >= this.dataset.top && top <= this.dataset.bottom;
      });
    }

    function _canPlay() {
      currentVideos = _getCurrentVideos(window.scrollY);
      return currentVideos.length > 0;
    }

    function _isCurrentVideo(video) {
      for (var i = 0, len = currentVideos.length; i < len; i++) {
        if (currentVideos[i] === video) {
          return true;
        }
      }
      return false;
    }

    function _pause() {
      $videos.filter(function () {
        return !_isCurrentVideo(this) && !this.paused;
      }).each(function () {
        this.currentTime = 0;
        this.pause();
      });
    }

    function _play() {
      _pause();
      for (var i = 0, len = currentVideos.length; i < len; i++) {
        if (currentVideos[i].paused) {
          currentVideos[i].play();
        }
      }
    }

    // calculate video offest
    $videos.each(function () {
      var offset = _calculateOffset(this);
      this.dataset.top = offset.top;
      this.dataset.bottom = offset.bottom;
    });

    return {
      play: _play,
      pause: _pause,
      canPlay: _canPlay
    };
  })();

  // event binding
  if (!Tw.BrowserHelper.isApp()) {
    this.$container.on('click', '.bt-down', function () {
      var offsetAppDownload = $(document).height();
      return function () {
        window.scrollTo(0, offsetAppDownload);
      };
    }());
  }

  this.$container.on('click', '.icon-gnb-close', function () {
    history.back();
  });

  $(window).on('scroll', function () {
    if (this.videoManager.canPlay()) {
      this.videoManager.play();
    } else {
      this.videoManager.pause();
    }
  }.bind(this));

};
