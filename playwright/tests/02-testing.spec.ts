// @ts-check
import { test, expect} from '@playwright/test';

let page; 
let runId;

test.beforeAll(async ({ browser, playwright }) => {
    const context = await browser.newContext();
    await context.addCookies([{
        name: 'loadMockWallet',
        value: 'true',
        url: 'http://localhost'
    }])
    page = await context.newPage();

    await page.goto('http://localhost:3000');

    // // already subscribed; login
    // await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
    // await page.getByTestId('connect-wallet-button').click();

    // await expect(page.getByTestId('connect-to-wallet-Nami')).toBeVisible();
    // await page.getByTestId('connect-to-wallet-Nami').click();

    // await expect(page.getByText('Testing Tool', { exact: true })).toBeVisible();
    
})

test.afterAll(async ({ browser }) => {
    // logout
    await page.getByTestId('ExpandMoreIcon').click();
    await page.getByText('Logout').click();
    await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
    
    browser.close();
})

test('can start a test campaign and see it in history', async () => {
    await page.route('**/repo/Ali-Hill/minimal-ptt-examples', async (route, request) => {
        // Override headers
        const headers = request.headers();
        delete headers['authorization'];
        route.continue({ headers: headers });
    });

    //click testing here if profile already present
    await page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]').click();

    const startTestButton = await page.getByRole('button', { name: 'Test', exact: true });
    const repoUrlInput = await page.getByTestId('repoUrl');
    const dappNameInput = await page.getByTestId('name');
    
    await expect(startTestButton).toBeVisible();    

    await expect(page.getByText('Fill the testing form')).toBeVisible();

    if (await repoUrlInput.inputValue() !== '') {
        // profile already has dapp details saved
        // no changes to repoUrl / dapp name
    } else {
        // testing form is empty
        await expect(startTestButton).toBeDisabled();
        // fill repoUrl
        await repoUrlInput.click();
        await repoUrlInput.fill('https://github.com/Ali-Hill/minimal-ptt-examples');
        // fill dapp name
        await dappNameInput.click();
        await dappNameInput.fill('testCampaign 1');
    }

    await expect(page.getByTestId('accessible')).toBeVisible();

    const commitHashInput = await page.getByTestId('commitHash');
    await commitHashInput.click();
    await commitHashInput.fill('18fe817'); // failed building

    const getRunIdPromise = page.waitForResponse(resp => {
        return resp.url().match('http://localhost:8080/run') && resp.request().method() === 'POST' && resp.status() === 201
    });

    await expect(startTestButton).not.toBeDisabled();
    await startTestButton.click();

    const getRunId = await getRunIdPromise;
    runId = await getRunId.body();

    await expect(page.getByTestId('statusTimeline')).toBeVisible();
    // timeout wait for 100 seconds max
    await expect(await page.getByTestId('statusTimeline').getByTestId('building').getByTestId('running')).toBeVisible({ timeout: 100000 });

    const getLogsPromise = page.waitForResponse(resp => resp.url().includes('/logs') && resp.status() === 200);
    const getLogs = await getLogsPromise; 
    const viewLogsButton = await page.getByText('View Logs');
    await expect(viewLogsButton).toBeVisible();
    viewLogsButton.click();
    await expect(page.getByTestId('log-information')).not.toBeHidden();
    await page.locator('xpath=//span[contains(@class,"minimize-btn")]').click()
    await expect(page.getByTestId('log-information')).toBeHidden();

    await expect(page.getByRole('button', { name: 'Abort', exact: true })).toBeVisible()

    /* test:'can see running campaign in Testing History' */
    const getAllRunPromise = page.waitForResponse(resp => resp.url().includes('/run') && resp.status() === 200);
    await page.locator('xpath=//li[contains(@class,"nav-bar-item")][3]/div[2]/span[text()="Testing History"]').click();
    const getAllRun = await getAllRunPromise;
    // is in first row of history
    await expect(page.locator('xpath=//table//tbody/tr[1]/td/span[text()="RUNNING"]')).toBeVisible();
    // is in menu badge
    await expect(page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]/div/span[contains(@class, "MuiChip-label")]')).toHaveText('Running');

    /* test:'can see error in timeline when building fails' */
    test.setTimeout(1800000); // set test default timeout to 30 minutes
    await page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]').click();
    // is in menu badge
    await expect(page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]/div/span[contains(@class, "MuiChip-label")]')).toHaveText('Running');
    
    // timeout wait for 10mins max 
    await expect(await page.getByTestId('statusTimeline').getByTestId('building').getByTestId('failed')).toBeVisible({ timeout: 600000 });

    await expect(page.getByRole('button', { name: 'Abort', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Test another commit', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Test another DApp', exact: true })).toBeVisible()

    /* test:'clears testing form except DApp info when clicked on "Test another commit" button' */
    await page.getByRole('button', { name: 'Test another commit', exact: true }).click()
    await expect(page.getByText('Fill the testing form')).toBeVisible();

    await expect(repoUrlInput).toHaveValue('https://github.com/Ali-Hill/minimal-ptt-examples')
    await expect(page.getByTestId('accessible')).toBeVisible();
    await expect(dappNameInput).toHaveValue('testCampaign 1')
    await expect(commitHashInput).toHaveValue('')

    /* test:'clears entire testing form when clicked on "Test another DApp" button' */
    await expect(page.getByText('Fill the testing form')).toBeVisible();
    await expect(page.getByTestId('accessible')).toBeVisible();

    await commitHashInput.click();
    await commitHashInput.fill('18fe817'); // failed building

    await startTestButton.click();
    // timeout wait for 30mins max
    await expect(await page.getByTestId('statusTimeline').getByTestId('building').getByTestId('failed')).toBeVisible({ timeout: 1800000 });

    await expect(page.getByRole('button', { name: 'Test another DApp', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Test another DApp', exact: true }).click()
    await expect(page.getByText('Fill the testing form')).toBeVisible();

    await expect(repoUrlInput).toBeEmpty()
    // await expect(page.getByTestId('accessible')).not.toBeVisible();
    await expect(dappNameInput).toBeEmpty()
    await expect(commitHashInput).toBeEmpty()

})


test('can see finished view for the run in Testing', async () => {
    await page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]').click();

    await page.route('**/repo/Ali-Hill/minimal-ptt-examples', async (route, request) => {
        // Override headers
        const headers = request.headers();
        delete headers['authorization'];
        route.continue({ headers: headers });
    });
    
    const commitHashInput = await page.getByTestId('commitHash');
    const repoUrlInput = await page.getByTestId('repoUrl');
    const dappNameInput = await page.getByTestId('name');
    const startTestButton = await page.getByRole('button', { name: 'Test', exact: true });
    
    await expect(startTestButton).toBeVisible();    

    await expect(page.getByText('Fill the testing form')).toBeVisible();

    if (await repoUrlInput.inputValue() !== '') {
        // profile already has dapp details saved
        // no changes to repoUrl / dapp name
    } else {
        // testing form is empty
        await expect(startTestButton).toBeDisabled();
        // fill repoUrl
        await repoUrlInput.click();
        await repoUrlInput.fill('https://github.com/Ali-Hill/minimal-ptt-examples');
        // fill dapp name
        await dappNameInput.click();
        await dappNameInput.fill('testCampaign 2');
    }
    await commitHashInput.click();
    await commitHashInput.fill('166f9b01c5'); // passing building
    // const finishedRunPromise = page.waitForResponse(resp => {
    //     return resp.url().match('http://localhost:8080/run/' + runId) && resp.status() === 200 && resp.json().status === "finished" && resp.json().result.length
    // })
    // const finishedRun = await finishedRunPromise;
     // timeout wait for 30mins max
    test.setTimeout(1800000);
    await expect(page.getByRole('button', { name: 'Full Report', exact: true })).toBeVisible({ timeout: 1800000 })

});