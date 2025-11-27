#!/usr/bin/env node

const http = require('http');

const services = [
  { name: 'Auth Service', port: 8081 },
  { name: 'Chat Service', port: 8081 },
  { name: 'Permissions Service', port: 8083 }
];

async function checkHealth(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: '/actuator/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          const status = health.status === 'UP' ? '✅' : '❌';
          console.log(`${status} ${service.name} (port ${service.port}): ${health.status}`);
          resolve(health.status === 'UP');
        } catch (error) {
          console.log(`❌ ${service.name} (port ${service.port}): Invalid response`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${service.name} (port ${service.port}): ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${service.name} (port ${service.port}): Timeout`);
      resolve(false);
    });

    req.end();
  });
}

async function checkAllServices() {
  console.log('🏥 Checking service health...\n');

  const results = await Promise.all(services.map(checkHealth));
  const allHealthy = results.every(Boolean);

  console.log('\n' + (allHealthy ? '✅ All services are healthy!' : '❌ Some services are unhealthy'));

  process.exit(allHealthy ? 0 : 1);
}

checkAllServices();
