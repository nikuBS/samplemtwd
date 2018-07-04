class ValidationHelper {
  /**
   * @param {String} : 010-0000-0000 or 0100000000
   * @returns {Boolean}
   */
  static isCellPhone(phone: string): boolean {
    const _phone = phone.split('-').join('');
    const regPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
    return regPhone.test(_phone);
  }

}

export default ValidationHelper;
