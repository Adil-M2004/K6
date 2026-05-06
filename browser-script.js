import http from "k6/http";
import exec from 'k6/execution';
import { browser } from "k6/browser";
import { sleep, check, fail } from 'k6';

const BASE_URL = __ENV.BASE_URL || "https://quickpizza.grafana.com";

export const options = {
  scenarios: {
    ui: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export function setup() {
  let res = http.get(BASE_URL);
  if (res.status !== 200) {
    exec.test.abort(`Got unexpected status code ${res.status} when trying to setup. Exiting.`);
  }
}

export default async function() {
  let checkData;
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL);

    //ASSERTION - Check if the header text is correct
    checkData = await page.locator("h1").textContent();
    check(page, {
      header: checkData === "Looking to break out of your pizza routine?",
    });

    await page.locator('a', { hasText: 'Login' }).click();
    await page.waitForTimeout(500);

    //await page.screenshot({ path: "screenshot.png" });

    //ASSERTION - Check if the header text is correct IN THE LOGIN PAGE
   checkData = await page.locator("h1").textContent();
    check(page, {
      LoginPage: checkData === "QuickPizza User Login",
    });

    //INPUT USERNAME
    await page.locator('#username').fill('Username');
    await page.screenshot({ path: "screenshot1.png" });

    //INPUT PASSWORD
    await page.locator('#password').fill('12345678');
    await page.screenshot({ path: "screenshot2.png" });

    //click sign in button
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshot3.png" });
    //await page.waitForTimeout(500);

     //ASSERTION - check if correct error message is shown
    const errorMessage = page.locator('.text-red-500.text-center');
    const errorText = await errorMessage.textContent();
   
    
    check(page, {
      Error: errorText.includes("Login failed: "),
    });

    //error handling 
  } catch (error) {
    fail(`Browser iteration failed: ${error.message}`);
  } finally {
    await page.close();
  }

  sleep(1);
}

