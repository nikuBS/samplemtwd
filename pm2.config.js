module.exports = {
  apps: [
    {
      name: 'tworld',
      script: './src/server/bin/www.ts',
      exec_mode: 'cluster',
      instances: '8'
    }
  ]
};
