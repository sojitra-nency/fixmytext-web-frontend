import React from 'react';
import { render } from '@testing-library/react';
import {
  I,
  NumIcon,
  DropletIcon,
  SunIcon,
  RunnerIcon,
  CalendarIcon,
  TrophyIcon,
  WrenchIcon,
  TwoIcon,
  StarIcon,
  FlagIcon,
  ClipboardIcon,
  RulerIcon,
  LeafIcon,
  CrownIcon,
  JarIcon,
  BucketIcon,
  BarrelIcon,
  GiftIcon,
} from './PricingIcons';

describe('PricingIcons', () => {
  describe('I (base icon wrapper)', () => {
    it('renders a path when d prop is provided', () => {
      const { container } = render(<I d="M0 0L10 10" />);
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', 'M0 0L10 10');
    });

    it('renders children when no d prop', () => {
      const { container } = render(
        <I>
          <circle cx="12" cy="12" r="5" />
        </I>
      );
      expect(container.querySelector('circle')).toBeInTheDocument();
    });

    it('respects size, stroke, fill, and vb props', () => {
      const { container } = render(
        <I d="M0 0" size={32} stroke="red" fill="blue" vb="0 0 32 32" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
      expect(svg).toHaveAttribute('stroke', 'red');
      expect(svg).toHaveAttribute('fill', 'blue');
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });
  });

  describe('NumIcon', () => {
    it('renders the number', () => {
      const { container } = render(<NumIcon n={5} />);
      expect(container.querySelector('text').textContent).toBe('5');
    });

    it('uses smaller font for multi-digit numbers', () => {
      const { container } = render(<NumIcon n={12} />);
      expect(container.querySelector('text')).toHaveAttribute('font-size', '11');
    });

    it('uses larger font for single-digit numbers', () => {
      const { container } = render(<NumIcon n={3} />);
      expect(container.querySelector('text')).toHaveAttribute('font-size', '14');
    });
  });

  it.each([
    ['DropletIcon', DropletIcon],
    ['SunIcon', SunIcon],
    ['RunnerIcon', RunnerIcon],
    ['CalendarIcon', CalendarIcon],
    ['TrophyIcon', TrophyIcon],
    ['WrenchIcon', WrenchIcon],
    ['TwoIcon', TwoIcon],
    ['StarIcon', StarIcon],
    ['FlagIcon', FlagIcon],
    ['ClipboardIcon', ClipboardIcon],
    ['RulerIcon', RulerIcon],
    ['LeafIcon', LeafIcon],
    ['CrownIcon', CrownIcon],
    ['JarIcon', JarIcon],
    ['BucketIcon', BucketIcon],
    ['BarrelIcon', BarrelIcon],
    ['GiftIcon', GiftIcon],
  ])('%s renders an SVG', (name, Icon) => {
    const { container } = render(<Icon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('passes props through to icons', () => {
    const { container } = render(<DropletIcon size={48} stroke="green" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('stroke', 'green');
  });
});
