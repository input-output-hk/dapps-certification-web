import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from 'utils/test-utils';

import NavBar from './NavBar';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

describe('NavBar Component', () => {
    it('applies active class when menu item selected', async () => {
      renderWithProviders(<MemoryRouter initialEntries={['/home']}><NavBar /></MemoryRouter>);
      const homeMenuItem = screen.getByText('Home');
  
      expect(homeMenuItem.closest('li')?.classList.contains('nav-bar-item-active')).toBe(true);
    });
  
    it('does not apply active class when menu item is not active', async () => {
      renderWithProviders(<BrowserRouter><NavBar /></BrowserRouter>);
      const homeMenuItem = screen.getByText('Home');

      await userEvent.click(screen.getByText('Testing'));

      expect(homeMenuItem.closest('li')?.classList.contains('nav-bar-item-active')).toBe(false);
      expect(homeMenuItem.closest('li')?.classList.contains('nav-bar-item')).toBe(true);
    });
  
    it('displays "Running" in the "Testing" menu item when a test campaign is active', async () => {
      renderWithProviders(<MemoryRouter initialEntries={['/testing']}><NavBar /></MemoryRouter>, {
        preloadedState: {
            testing: {
                form: null,
                creating: false,
                uuid: null,
                fetching: false,
                timelineConfig: null, // TIMELINE_CONFIG
                plannedTestingTasks: [],
                coverageFile: null,
                resultData: null,
                runEnded: false,
                runStatus: null,
                unitTestSuccess: true,
                hasFailedTasks: false,
                refetchMin: 5,
                shouldFetchRunStatus: false,
                resetForm: null,
                isCustomizedTestingMode: false,
                runState: 'running' // Mocking running state
            }
        }
      });

      const testingMenuItem = screen.getByText('Testing');

      expect(testingMenuItem.closest('li')?.classList.contains('nav-bar-item-active')).toBe(true);

      const runningChip = screen.getByText('Running');
  
      expect(testingMenuItem.closest('li')).toContainElement(runningChip);
    });
  
    it('displays "Metrics" and "Support Commands" links for admin users', () => {
      renderWithProviders(<BrowserRouter><NavBar /></BrowserRouter>, {
        preloadedState: { 
            session: { 
                authToken: null,
                accessToken: null,
                networkId: null,
                walletAddress: null,
                role: 'admin'  // Mocking admin user role
            },
            profile: { // initialState
                profile: null,
                errorMessage: null,
                loading: false,
                success: false,
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
                retainId: null,
                profileBalance: 0,
                impersonate: false
            }
        }
      });
  
      expect(screen.getByText('Metrics')).toBeInTheDocument();
      expect(screen.getByText('Support Commands')).toBeInTheDocument();
    });

    it('displays "Support Commands" only for support users', () => {
        renderWithProviders(<BrowserRouter><NavBar /></BrowserRouter>, {
            preloadedState: {
                session: { 
                    authToken: null,
                    accessToken: null,
                    networkId: null,
                    walletAddress: null,
                    role: 'support'  // Mocking support user role
                },
                profile: { // initialState
                    profile: null,
                    errorMessage: null,
                    loading: false,
                    success: false,
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
                    retainId: null,
                    profileBalance: 0,
                    impersonate: false
                } 
            }
        });
    
        expect(screen.getByText('Support Commands')).toBeInTheDocument();
        expect(screen.queryByText('Metrics')).toBeNull()
      });

    it('displays "Audit Report Upload" for "l2-upload-report" featured users', () => {
        renderWithProviders(<BrowserRouter><NavBar /></BrowserRouter>, {
            preloadedState: { auth: { 
                isSessionFetched: false,
                hasAnActiveSubscription: false,
                features: ["l1-run", "l2-upload-report"] // Mocking features
            } }
        });
        expect(screen.getByText('Auditor Report Upload')).toBeInTheDocument();
    });


  });