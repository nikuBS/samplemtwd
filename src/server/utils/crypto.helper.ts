import crypto from 'crypto';

class CryptoHelper {

  public static ALGORITHM = {
    AES128ECB: 'AES-128-ECB',
    AES256CBCHMACSHA256: 'aes-256-cbc-hmac-sha256'
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

  static decryptRedisPwd(context: string, key: string, algorithm: string): string {
    const decipher = crypto.createDecipher(algorithm, key);
    return decipher.update(context, 'hex', 'utf8') + decipher.final('utf8');
  }

}

export default CryptoHelper;
