import React from 'react';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import SubscriptionSection from './SubscriptionSection';

const server = setupServer(
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
      usdPrice: 10,
      enabled: true,
    },{
      id: '2',
      name: 'Tier 2',
      subtitle: 'Tier subtitle',
      features: [
        { name: 'Feature 1', },
        { name: 'Feature 2', }
      ],
      usdPrice: 20,
      enabled: true,
    }]);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches, render the subcriptions tiers and select one', async () => {

  const onSelectTier = jest.fn();

  renderWithProviders(<SubscriptionSection onSelectTier={onSelectTier} />);

  expect(await screen.findByText(/Tier 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/Tier 2/i)).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole('button')[0]);

  expect(onSelectTier.mock.calls).toHaveLength(1);
  expect(onSelectTier.mock.calls[0][0].name).toBe('Tier 1');

});