import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import ConnectSection from './ConnectSection';


describe('Landing page', () => {
  test('should render wallet connect button on landing page', () => {

    const buttonElement = screen.getByRole('button', { name: /Connect your wallet/i });

    expect(buttonElement).toBeVisible();
  });
});

describe('Landing page modal', () => {
  test('open modal when connect button is pressed and show 3 active wallets', async () => {

    window.cardano = {
      lace: { icon: 'lace', name: 'lace', },
      nami: { icon: 'nami', name: 'nami', },
      yoroi: { icon: 'yoroi', name: 'yoroi', },
    };
  
    renderWithProviders(<ConnectSection />);
  
    await userEvent.click(screen.getByRole('button', { name: /Connect your wallet/i }));
  
    expect(screen.getByRole('button', { name: /lace/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /nami/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /yoroi/i })).toBeVisible();
    
  });
  
  test('open modal when connect button is pressed and show no active wallets', async () => {
  
    window.cardano = null;
  
    renderWithProviders(<ConnectSection />);
  
    await userEvent.click(screen.getByRole('button', { name: /Connect your wallet/i }));
  
    expect(screen.getByText('No wallet extensions installed yet!')).toBeVisible();
  
  });
});
