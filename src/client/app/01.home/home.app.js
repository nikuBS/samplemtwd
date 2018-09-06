import PopupService from "../../services/popup.service";

class HomeApp {
  constructor() {
    var popupService = new PopupService();
    popupService.openAlert('test');
  }
}