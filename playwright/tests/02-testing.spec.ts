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
    
})

test.afterAll(async ({ browser }) => {
    browser.close();
})

test('can start a test campaign', async () => {
    await page.route('**/repo/Ali-Hill/minimal-ptt-examples', async (route, request) => {
        // Override headers
        const headers = request.headers();
        delete headers['authorization'];
        route.continue({ headers: headers });
    });
    // Listen for the 'requestfinished' event on the page; to ensure modified headers for the specific request
    await page.on('requestfinished', async (request) => {
        if (request.url().includes('repo/Ali-Hill/minimal-ptt-examples')) {
          const requestHeaders = await request.headers();
          await expect(requestHeaders).not.toHaveProperty('authorization');
        }
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
    await commitHashInput.fill('166f9b01c5'); // failed building

    await page.getByTestId('version').click();
    await page.getByTestId('subject').click();
    await page.getByText('Default Testing', { exact: true }).click();
    await page.getByText('Advanced', { exact: true }).click();
    await page.getByTestId('numCrashTolerance').click();
    await page.getByTestId('numDLTests').click();
    await page.getByTestId('numNoLockedFunds').click();
    await page.getByTestId('numNoLockedFundsLight').click();
    await page.getByTestId('numStandardProperty').click();
    await page.getByTestId('numWhiteList').click();

    const getRunIdPromise = page.waitForResponse(resp => {
        return resp.url().match('http://localhost:8080/run') && resp.request().method() === 'POST' && resp.status() === 201
    });

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

});

test('can see running campaign in Testing History', async () =>  {
    const getAllRunPromise = page.waitForResponse(resp => resp.url().includes('/run') && resp.status() === 200);
    await page.locator('xpath=//li[contains(@class,"nav-bar-item")][3]/div[2]/span[text()="Testing History"]').click();
    const getAllRun = await getAllRunPromise;
    // is in first row of history
    await expect(page.locator('xpath=//table//tbody/tr[1]/td/span[text()="RUNNING"]')).toBeVisible();
    // is in menu badge
    await expect(page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]/div/span[contains(@class, "MuiChip-label")]')).toHaveText('Running');
});

test('can see error in timeline when building fails', async () => {
    await page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]').click();
    // timeout wait for 30mins max
    await expect(await page.getByTestId('statusTimeline').getByTestId('building').getByTestId('failed')).toBeVisible({ timeout: 1.8e+6 });

    await expect(page.getByRole('button', { name: 'Abort', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Test another commit', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Test another DApp', exact: true })).toBeVisible()
})

test('clears testing form except DApp info when clicked on "Test another commit" button', async () => {
    const repoUrlInput = await page.getByTestId('repoUrl');
    const dappNameInput = await page.getByTestId('name');
    const commitHashInput = await page.getByTestId('commitHash');
    
    await expect(page.getByText('Fill the testing form')).toBeVisible();

    await expect(repoUrlInput.inputValue()).not.toHaveValue('')
    await expect(page.getByTestId('accessible')).toBeVisible();
    await expect(dappNameInput.inputValue()).not.toHaveValue('')
    await expect(commitHashInput.inputValue()).toHaveValue('')
})

test('clears entire testing form when clicked on "Test another DApp" button', async () => {
    const startTestButton = await page.getByRole('button', { name: 'Test', exact: true });
    const commitHashInput = await page.getByTestId('commitHash');
    await expect(page.getByText('Fill the testing form')).toBeVisible();
    await expect(page.getByTestId('accessible')).toBeVisible();

    await commitHashInput.click();
    await commitHashInput.fill('166f9b01c5'); // failed building

    await page.getByTestId('version').click();
    await page.getByTestId('subject').click();
    await page.getByText('Default Testing', { exact: true }).click();
    await page.getByText('Advanced', { exact: true }).click();
    await page.getByTestId('numCrashTolerance').click();
    await page.getByTestId('numDLTests').click();
    await page.getByTestId('numNoLockedFunds').click();
    await page.getByTestId('numNoLockedFundsLight').click();
    await page.getByTestId('numStandardProperty').click();
    await page.getByTestId('numWhiteList').click();

    await startTestButton.click();
    // timeout wait for 30mins max
    await expect(await page.getByTestId('statusTimeline').getByTestId('building').getByTestId('failed')).toBeVisible({ timeout: 1.8e+6 });

    await expect(page.getByRole('button', { name: 'Test another DApp', exact: true })).toBeVisible()
    
    const repoUrlInput = await page.getByTestId('repoUrl');
    const dappNameInput = await page.getByTestId('name');
    
    await expect(page.getByText('Fill the testing form')).toBeVisible();

    await expect(repoUrlInput.inputValue()).toHaveValue('')
    await expect(page.getByTestId('accessible')).not.toBeVisible();
    await expect(dappNameInput.inputValue()).toHaveValue('')
    await expect(commitHashInput.inputValue()).toHaveValue('')


})
// test('can see finished view for the run in Testing', async () => {
//     await page.locator('xpath=//li[contains(@class,"nav-bar-item")][2]/div[2]/span[text()="Testing"]').click();
//     // const finishedRunPromise = page.waitForResponse(resp => {
//     //     return resp.url().match('http://localhost:8080/run/' + runId) && resp.status() === 200 && resp.json().status === "finished" && resp.json().result.length
//     // })
//     // const finishedRun = await finishedRunPromise;
//      // timeout wait for 45mins max
//     await expect(page.getByRole('button', { name: 'Full Report', exact: true })).toBeVisible({ timeout: 2.7e+6 })

// });