module.exports = {
    apps: [{
      name: 'conversations',
      script: './server.js'
    }],
    deploy: {
      production: {
        user: 'ubuntu',
        host: 'ec2-52-221-208-37.ap-southeast-1.compute.amazonaws.com',
        key: '~/.ssh/MayanksEC2keyPair.pem',
        ref: 'origin/master',
        repo: 'https://github.com/codemayank/Conversations.git',
        path: '/home/ubuntu/conversations',
        'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
      }
    }
  }