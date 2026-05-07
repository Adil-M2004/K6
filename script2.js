import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const BASE_URL = 'https://quickpizza.grafana.com';

  // 1. Login
  const loginUrl = `${BASE_URL}/api/users/token/login?set_cookie=true`;
  const loginPayload = JSON.stringify({ username: 'default', password: '12345678' });
  const params = { headers: { 'Content-Type': 'application/json' } };

  let res = http.post(loginUrl, loginPayload, params);

  check(res, {
    'logged in successfully': (r) => r.status === 200,
  });

  // 2. Navigate to Main Page
  res = http.get(`${BASE_URL}/`);
  check(res, {
    'main page accessible': (r) => r.status === 200,
    
    'logo present in HTML': (r) => r.body.includes('QuickPizza'),
  });

  // 3. THE FIX: Hit the /api/pizza endpoint
  res = http.post(`${BASE_URL}/api/pizza`, "{}");

  console.log(res.body)
  // 2. Validation based on your Preview tab screenshot
  check(res, {
    'pizza API status is 200': (r) => r.status === 200,
    'contains pizza data object': (r) => {
      const body = JSON.parse(r.body);
      // The screenshot shows data is inside a "pizza" object
      return body.hasOwnProperty('pizza');
    },
    'matches white box name': (r) => {
      const body = JSON.parse(r.body);
      return body.pizza.name !== undefined && body.pizza.name.length > 0;
    },
    'has ingredients list': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.pizza.ingredients) && body.pizza.ingredients.length > 0;
    }
  });

  // Log the nested data to verify
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    console.log(`-----------------------------------`);
    console.log(`🍕 Rec: ${data.pizza.name}`);
    console.log(`🥤 Calories: ${data.calories}`); // Calories is at the top level
    console.log(`-----------------------------------`);
  }

  sleep(1);
}