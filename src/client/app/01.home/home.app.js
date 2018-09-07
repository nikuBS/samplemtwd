import ApiService from '../../services/popup.service';

Tw.HomeMain = function () {
  var popupService = new ApiService();
  popupService.openAlert('test');
};
Tw.HomeMain.prototype = {

};

export default Tw.HomeMain;
