import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement } from 'react';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  return render(ui, { ...options });
}

export { render, screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
