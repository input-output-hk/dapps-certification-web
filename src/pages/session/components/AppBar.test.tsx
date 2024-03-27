import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import {walletConnectionInitialState } from '../../../store/slices/walletConnection.slice';
import {profileInitialState} from '../../../store/slices/profile.slice';
import AppBar from './AppBar';

jest.mock('minidenticons', () => ({
    minidenticon: jest.fn(() => 'mocked-svg')
  }));

describe('App bar > logged in state', () => {
    test('should render wallet address when logged in', async () => {

      renderWithProviders(<AppBar />, { preloadedState: 
          {walletConnection: {
          ...walletConnectionInitialState,
          walletAddress: 'addr...1234',
          },
          profile: {
            ...profileInitialState,
            profile: {
              address: 'addr1234',
              email: '',
              fullName: '',
              companyName: '',
              contactEmail: '',
              linkedin: null,
              twitter: null,
              website: null,
              role: null,
              dapp: null,
            }
          }
        } 
      });
  
      const walletAddress = await screen.findByText('addr...1234');

      expect(walletAddress).toBeInTheDocument();
    });
  });