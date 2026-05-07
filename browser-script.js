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

export default async function () {
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


    //ASSERTION - Check if the header text is correct IN THE LOGIN PAGE
    checkData = await page.locator("h1").textContent();
    check(page, {
      LoginPage: checkData === "QuickPizza User Login",
    });

    //INPUT USERNAME
    await page.locator('#username').fill('default');
    await page.screenshot({ path: "Steps/step1.png" });
    sleep(1);

    //INPUT PASSWORD
    await page.locator('#password').fill('12345678');
    await page.screenshot({ path: "Steps/step2.png" });
    sleep(1);

    //click sign in button
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "Steps/step3.png" });
    //await page.waitForTimeout(500);

    //ASSERTION - check if correct message is shown after Sucessfull login
    const Message = await page.locator('h2').textContent();
   // const errorText = await errorMessage.textContent();

    check(page, {
      Message: Message.includes("Your Pizza Ratings:"),
    });

    // Click the "Back to main page" link to return to the main page
    await page.getByRole('link', { name: 'Back to main page' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "Steps/step4.png" });

    //ASSERTION - Check if the header text is correct AfeTER GOING BACK TO THE MAIN PAGE
    checkData = await page.locator("h1").textContent();
    check(page, {
      headerAfterBackPage: checkData === "Looking to break out of your pizza routine?",
    });

    //Click the "Pizza, Please!" button
    await page.locator('button[name="pizza-please"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "Steps/step5.png" });

    //ASSERTION - check if the pizza recipe is shown
    const recipe = page.locator('div.text-left.p-4');
    const recipeText = await recipe.textContent();
    check(page, {
      recipe: recipeText.includes("Our recommendation:"),
    });
    

    //error handling ****************************************
  } catch (error) {
    fail(`Browser iteration failed: ${error.message}`);
  } finally {
    await page.close();
  }

  sleep(1);
}

