import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const BASE_URL = 'https://quickpizza.grafana.com';
  
  // 1. Initial GET to set up any base cookies
  http.get(`${BASE_URL}/login`);

  // 2. THE FIX: Use the exact URL from your screenshot
  const loginUrl = `${BASE_URL}/api/users/token/login?set_cookie=true`;
  
  const payload = JSON.stringify({
    username: 'default',
    password: '12345678',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(loginUrl, payload, params);

  // 3. Validation
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has cookie': (r) => r.headers['Set-Cookie'] !== undefined || r.cookies['qp_user_token'] !== undefined,
  });

  // Log the response if it still fails
  if (res.status !== 200) {
    console.log(`Failed! Status: ${res.status}. Body: ${res.body}`);
  }

  sleep(1);
}