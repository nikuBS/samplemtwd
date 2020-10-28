class StringHelper {
  static replaceAt(str: string, index: number, replacement: string): string {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }

  static masking(str: string, mark: string, idxFromEnd: number): string {
    for (let i = 1; i <= idxFromEnd; i++) {
      str = StringHelper.replaceAt(str, str.length - i, mark);
    }
    return str;
  }

  /**
   * Replaces cellphone number string with a dashed cellphone number (01012341234 -> 010-1234-1234)
   * @param strCellphoneNum
   * @returns {String}
   */
  static phoneStringToDash(strCellphoneNum: string): string {
    if (strCellphoneNum.substring(0, 4) === '0504') {
      return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9*]{4})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
    }
    // 20-10-23 양정규. 12자리이면서 지역번호, 국번이 0으로 시작하는 경우 앞의 0을 제거함.
    if (strCellphoneNum.length === 12) {
      const contact = new Array();
      contact.push(strCellphoneNum.substr(0, 4));
      contact.push(strCellphoneNum.substr(4, 4));
      contact.push(strCellphoneNum.substr(8));

      const removeFirstZero = (num) => {
        return num.replace(/(^0)/, '');
      };
      contact[0] = removeFirstZero(contact[0]);
      contact[1] = removeFirstZero(contact[1]);
      strCellphoneNum = contact.join('');
    }
    return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
  }

  static maskPhoneNumber(phone: string) {
    const phoneArr = (phone.includes('-') ? phone : StringHelper.phoneStringToDash(phone)).split('-');
    phoneArr[1] = StringHelper.masking(phoneArr[1], '*', 2);
    phoneArr[2] = StringHelper.masking(phoneArr[2], '*', 2);

    return phoneArr.join('-');
  }

  static encodeURIAllCase(param: string) {
    return encodeURIComponent(param).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
  }
}

export default StringHelper;
