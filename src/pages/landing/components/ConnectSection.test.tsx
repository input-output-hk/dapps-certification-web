import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import ConnectSection from './ConnectSection';

test('open modal when connect button is pressed and show 3 active wallets', async () => {

  window.cardano = {
    lace: { icon: 'lace', name: 'lace', },
    nami: { icon: 'nami', name: 'nami', },
    yoroi: { icon: 'yoroi', name: 'yoroi', },
  };

  renderWithProviders(<ConnectSection />);

  await userEvent.click(screen.getByTestId('connect-button'));

  expect(screen.getAllByTestId('wallet-button')).toHaveLength(3);
  
});

test('open modal when connect button is pressed and show no active wallets', async () => {

  window.cardano = null;

  renderWithProviders(<ConnectSection />);

  await userEvent.click(screen.getByTestId('connect-button'));

  expect(screen.getByText('No wallet extensions installed yet!')).toBeVisible();

});