import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/src/test/renderWithProviders';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import { AppErrorBoundary } from '../AppErrorBoundary';

describe('AppErrorBoundary', () => {
  beforeEach(() => mockReplace.mockClear());

  it('renders the localized fallback and the error message', () => {
    const { getByText } = renderWithProviders(
      <AppErrorBoundary error={new Error('boom')} retry={jest.fn()} />
    );
    expect(getByText('Unexpected error')).toBeTruthy();
    expect(getByText('boom')).toBeTruthy();
  });

  it('calls retry when "Retry" is pressed', () => {
    const retry = jest.fn();
    const { getByText } = renderWithProviders(
      <AppErrorBoundary error={new Error('boom')} retry={retry} />
    );
    fireEvent.press(getByText('Retry'));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('navigates home when "Go home" is pressed', () => {
    const { getByText } = renderWithProviders(
      <AppErrorBoundary error={new Error('boom')} retry={jest.fn()} />
    );
    fireEvent.press(getByText('Go home'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
