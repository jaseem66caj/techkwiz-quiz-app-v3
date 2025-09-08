module.exports = {
  apps: [
    {
      name: 'techkwiz-dev',
      script: 'npm',
      args: 'run dev -- --port 3000',
      cwd: '/Users/jaseem/Documents/GitHub/Techkwiz-v8',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=4096',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'techkwiz-prod',
      script: 'npm',
      args: 'run start',
      cwd: '/Users/jaseem/Documents/GitHub/Techkwiz-v8',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-prod-error.log',
      out_file: './logs/pm2-prod-out.log',
      log_file: './logs/pm2-prod-combined.log',
      time: true,
      restart_delay: 3000,
      max_restarts: 5,
      min_uptime: '30s'
    }
  ]
};
