import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormatToolbar from './FormatToolbar';

describe('FormatToolbar', () => {
  it('returns null when not enabled', () => {
    const ref = { current: document.createElement('textarea') };
    const { container } = render(
      <FormatToolbar textareaRef={ref} text="hello" setText={vi.fn()} enabled={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when there is no selection', () => {
    const ref = { current: document.createElement('textarea') };
    const { container } = render(
      <FormatToolbar textareaRef={ref} text="hello" setText={vi.fn()} enabled={true} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders without crashing when textareaRef is null', () => {
    const { container } = render(
      <FormatToolbar textareaRef={null} text="hello" setText={vi.fn()} enabled={true} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('attaches event listeners to textarea when enabled', () => {
    const el = document.createElement('textarea');
    el.getBoundingClientRect = () => ({ top: 0, left: 0, right: 400, width: 400 });
    const addSpy = vi.spyOn(el, 'addEventListener');
    const ref = { current: el };
    render(<FormatToolbar textareaRef={ref} text="hello" setText={vi.fn()} enabled={true} />);
    expect(addSpy).toHaveBeenCalledWith('select', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });

  it('does not attach listeners when not enabled', () => {
    const el = document.createElement('textarea');
    const addSpy = vi.spyOn(el, 'addEventListener');
    const ref = { current: el };
    render(<FormatToolbar textareaRef={ref} text="hello" setText={vi.fn()} enabled={false} />);
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('removes event listeners on unmount', () => {
    const el = document.createElement('textarea');
    el.getBoundingClientRect = () => ({ top: 0, left: 0, right: 400, width: 400 });
    const removeSpy = vi.spyOn(el, 'removeEventListener');
    const ref = { current: el };
    const { unmount } = render(
      <FormatToolbar textareaRef={ref} text="hello" setText={vi.fn()} enabled={true} />
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('select', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });

  it('shows toolbar popup after select event with selection', async () => {
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={vi.fn()} enabled={true} />);

    // Simulate selection
    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    // The popup renders into document.body via portal
    expect(document.body.querySelector('.tu-fmt-toolbar')).toBeTruthy();
  });

  it('shows format buttons in toolbar popup', async () => {
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={vi.fn()} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    expect(toolbar).toBeTruthy();
    const buttons = toolbar.querySelectorAll('button');
    expect(buttons.length).toBe(9); // 9 format buttons
  });

  it('applies bold wrap formatting when Bold clicked', async () => {
    const setText = vi.fn();
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={setText} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    const boldBtn = toolbar.querySelector('button[title="Bold"]');
    expect(boldBtn).toBeTruthy();
    fireEvent.click(boldBtn);

    expect(setText).toHaveBeenCalledWith('**hello** world');
  });

  it('applies italic wrap formatting', async () => {
    const setText = vi.fn();
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={setText} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    const italicBtn = toolbar.querySelector('button[title="Italic"]');
    fireEvent.click(italicBtn);
    expect(setText).toHaveBeenCalledWith('_hello_ world');
  });

  it('applies quote prefix formatting', async () => {
    const setText = vi.fn();
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={setText} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    const quoteBtn = toolbar.querySelector('button[title="Quote"]');
    fireEvent.click(quoteBtn);
    expect(setText).toHaveBeenCalledWith('> hello world');
  });

  it('applies heading prefix formatting', async () => {
    const setText = vi.fn();
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={setText} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    const headingBtn = toolbar.querySelector('button[title="Heading"]');
    fireEvent.click(headingBtn);
    expect(setText).toHaveBeenCalledWith('# hello world');
  });

  it('applies numbered list prefix formatting', async () => {
    const setText = vi.fn();
    const el = document.createElement('textarea');
    const textContent = 'line1\nline2';
    el.value = textContent;
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text={textContent} setText={setText} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', {
      get: () => textContent.length,
      configurable: true,
    });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    const numBtn = toolbar.querySelector('button[title="Numbered List"]');
    fireEvent.click(numBtn);
    expect(setText).toHaveBeenCalledWith('1. line1\n2. line2');
  });

  it('applies link wrap formatting', async () => {
    const setText = vi.fn();
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={setText} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    const toolbar = document.body.querySelector('.tu-fmt-toolbar');
    const linkBtn = toolbar.querySelector('button[title="Link"]');
    fireEvent.click(linkBtn);
    expect(setText).toHaveBeenCalledWith('[hello](url) world');
  });

  it('closes toolbar when clicking outside', async () => {
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={vi.fn()} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(document.body.querySelector('.tu-fmt-toolbar')).toBeTruthy();

    // Click outside the toolbar
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });

    expect(document.body.querySelector('.tu-fmt-toolbar')).toBeFalsy();
  });

  it('hides toolbar after blur', async () => {
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.getBoundingClientRect = () => ({ top: 100, left: 0, right: 400, width: 400 });
    el.scrollTop = 0;
    el.setSelectionRange = vi.fn();
    el.focus = vi.fn();
    const ref = { current: el };

    render(<FormatToolbar textareaRef={ref} text="hello world" setText={vi.fn()} enabled={true} />);

    Object.defineProperty(el, 'selectionStart', { get: () => 0, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { get: () => 5, configurable: true });

    await act(async () => {
      fireEvent.mouseUp(el);
      await new Promise((r) => setTimeout(r, 50));
    });

    await act(async () => {
      fireEvent.blur(el);
      await new Promise((r) => setTimeout(r, 300));
    });

    expect(document.body.querySelector('.tu-fmt-toolbar')).toBeFalsy();
  });
});
