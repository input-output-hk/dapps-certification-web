// @ts-check
import { test, expect} from '@playwright/test';

let page, context; 

test.beforeAll(async ({ browser, playwright }) => {
    context = await browser.newContext();
    await context.addCookies([{
        name: 'loadMockWallet',
        value: 'true',
        url: 'http://localhost'
    }])
    page = await context.newPage();

    await page.goto('http://localhost:3000');
})

test('1 - can subscribe to the tool with the dummy wallet', async () => {
    // await context.addCookies([{
    //     name: 'loadMockWallet',
    //     value: 'true',
    //     url: 'http://localhost'
    // }])

    // Listen for the 'requestfinished' event on the page; to ensure modified headers for the specific request
    page.on('requestfinished', async (request) => {
        if (request.url().includes('/profile/current') && request.method() === 'POST') {
          const requestHeaders = await request.headers();
          expect(requestHeaders).toHaveProperty('authorization');
        }
    });

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

    await expect(page.getByText('Verify Payment Details')).toBeVisible();
    await page.getByText('I confirm').click();
    
    await page.getByRole('button', { name: 'Accept', exact: true }).click();

    await expect(page.getByText('Setting up your subscription')).toBeVisible();
    
    await expect(page.getByText('Successfully initiated subscription')).toBeVisible({timeout: 60000});
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByText('Testing Tool', { exact: true })).toBeVisible();
})

test('2 - can see dashboard of the tool once already connected to the wallet', async () => {
    await expect(page.getByText('Testing Tool', { exact: true })).toBeVisible();
    await expect(page.locator('xpath=//li[contains(@class, "nav-bar-item-active")]/div[2]/span')).toContainText('Home');
})

test('3 - can logout of the tool', async () => {
    await page.getByTestId('ExpandMoreIcon').click();
    await page.getByText('Logout').click();
    await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
})


test('4 - unauthorized user when timestamp is past 60 seconds', async () => {
    await context.addCookies([{
        name: 'loadUnauthorizedWallet',
        value: 'true',
        url: 'http://localhost'
    }])

    // use mocked up key and signature for the test-wallet from  a past time to replicate the scenario
    const loginPayload = {
        "address":"stake_test1uqthzqlp347meym39dafmw4r6wk0qlczhh8jx34rgaeuuqsgxguvh",
        "key":"a4010103272006215820f32de0a73a6cb7cdaf926df0a1580561cbd1fad8b0b1e71c0b99820ae5f241c3",
        "signature":"84582aa201276761646472657373581de0177103e18d7dbc93712b7a9dbaa3d3acf07f02bdcf2346a34773ce02a166686173686564f458d45369676e2074686973206d65737361676520696620796f752061726520746865206f776e6572206f662074686520616464725f7465737431717064796a767a6636656c396435656c776577337261707263743779673573756b683073666568376d66746e666771687779703772727461686a66687a326d366e6b61323835617637706c73393077307964723278336d6e65637071686b386b796b20616464726573732e200a2054696d657374616d703a203c3c313731303234343834323e3e200a204578706972793a203630207365636f6e647358405fd2874c67f56791c73e63920ee09e706abfedc837f8a01ae997bbf1f34454d20cf4f4b858f28d91f540b648dd42a270d02d8fecfcf06e1fcb300bea50e02002"
    }

    await page.route('**/login', async (route)=> {
        if (route.request().method() === 'POST') {
            await route.continue({
                postData: JSON.stringify(loginPayload)
            });
        }
    });

    await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
    await page.getByTestId('connect-wallet-button').click();

    await expect(page.getByTestId('connect-to-wallet-Nami')).toBeVisible();
    await page.getByTestId('connect-to-wallet-Nami').click();

    expect(page.locator('//div[contains(@class,"subscription")][1]//button[text()="SELECT"]')).not.toBeVisible()

    expect(page.getByText('Could not obtain the proper key and signature for the wallet. Please try connecting again.')).toBeVisible();
    expect(page.getByRole('button', {name: 'Retry', exact: true })).toBeVisible();

    // clear loadUnauthorizedWallet test cookie
    await context.clearCookies();
})