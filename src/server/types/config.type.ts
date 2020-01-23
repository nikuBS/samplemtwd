import CryptoHelper from '../utils/crypto.helper';

// Common
export const DEFAULT_LIST_COUNT = 20;

export const XTRACTOR_KEY = 'F82799142FA202C1';

export const SSO_KEY = {
    USER_ID: 'userId',
    SVC_MGNT_NUM: 'svcMgmtNum'
};

export const SSO_SERVICE_LIST = [
    {
        host: 'sktelecom5gx.com',
        session_key: SSO_KEY.USER_ID,
        sso_param: 'enc_sso_login_id',
        etc_params: {
            enc_svc_mgmt_num : 'svcMgmtNum'
        },
        encrpyt_algorigm: CryptoHelper.ALGORITHM.AES128CBC,
        encrpyt_key : 'MTW-TD-7551e058f', 
        encrpyt_iv: 'MTW-TD-7551e058f'
    }
];

