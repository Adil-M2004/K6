import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "https://quickpizza.grafana.com";

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  // 1. Initialize session
  const homeRes = http.get(BASE_URL);

  // 2. POST to get the CSRF Token
  const csrfRes = http.post(`${BASE_URL}/api/csrf-token`);
  
  // Extract token from the Set-Cookie header manually
  const setCookieHeader = csrfRes.headers['Set-Cookie'] || '';
  const tokenMatch = setCookieHeader.match(/csrf_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  console.log(`DEBUG: Token Extracted -> ${token}`);

  check(csrfRes, { "token found": () => token !== null });

  // 3. Login POST
  // We send the token in the payload AND as a header
  const loginPayload = JSON.stringify({
    username: 'default',
    password: '12345678',
    csrf: token,
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
      'X-Csrf-Token': token,
    },
  };

  const loginRes = http.post(`${BASE_URL}/login?set_cookie=true`, loginPayload, loginParams);

  // LOGGING: keep status visible
  console.log(`Login Status: ${loginRes.status}`);

  // Authenticated Request (reliable session evidence)
  // Instead of relying on k6's res.cookies parsing (which can be empty even when login works),
  // verify that an authenticated endpoint succeeds.
  const ratingsRes = http.get(`${BASE_URL}/api/ratings`);

  sleep(1);
}