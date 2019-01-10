import crypto from 'crypto';

class CryptoHelper {

  public static ALGORITHM = {
    AES128ECB: 'AES-128-ECB'
  };

  /**
   * @param data
   * @param key
   * @param algorithm
   */
  static encrypt(data: any, key: any, algorithm: any): any {
    const bufferKey = new Buffer(key),
      iv = new Buffer(0),
      cipher = crypto.createCipheriv(algorithm, bufferKey, iv);

    return (
      cipher.update( data, 'utf8', 'hex') +
      cipher.final( 'hex' )
    );
  }

  /**
   * @param context
   * @param key
   * @param algorithm
   */
  static decrypt(context: any, key: any, algorithm: any): any {
    const bufferKey = new Buffer(key),
      iv = new Buffer(0),
      decipher = crypto.createDecipheriv( algorithm, bufferKey, iv );

    return (
      decipher.update( context, 'hex', 'utf8' ) +
      decipher.final( 'utf8' )
    );
  }

}

export default CryptoHelper;
