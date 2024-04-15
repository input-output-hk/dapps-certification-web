import React from 'react';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithProviders } from '../../src/utils/test-utils';
import LandingPage from '../../src/pages/landing';

const server = setupServer(
  http.get('/server-timestamp', async () => {
    await delay(150);
    return HttpResponse.json(1);
  }),
  http.post('/login', async () => {
    await delay(150);
    return HttpResponse.json('auth-token');
  }),
  http.get('/profile/current/subscriptions/active-features', async () => {
    await delay(150);
    return HttpResponse.json([]);
  }),
  http.get('/tiers', async () => {
    await delay(150);
    return HttpResponse.json([{
      id: '1',
      name: 'Tier 1',
      subtitle: 'Tier subtitle',
      features: [
        { name: 'Feature 1', },
        { name: 'Feature 2', }
      ],
      usdPrice: 100,
      enabled: true,
    }]);
  }),
  http.get('/ada-usd-price', async () => {
    await delay(150);
    return HttpResponse.json(10.0);
  }),
  http.put('/profile/current', async () => {
    await delay(150);
    return HttpResponse.json({});
  }),
  http.get('/profile/current/subscriptions', async () => {
    await delay(150);
    return HttpResponse.json([{ id: '1', status: 'pending', price: 10 }]);
  }),
  http.post('/profile/current/subscriptions/1', async () => {
    await delay(150);
    return HttpResponse.json({ id: '1' }, { status: 201 });
  }),
  http.get('/profile/current/balance', async () => {
    await delay(150);
    return HttpResponse.json(-1);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('@emurgo/cardano-serialization-lib-browser', () => ({
  Address: {
    from_bytes: () => 'address',
  },
  BaseAddress: {
    from_address: () => ({
      stake_cred: () => 'credential',
      to_address: () => ({
        to_bech32: () => 'address',
      }),
    }),
  },
  RewardAddress: {
    new: () => ({
      to_address: () => ({
        to_hex: () => 'address',
        to_bech32: () => 'address',
      }),
    }),
  },
  BigNum: {
    from_str: (a: string) => ({
      less_than: (b: any) => parseFloat(a) < b.get(),
      checked_sub: (b: any) => ({
        less_than: (c: any) => (parseFloat(a) - b.get()) < c.get(),
      }),
      get: () => parseFloat(a),
    })
  }
}));

jest.mock('store/slices/walletTransaction.slice', () => ({
  payFromWallet: () => (() => ({ payload: 'transaction-id' }))
}));

const wallet = {
  getNetworkId: async () => 0,
  getChangeAddress: async () => 'address',
  signData: () => ({ key: 'key', signature: 'signature' }),
};

const cardano = {
  nami: {
    icon: 'nami',
    name: 'nami',
    enable: async () => wallet,
  },
};

describe('Landing page', () => {

  test('should login a user successfully', async () => {

    window.cardano = cardano;

    renderWithProviders(<LandingPage />);

    await userEvent.click(screen.getByRole('button', { name: /Connect your wallet/i }));

    await userEvent.click(screen.getByRole('button', { name: /nami/i }));

    expect(await screen.findByText('Please choose a subscription')).toBeInTheDocument();

    expect(await screen.findByText(/Tier 1/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'SELECT' }));

    const submitButton = await screen.findByText(/10.00/i);

    fireEvent.change(screen.getByRole('textbox', { name: 'Company name *' }), { target: { value: 'Test company' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Contact email *' }), { target: { value: 'contact@test.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Company Email *' }), { target: { value: 'company@test.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Full name *' }), { target: { value: 'Full Name' } });

    await userEvent.click(submitButton);

    expect(await screen.findByText('Setting up your subscription...')).toBeInTheDocument();
    expect(await screen.findByText('Verify Payment Details')).toBeInTheDocument();

    server.resetHandlers(
      http.get('/profile/current/subscriptions', async () => {
        await delay(150);
        return HttpResponse.json([{ id: '1', status: 'active', endDate: '2999-01-01' }]);
      }),
    );
    
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText(/Accept/i));

    expect(await screen.findByText('Successfully initiated subscription')).toBeInTheDocument();

  });

});