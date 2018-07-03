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

}

export default StringHelper;
