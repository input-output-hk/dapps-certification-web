import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithProviders } from 'utils/test-utils';
import RegisterModal from './RegisterModal';


describe('Landing page > Register modal', () => {

  test('should not render register modal if show property is false', () => {

    const props = {
      show: false,
      success: false,
      transactionId: null,
      onClose: () => {}
    };

    renderWithProviders(<RegisterModal {...props} />);

    const dialogElement = screen.queryByRole('dialog');

    expect(dialogElement).not.toBeInTheDocument();

  });

  test('should render register modal if show property is true', () => {

    const props = {
      show: true,
      success: false,
      transactionId: null,
      onClose: () => {}
    };

    renderWithProviders(<RegisterModal {...props} />);

    const dialogElement = screen.getAllByRole('dialog')[0];

    expect(dialogElement).toBeVisible();

  });

  test('should render register modal with success message if show and success properties are true', () => {

    const props = {
      show: true,
      success: true,
      transactionId: null,
      onClose: () => {}
    };

    renderWithProviders(<RegisterModal {...props} />);

    const successTitleElement = screen.queryByText('Successfully initiated subscription');

    expect(successTitleElement).toBeVisible();

    const loadingTitleElement = screen.queryByText('Setting up your subscription...');

    expect(loadingTitleElement).not.toBeInTheDocument();

  });

  test('should render register modal with loading message if show property is true and success property is false', () => {

    const props = {
      show: true,
      success: false,
      transactionId: null,
      onClose: () => {}
    };

    renderWithProviders(<RegisterModal {...props} />);

    const loadingTitleElement = screen.queryByText('Setting up your subscription...');

    expect(loadingTitleElement).toBeVisible();

    const successTitleElement = screen.queryByText('Successfully initiated subscription');

    expect(successTitleElement).not.toBeInTheDocument();

  });

  test('should render register modal with transaction link if show and success properties are true and transactionId is not null', () => {

    const props = {
      show: true,
      success: true,
      transactionId: '1234',
      onClose: () => {}
    };

    renderWithProviders(<RegisterModal {...props} />);

    const transactionElement = screen.queryByText('View your performed payment transaction');

    expect(transactionElement).toBeVisible();

  });

  test('should render register modal and close after a click event on continue button', async () => {

    const props = {
      show: true,
      success: true,
      transactionId: null,
      onClose: jest.fn()
    };

    renderWithProviders(<RegisterModal {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(props.onClose.mock.calls).toHaveLength(1);

  });

});
