class StringHelper {
  static replaceAt(str: string, index: number, replacement: string): string {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }

  static masking(str: string, mark: string, idxFromEnd: number): string {
    for ( let i = 1; i <= idxFromEnd; i++ ) {
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
    return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, '$1-$2-$3');
  }
}

export default StringHelper;
