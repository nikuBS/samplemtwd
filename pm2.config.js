module.exports = {
  apps: [
    {
      name: 'tworld',
      script: './src/server/bin/www.ts',
      watch: true,
      env: {
        'PORT': 3000,
        'NODE_ENV': 'development'
      },
      env_qa: {
        'PORT': 3000,
        'NODE_ENV': 'qa',
      },
      env_production: {
        'PORT': 80,
        'NODE_ENV': 'production',
      }
    }
  ]
};