module.exports = {
  apps: [
    {
      script: './src/app.js',
      name: 'voiceapp-api',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
      instances: '4',
      max_memory_restart: "600M",
      exec_mode: 'cluster',
    },
  ],
};
