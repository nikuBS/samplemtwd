import environment from '../config/environment.config';

class EnvHelper {
  static getEnvironment(key) {
    return environment[String(process.env.NODE_ENV)][key];
  }
}

export default EnvHelper;
