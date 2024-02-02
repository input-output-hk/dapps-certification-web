// @ts-check
import { test, expect } from './fixtures';

const wallet_account_name = 'CertTestWallet';
const wallet_account_password = 'CertTestWallet@123';
const wallet_seed_phrase = ['noble', 'reflect', 'amount', 'shock', 'visual', 'visual', 'daring', 'cloth', 'duck', 'else', 'result', 'cigar',
    'abstract', 'hobby', 'clown', 'lend', 'boy', 'priority', 'rhythm', 'short', 'pole', 'vote', 'already', 'frequent'];

// setup wallet account
test.beforeAll(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/mainPopup.html`);

    await page.getByText('Legal & analytics').waitFor({state: 'visible'})
        .then(async () => {
            await page.locator('xpath=//button[contains(@class,"chakra-modal__close-btn")]').click();
            await expect(page.getByText('Legal & analytics')).not.toBeVisible();
        })
        .catch()
        .finally(() => {

        })
    await page.getByRole('button', { name: /Import/i }).click();
    await page.locator('xpath=//select[contains(@class,"chakra-select")]').selectOption('24');
    await page.locator('xpath=//span[contains(@class,"chakra-checkbox__control")]').click();


    const pagePromise = page.context().waitForEvent('page');
    await page.getByRole('button', { name: /Continue/i }).click();
    const importPage = await pagePromise;
    await importPage.waitForLoadState();

    await expect(importPage.getByPlaceholder('Word 1', {exact: true})).toBeInViewport()
    for(let i=0; i<24; i++) {
        await importPage.getByPlaceholder(`Word ${i+1}`, {exact: true}).fill(wallet_seed_phrase[i])
    }

    await importPage.getByRole('button', { name: /Next/i }).click();
    const createAccountPage = await pagePromise;
    await createAccountPage.waitForLoadState();

    await expect(createAccountPage.getByText('Create account')).toBeInViewport()
    await createAccountPage.getByPlaceholder('Enter account name', {exact: true}).fill(wallet_account_name)
    await createAccountPage.getByPlaceholder('Enter password', {exact: true}).fill(wallet_account_password)
    await createAccountPage.getByPlaceholder('Confirm password', {exact: true}).fill(wallet_account_password)

    await createAccountPage.getByRole('button', { name: /Create/i }).click();
    await expect(createAccountPage.getByText('Successful')).toBeInViewport();
    await createAccountPage.getByRole('button', { name: /Close/i }).click();

    await page.goto(`chrome-extension://${extensionId}/mainPopup.html`);
    await expect(page.locator(`//div[@id="mainPopup"]/div/div/div/div/div/div/div/p[text()="${wallet_account_name}"]`)).toBeInViewport();

    await page.locator('//button[contains(@class, "chakra-menu__menu-button")]').click()
    await page.getByText('Settings').click();
    await page.getByText('Network').click();
    await page.locator('xpath=//select[contains(@class,"chakra-select")]').selectOption('preprod');

})

test('can connect to Nami wallet', async ({ page, request, extensionId }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: 'Testing Tool' })).toBeVisible();

    await expect(page.getByTestId('connect-wallet-button')).toBeVisible()
    await page.getByTestId('connect-wallet-button').click()
    await expect(page.getByTestId('connect-to-wallet-Nami')).toBeVisible()
    await page.getByTestId('connect-to-wallet-Nami').click()

    // const pagePromise = page.context().waitForEvent('page');

    const timestamp = await request.get('http://localhost:8080/server-timestamp');
    expect(timestamp.ok()).toBeTruthy();

    // await page.goto(`chrome-extension://${extensionId}/internalPopup.html`);
    
    // const signPopupPage = await pagePromise;
    // await expect(signPopupPage.getByText(/timestamp/i)).toBeVisible()
})