/**
 * 암호화 Helper
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-01-09
 */

import crypto from 'crypto';

/**
 * @class
 */
class CryptoHelper {

  /* 암호화 알고리즘 */
  public static ALGORITHM = {
    AES128ECB: 'AES-128-ECB',
    AES128CBC: 'AES-128-CBC',
    AES256CBCHMACSHA256: 'aes-256-cbc-hmac-sha256'
  };

  /**
   * 암호화
   * @param data - 암호화할 Context
   * @param key - 키
   * @param algorithm - 사용할 알고리즘
   * @param digit - 자릿수
   */
  static encrypt(data: any, key: any, algorithm: any, iv?: any): any {
    const bufferKey = new Buffer(key);

    if ( iv === '' || iv == null || iv === undefined ||
      (iv != null && typeof iv === 'object' && !Object.keys(iv).length) ) {
        iv = new Buffer(0);
    }
    
    const cipher = crypto.createCipheriv(algorithm, bufferKey, iv);

    return (
      cipher.update( data, 'utf8', 'hex') +
      cipher.final( 'hex' )
    );
  }

  /**
   * 복호화
   * @param context - 복호화할 Context
   * @param key - 키
   * @param algorithm - 사용할 알고리즘
   */
  static decrypt(context: any, key: any, algorithm: any, iv?: any): any {
    const bufferKey = new Buffer(key);
    if ( iv === '' || iv == null || iv === undefined ||
      (iv != null && typeof iv === 'object' && !Object.keys(iv).length) ) {
        iv = new Buffer(0);
    }
    const decipher = crypto.createDecipheriv( algorithm, bufferKey, iv );

    return (
      decipher.update( context, 'hex', 'utf8' ) +
      decipher.final( 'utf8' )
    );
  }

  /**
   * Redis 암호 복호화
   * @param context - 복호화할 Context
   * @param key - 키
   * @param algorithm - 사용할 알고리즘
   */
  static decryptRedisPwd(context: string, key: string, algorithm: string): string {
    const decipher = crypto.createDecipher(algorithm, key);
    return decipher.update(context, 'hex', 'utf8') + decipher.final('utf8');
  }

}

export default CryptoHelper;
