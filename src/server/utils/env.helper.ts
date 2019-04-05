import environment from '../config/environment.config';
import FormatHelper from './format.helper';

class EnvHelper {
  static getEnvironment(key) {
    return environment[String(process.env.NODE_ENV)][key];
  }

  static replaceCdnUrl(context) {
    if (FormatHelper.isEmpty(context)) {
      return null;
    }

    return context.replace(/{{cdn}}|<%.*?CDN.*?%>/gi, EnvHelper.getEnvironment('CDN'));
  }
}

export default EnvHelper;
