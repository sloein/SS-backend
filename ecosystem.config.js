module.exports = {
  apps: [{
    name: 'study-system',
    script: 'dist/main.js',
    instances: 'max', // 根据 CPU 核心数启动最大实例数
    exec_mode: 'cluster', // 使用集群模式
    watch: ['dist'], // 监听 dist 目录的变化
    ignore_watch: ['node_modules', 'logs'], // 忽略这些目录的变化
    max_memory_restart: '1G', // 超过内存限制自动重启
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      name: 'study-system-dev',
      script: 'src/main.ts',
      watch: ['src'], // 监听 src 目录的变化
      ignore_watch: ['node_modules', 'logs', 'dist'], // 忽略这些目录的变化
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  }]
}; 