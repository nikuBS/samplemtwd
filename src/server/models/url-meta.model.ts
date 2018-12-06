export interface IUrlMeta {
  menuId: string;
  menuNm: string;
  menuUrl: string;
  gnbScutYn: string;
  gnbShrYn: string;
  seoMetaTagTitNm: string;
  seoMetaTagKwdCtt: string;
  auth: any;
  block: any;
}

export class UrlMetaModel implements IUrlMeta {
  menuId: string = '';
  menuNm: string = '';
  menuUrl: string = '';
  gnbScutYn: string = '';
  gnbShrYn: string = '';
  seoMetaTagTitNm: string = '';
  seoMetaTagKwdCtt: string = '';
  auth: any = {};
  block: any = {};
  constructor(object) {
    this.menuId = object.menuId || this.menuId;
    this.menuNm = object.menuNm || this.menuNm;
    this.menuUrl = object.menuUrl || this.menuUrl;
    this.gnbScutYn = object.gnbScutYn || this.gnbScutYn;
    this.gnbShrYn = object.gnbShrYn || this.gnbShrYn;
    this.seoMetaTagTitNm = object.seoMetaTagTitNm || this.seoMetaTagTitNm;
    this.seoMetaTagKwdCtt = object.seoMetaTagKwdCtt || this.seoMetaTagKwdCtt;
    this.auth = object.auth || this.auth;
    this.block = object.block || this.block;
  }
}
