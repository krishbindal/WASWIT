import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Page from './page';
import React from 'react';

describe('Home Page Smoke Test', () => {
  it('renders the main heading', () => {
    render(<Page />);
    const heading = screen.getByRole('heading', { name: /WASWIT/i });
    expect(heading).toBeDefined();
  });
});
