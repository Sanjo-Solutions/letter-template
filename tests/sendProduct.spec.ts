import { test, expect } from "@playwright/test"

test("sendProduct", async ({ page }) => {
  await page.goto("https://buy.stripe.com/test_4gwg12cg6gKh4AE288")

  await page.getByLabel("Email").fill("jonas.aschenbrenner@gmail.com")
  await page.getByTestId("card-tab-button").click()
  await page.getByPlaceholder("1234 1234 1234 1234").fill("4242 4242 4242 4242")
  await page.getByPlaceholder("MM / YY").fill("01 / 24")
  await page.getByPlaceholder("CVC").fill("123")
  await page.getByPlaceholder("Full name on card").fill("Jonas Aschenbrenner")
  await page.getByTestId("hosted-payment-submit-button").click()

  await page.waitForSelector('text="Herunterladen"', {
    timeout: 60000,
  })
})
