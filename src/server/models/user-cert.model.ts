export interface IUserCert {
  group: string[];
  page: string[];
  request: string;
  child: string[];
  passwordAuth: boolean;
  product: string[];
  certAuthKey: string;
}

export class UserCertModel {
  group = [];
  page = [];
  request = '';
  child = [];
  passwordAuth = false;
  product = [];
  certAuthKey = '';

  constructor(object) {
    this.group = object.group || this.group;
    this.page = object.page || this.page;
    this.request = object.request || this.request;
    this.child = object.child || this.child;
    this.passwordAuth = object.passwordAuth || this.passwordAuth;
    this.product = object.product || this.product;
    this.certAuthKey = object.certAuthKey || this.certAuthKey;
  }

}
