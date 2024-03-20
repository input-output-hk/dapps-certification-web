import React from 'react';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import RegisterSection from './RegisterSection';

import type { Tier } from "store/slices/tiers.slice";

const server = setupServer(
  http.get('/ada-usd-price', async () => {
    await delay(150);
    return HttpResponse.json(10.0);
  }),
);

const tier: Tier = {
  id: '1',
  name: 'Sample Tier',
  subtitle: 'Sample Tier',
  features: [],
  usdPrice: 100,
  enabled: true
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Landing page > Register section', () => {

  test('should render the register section', async () => {

    renderWithProviders(<RegisterSection tier={tier} onSubmit={() => {}} />);

    expect(screen.queryByText('Auditor profile')).toBeInTheDocument();

  });

  test('should render the subscription price correctly', async () => {

    renderWithProviders(<RegisterSection tier={tier} onSubmit={() => {}} />);

    const submitButton = await screen.findByText(/10.00/i);

    expect(submitButton).toBeInTheDocument();

  });

  test('should render disabled form if the fetched price is zero', async () => {

    setupServer(
      http.get('/ada-usd-price', async () => {
        await delay(150);
        return HttpResponse.json(0.0);
      }),
    );

    renderWithProviders(<RegisterSection tier={tier} onSubmit={() => {}} />);

    const submitButton = await screen.findByText(/0.00/i);

    expect(submitButton).toBeDisabled();

  });

  test('should submit the form successfully', async () => {

    const onSubmit = jest.fn();

    renderWithProviders(<RegisterSection tier={tier} onSubmit={onSubmit} />);

    const submitButton = await screen.findByText(/10.00/i);

    const companyNameInput = screen.getByRole('textbox', { name: 'Company name *' });
    const contactEmailInput = screen.getByRole('textbox', { name: 'Contact email *' });
    const companyEmailInput = screen.getByRole('textbox', { name: 'Company Email *' });
    const fullNameInput = screen.getByRole('textbox', { name: 'Full name *' });
    const twitterInput = screen.getByRole('textbox', { name: 'Twitter' });
    const linkedinInput = screen.getByRole('textbox', { name: 'LinkedIn' });
    const websiteInput = screen.getByRole('textbox', { name: 'Website' });

    fireEvent.change(companyNameInput, { target: { value: 'Test company' } });
    fireEvent.change(contactEmailInput, { target: { value: 'contact@test.com' } });
    fireEvent.change(companyEmailInput, { target: { value: 'company@test.com' } });
    fireEvent.change(fullNameInput, { target: { value: 'Full Name' } });
    fireEvent.change(twitterInput, { target: { value: 'test' } });
    fireEvent.change(linkedinInput, { target: { value: 'https://www.linkedin.com/profile/test' } });
    fireEvent.change(websiteInput, { target: { value: 'https://www.test.com' } });

    await userEvent.click(submitButton);

    expect(onSubmit.mock.calls).toHaveLength(1);
    expect(onSubmit.mock.calls[0][0].companyName).toBe('Test company');
    expect(onSubmit.mock.calls[0][0].contactEmail).toBe('contact@test.com');
    expect(onSubmit.mock.calls[0][0].email).toBe('company@test.com');
    expect(onSubmit.mock.calls[0][0].fullName).toBe('Full Name');
    expect(onSubmit.mock.calls[0][0].twitter).toBe('test');
    expect(onSubmit.mock.calls[0][0].linkedin).toBe('https://www.linkedin.com/profile/test');
    expect(onSubmit.mock.calls[0][0].website).toBe('https://www.test.com');

  });

});