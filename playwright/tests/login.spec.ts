// @ts-check
import { test, expect} from '@playwright/test';

let page; 

test.beforeAll(async ({ browser, playwright }) => {
    const context = await browser.newContext();
    await context.addCookies([{
        name: 'loadMockWallet',
        value: 'true',
        url: 'http://localhost'
    }])
    page = await context.newPage();

    await page.goto('http://localhost:3000');
})

test('can subscribe to the tool with the dummy wallet', async () => {
    await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
    await page.getByTestId('connect-wallet-button').click();

    await expect(page.getByTestId('connect-to-wallet-Nami')).toBeVisible();
    await page.getByTestId('connect-to-wallet-Nami').click();

    await page.locator('//div[contains(@class,"subscription")][1]//button[text()="SELECT"]').click();


    const companyName = await page.getByTestId('companyName');
    const contactEmail = await page.getByTestId('contactEmail');
    const companyEmail = await page.getByTestId('companyEmail');
    const fullName = await page.getByTestId('fullName');

    // click pay, throws error in required fields
    await page.getByRole('button', { name: 'Pay' }).click();
    expect(await companyName.locator('xpath=/parent::div/parent::div/p[contains(@class,"Mui-error")]')).toBeVisible()

    await companyName.click();
    await companyName.fill('Test');
    await contactEmail.click();
    await contactEmail.fill('test@test.com');
    await companyEmail.click();
    await companyEmail.fill('test@test.com');
    await fullName.click();
    await fullName.fill('Test');
    
    await page.getByRole('button', { name: 'Pay' }).click();

    // Listen for the 'requestfinished' event on the page; to ensure modified headers for the specific request
    page.on('requestfinished', async (request) => {
        if (request.url().includes('/profile/current')) {
          const requestHeaders = await request.headers();
          expect(requestHeaders).toHaveProperty('authorization');
        }
    });
    await expect(page.getByText('Setting up your subscription')).toBeVisible();

    const subscriptionComplete = await page.getByText('Successfully initiated subscription')
    await subscriptionComplete.waitFor()
    await expect(subscriptionComplete).toBeVisible();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    // await expect(page.getByText('Testing Tool', { exact: true })).toBeVisible();
})

test('can connect to dummy wallet and see dashboard of the tool', async () => {
    await expect(page.getByText('Testing Tool', { exact: true })).toBeVisible();
    await expect(page.locator('xpath=//li[contains(@class, "nav-bar-item-active")]/div[2]/span')).toContainText('Home');
})

test('can logout of the tool', async () => {
    await page.getByTestId('ExpandMoreIcon').click();
    await page.getByText('Logout').click();
    await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
})