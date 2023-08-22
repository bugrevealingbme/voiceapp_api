module.exports = {
  apps: [
    {
      script: './src/app.js',
      name: 'voiceapp-api',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
      instances: 'max',
      max_memory_restart: "9000M",
      exec_mode: 'cluster',
    },
  ],
};
