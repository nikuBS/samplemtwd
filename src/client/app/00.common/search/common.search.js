/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearch = function (rootEl,searchInfo) {

    this.$container = rootEl;
    this._historyService = new Tw.HistoryService();
    this._searchInfo = JSON.parse(this._decodeEscapeChar(searchInfo));
    this._init(this._searchInfo);
    this.$container.on('keyup','#keyword',$.proxy(this._inputChangeEvent,this));
};

Tw.CommonSearch.prototype = {
    _init : function (searchInfo) {
       this._immediateData =this._arrangeData(searchInfo.search[0].immediate.data);
       this._smartData = this._arrangeData(searchInfo.search[1].smart.data);
       this._shortcutData = this._arrangeData(searchInfo.search[2].shortcut.data);
       this._rateData = this._arrangeData(searchInfo.search[3].rate.data);
       this._serviceData = this._arrangeData(searchInfo.search[4].service.data);
       this._tvData = this._arrangeData(searchInfo.search[5].tv.data);
       this._roamingData = this._arrangeData(searchInfo.search[6].roaming.data);
       this._appData = this._arrangeData(searchInfo.search[7].app.data);
       this._directData = this._arrangeData(searchInfo.search[8].direct.data);
       this._membershipData = this._arrangeData(searchInfo.search[9].membership.data);
       this._eventData = this._arrangeData(searchInfo.search[10].event.data);
       this._saleData = this._arrangeData(searchInfo.search[11].sale.data);
       this._asData  = this._arrangeData(searchInfo.search[12].as.data);
       this._noticeData = this._arrangeData(searchInfo.search[13].notice.data);
       this._preventData = this._arrangeData(searchInfo.search[14].prevent.data);
       this._questionData = this._arrangeData(searchInfo.search[15].question.data);
       this._mannerData = this._arrangeData(searchInfo.search[16].manner.data);
       this._serviceInfoData = this._arrangeData(searchInfo.search[17].serviceInfo.data);
       this._siteInfoData = this._arrangeData(searchInfo.search[18].siteInfo.data);
       this._bannerData = this._arrangeData(searchInfo.search[19].banner.data);

        this._showShortcutList(this._shortcutData,this.$container.find('#shortcut_template'),this.$container.find('#shortcut_list'));
        this._showShortcutList(this._rateData,this.$container.find('#rate_template'),this.$container.find('#rate_list'));
        this._showShortcutList(this._serviceData,this.$container.find('#service_template'),this.$container.find('#service_list'));
        this._showShortcutList(this._tvData,this.$container.find('#tv_template'),this.$container.find('#tv_list'));
        this._showShortcutList(this._roamingData,this.$container.find('#roaming_template'),this.$container.find('#roaming_list'));
        this._showShortcutList(this._appData,this.$container.find('#app_template'),this.$container.find('#app_list'));
        this._showShortcutList(this._directData,this.$container.find('#direct_template'),this.$container.find('#direct_list'));
        this._showShortcutList(this._saleData,this.$container.find('#sale_template'),this.$container.find('#sale_list'));
        this._showShortcutList(this._asData,this.$container.find('#as_template'),this.$container.find('#as_list'));
        this._showShortcutList(this._preventData,this.$container.find('#prevent_template'),this.$container.find('#prevent_list'));
        this._showShortcutList(this._questionData,this.$container.find('#question_template'),this.$container.find('#question_list'));
        this._showShortcutList(this._mannerData,this.$container.find('#manner_template'),this.$container.find('#manner_list'));
        this._showShortcutList(this._serviceInfoData,this.$container.find('#serviceInfo_template'),this.$container.find('#serviceInfo_list'));
        this._showShortcutList(this._siteInfoData,this.$container.find('#siteInfo_template'),this.$container.find('#siteInfo_list'));
        this._showShortcutList(this._membershipData,this.$container.find('#membership_template'),this.$container.find('#membership_list'));
        this._showShortcutList(this._eventData,this.$container.find('#event_template'),this.$container.find('#event_list'));
        this._showShortcutList(this._noticeData,this.$container.find('#notice_template'),this.$container.find('#notice_list'));

    },
    _arrangeData : function (data) {
        if(!data){

            return [];
        }
        for(var i=0;i<data.length;i++){
            for (var key in data[i]) {
                if(typeof (data[i][key])==='string'){
                    data[i][key] = data[i][key].replace('<!HE>', '</span>');
                    data[i][key] = data[i][key].replace('<!HS>', '<span class="highlight-text">');
                }
                if(key==='DEPTH_PATH'){
                    data[i][key] = data[i][key].replace(/\|/g,'/');
                    data[i][key] = data[i][key].replace(/\ /g,' > ');

                }
                if(key==='METATAG'){
                    data[i][key] = data[i][key].split('#');
                }
                if(key==='IMG'){
                    var tempArr = data[i][key].split('<IMG_ALT>');
                    data[i][key] = tempArr[0];
                    if(tempArr[1]){
                        data[i].IMG_ALT = tempArr[1];
                    }
                }
            }
        }
        return data;
    },
    _showShortcutList : function (data,template,parent) {
        var shortcutTemplate = template.html();
        var templateData = Handlebars.compile(shortcutTemplate);
        if(data.length<=0){
            parent.hide();
        }
         _.each(data,function (listData) {
             parent.append(templateData({listData : listData}));
         });
    },
    _decodeEscapeChar : function (targetString) {
        var returnStr = targetString.replace(/\\/gi,'/');
        returnStr = returnStr.replace(/\n/g,'');
        return returnStr;
    },
    _inputChangeEvent : function (args) {

        if(args.keyCode===13){
            var requestUrl = '/common/search?keyword='+args.currentTarget.value;
            this._historyService.goLoad(requestUrl);
        }
    }
};
