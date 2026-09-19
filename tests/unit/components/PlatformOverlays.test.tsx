import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CookieConsentBanner from '@/components/CookieConsentBanner';
import Dropdown from '@/components/Dropdown';
import ProfileOnboardingGuide from '@/components/ProfileOnboardingGuide';

afterEach(cleanup);

describe('shared platform overlays', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps portalled dropdown options interactive', () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        ariaLabel="Example dropdown"
        options={[
          { value: 'alpha', label: 'Alpha' },
          { value: 'beta', label: 'Beta' },
        ]}
        value="alpha"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Example dropdown' }));
    const beta = screen.getByRole('option', { name: 'Beta' });

    // The document listener receives mousedown before the option click. A
    // portalled option must remain mounted long enough to select it.
    fireEvent.mouseDown(beta);
    fireEvent.click(beta);

    expect(onChange).toHaveBeenCalledWith('beta');
    expect(screen.queryByRole('option', { name: 'Beta' })).toBeNull();
  });

  it('lets people dismiss the cookie notice without blocking the page', async () => {
    render(<CookieConsentBanner />);

    const heading = await screen.findByRole('heading', { name: 'We care about your privacy' });
    const notice = heading.closest('section');

    expect(notice?.parentElement?.className).toContain('pointer-events-none');
    expect(notice?.className).toContain('pointer-events-auto');

    fireEvent.click(screen.getByRole('button', { name: /close cookie notice/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'We care about your privacy' })).toBeNull();
    });
    expect(JSON.parse(window.localStorage.getItem('cookie-consent') || '{}')).toEqual({
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
    });
  });

  it('closes the profile setup guide with Escape', async () => {
    const onClose = vi.fn();
    render(
      <ProfileOnboardingGuide
        isOpen
        onClose={onClose}
        onStartEdit={vi.fn()}
        profileData={{ name: 'Test User', skills: [], languages: [] }}
      />,
    );

    await screen.findByRole('dialog', { name: /welcome to 3yeses/i });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('contains focus in cookie preferences and restores it when closed', async () => {
    render(<CookieConsentBanner />);

    const manageButton = await screen.findByRole('button', { name: 'Manage preferences' });
    manageButton.focus();
    fireEvent.click(manageButton);

    const dialog = await screen.findByRole('dialog', { name: 'Cookie Preferences' });
    const closeButton = within(dialog).getByRole('button', { name: 'Close cookie preferences' });
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    const buttons = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    const lastButton = buttons.at(-1)!;
    lastButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(manageButton));
  });

  it('contains focus in the setup guide and restores it after close', async () => {
    const onClose = vi.fn();
    const onStartEdit = vi.fn();
    const profileData = {};
    const { rerender } = render(
      <>
        <button type="button">Open setup guide</button>
        <ProfileOnboardingGuide
          isOpen={false}
          onClose={onClose}
          onStartEdit={onStartEdit}
          profileData={profileData}
        />
      </>,
    );
    const opener = screen.getByRole('button', { name: 'Open setup guide' });
    opener.focus();

    rerender(
      <>
        <button type="button">Open setup guide</button>
        <ProfileOnboardingGuide
          isOpen
          onClose={onClose}
          onStartEdit={onStartEdit}
          profileData={profileData}
        />
      </>,
    );

    const dialog = await screen.findByRole('dialog', { name: /welcome to 3yeses/i });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    const buttons = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    const lastButton = buttons.at(-1)!;
    lastButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    rerender(
      <>
        <button type="button">Open setup guide</button>
        <ProfileOnboardingGuide
          isOpen={false}
          onClose={onClose}
          onStartEdit={onStartEdit}
          profileData={profileData}
        />
      </>,
    );
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
