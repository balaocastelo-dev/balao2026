import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import ThemeRenderer from '@/app/components/ThemeRenderer';
import * as ThemeContext from '@/context/ThemeContext';

// Mock canvas since jsdom doesn't fully support it
HTMLCanvasElement.prototype.getContext = vi.fn();

// Mock dependencies
vi.mock('@/context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when theme is default', () => {
    (ThemeContext.useTheme as any).mockReturnValue({
      activeTheme: 'default',
      themeConfig: {},
    });

    const { container } = render(<ThemeRenderer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders pattern-1 correctly', () => {
    (ThemeContext.useTheme as any).mockReturnValue({
      activeTheme: 'pattern-1',
      themeConfig: {},
    });

    const { container } = render(<ThemeRenderer />);
    // Look for the div with specific style or class
    const patternDiv = container.querySelector('.bg-slate-50');
    expect(patternDiv).toBeInTheDocument();
  });

  it('renders Carnaval theme (canvas)', () => {
    (ThemeContext.useTheme as any).mockReturnValue({
      activeTheme: 'carnaval',
      themeConfig: {},
    });

    const { container } = render(<ThemeRenderer />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders Custom Media (image)', () => {
    const testUrl = 'https://example.com/image.jpg';
    (ThemeContext.useTheme as any).mockReturnValue({
      activeTheme: 'custom-media',
      themeConfig: {
        customMediaUrl: testUrl,
        customMediaType: 'image'
      },
    });

    const { container } = render(<ThemeRenderer />);
    // Check for the div with the background image style
    const div = container.querySelector('.bg-cover');
    expect(div).toBeInTheDocument();
    expect(div).toHaveStyle(`background-image: url(${testUrl})`);
  });

  it('renders Custom Media (video)', () => {
    const testUrl = 'https://example.com/video.mp4';
    (ThemeContext.useTheme as any).mockReturnValue({
      activeTheme: 'custom-media',
      themeConfig: {
        customMediaUrl: testUrl,
        customMediaType: 'video'
      },
    });

    const { container } = render(<ThemeRenderer />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', testUrl);
  });
});
