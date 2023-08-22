module.exports = {
  apps: [
    {
      script: './src/app.js',
      name: 'voiceapp-api',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
      instances: '9',
      exec_mode: 'cluster',
    },
  ],
};
