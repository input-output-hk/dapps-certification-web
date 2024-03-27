import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import AppBar from './AppBar';

jest.mock('minidenticons', () => ({
    minidenticon: jest.fn(() => 'mocked-svg')
  }));

describe('App bar > logged in state', () => {
    test('should render wallet address when logged in', async () => {
        const preloadedState = {
            walletConnection: {
                wallet: null,
                walletName: null,
                walletAddress: 'addr...1234',
                stakeAddress: null,
                activeWallets: ['lace', 'nami', 'yoroi'],
                errorMessage: null,
                errorRetry: false,
                loading: false,
                listeningWalletChanges: false,
                resetWalletChanges: false,
            },
            profile: {
              profile: {
                address: 'addr1234',
                email: 'email@gmail.com',
                fullName: 'name',
                companyName: 'company',
                contactEmail: 'contactemail@gmail.com',
                linkedin: null,
                twitter: null,
                website: null,
                role: null,
                dapp: null,
              },
              errorMessage: null,
              loading: false,
              success: true,
              selectedUser: null,
              allUsers: null,
              loadingDetails: false,
              detailsSuccess: false,
              detailsError: null,
              userSubscription: null,
              loadingSubDetails: false,
              subDetailsSuccess: false,
              subDetailsError: null,
              updateSuccess: false,
              loadingHistory: false,
              runHistory: [],
              impersonate: false,
              retainId: null  
            }
          };

      renderWithProviders(<AppBar />, { preloadedState });
  
      const walletAddress = await screen.findByText('addr...1234');

      expect(walletAddress).toBeInTheDocument();
    });
  });