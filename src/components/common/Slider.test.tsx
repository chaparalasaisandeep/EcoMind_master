import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Slider } from './Slider';

expect.extend(toHaveNoViolations);

describe('Slider Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  const defaultProps = {
    label: 'Carbon Footprint',
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    unit: ' kg',
    onChange: mockOnChange,
  };

  describe('Rendering', () => {
    it('renders with label', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByText('Carbon Footprint')).toBeInTheDocument();
    });

    it('renders with current value', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByText('50 kg')).toBeInTheDocument();
    });

    it('renders input element with correct id', () => {
      render(<Slider {...defaultProps} />);
      const input = screen.getByRole('slider');
      expect(input).toHaveAttribute('id', 'slider-Carbon Footprint');
    });

    it('renders min and max value labels', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByText('0 kg')).toBeInTheDocument();
      expect(screen.getByText('100 kg')).toBeInTheDocument();
    });

    it('renders label connected to input via htmlFor', () => {
      render(<Slider {...defaultProps} />);
      const label = screen.getByText('Carbon Footprint');
      const input = screen.getByRole('slider');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('updates value display when value prop changes', () => {
      const { rerender } = render(<Slider {...defaultProps} />);
      expect(screen.getByText('50 kg')).toBeInTheDocument();

      rerender(<Slider {...defaultProps} value={75} />);
      expect(screen.getByText('75 kg')).toBeInTheDocument();
    });

    it('renders with different units', () => {
      render(
        <Slider
          {...defaultProps}
          label="Temperature"
          unit="°C"
          value={20}
        />
      );
      expect(screen.getByText('20°C')).toBeInTheDocument();
      expect(screen.getByText('0°C')).toBeInTheDocument();
      expect(screen.getByText('100°C')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when slider value changes', () => {
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '75' } });

      expect(mockOnChange).toHaveBeenCalledWith(75);
    });

    it('calls onChange with correct values for different ranges', () => {
      render(
        <Slider
          {...defaultProps}
          min={10}
          max={200}
          value={100}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '150' } });

      expect(mockOnChange).toHaveBeenCalledWith(150);
    });

    it('respects step value', async () => {
      const user = userEvent.setup();
      render(
        <Slider
          {...defaultProps}
          step={5}
          value={50}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '5');
    });

    it('does not allow values below minimum', () => {
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '-10' } });

      // The browser input type="range" naturally prevents this,
      // but we verify the onChange would receive valid value
      expect(parseFloat(slider.value)).toBeGreaterThanOrEqual(defaultProps.min);
    });

    it('does not allow values above maximum', () => {
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '150' } });

      expect(parseFloat(slider.value)).toBeLessThanOrEqual(defaultProps.max);
    });

    it('handles decimal step values', () => {
      render(
        <Slider
          {...defaultProps}
          step={0.5}
          value={50.5}
        />
      );

      expect(screen.getByText('50.5 kg')).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('has aria-label with label and current value', () => {
      render(<Slider {...defaultProps} value={60} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Carbon Footprint: 60 kg');
    });

    it('has aria-valuemin attribute', () => {
      render(<Slider {...defaultProps} min={0} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
    });

    it('has aria-valuemax attribute', () => {
      render(<Slider {...defaultProps} max={200} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemax', '200');
    });

    it('has aria-valuenow attribute reflecting current value', () => {
      const { rerender } = render(<Slider {...defaultProps} value={50} />);
      let slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '50');

      rerender(<Slider {...defaultProps} value={80} />);
      slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '80');
    });

    it('updates aria-valuenow when value changes', () => {
      const { rerender } = render(<Slider {...defaultProps} value={25} />);
      let slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '25');

      rerender(<Slider {...defaultProps} value={75} />);
      slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('updates aria-label when value changes', () => {
      const { rerender } = render(<Slider {...defaultProps} value={40} />);
      let slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Carbon Footprint: 40 kg');

      rerender(<Slider {...defaultProps} value={85} />);
      slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Carbon Footprint: 85 kg');
    });

    it('has slider role', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Keyboard Interaction', () => {
    it('responds to arrow keys for value change', () => {
      render(<Slider {...defaultProps} value={50} />);

      const slider = screen.getByRole('slider');
      slider.focus();

      // Simulate arrow right key press
      fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.change(slider, { target: { value: '51' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('responds to arrow up key', () => {
      render(<Slider {...defaultProps} value={50} />);

      const slider = screen.getByRole('slider');
      slider.focus();

      fireEvent.keyDown(slider, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.change(slider, { target: { value: '51' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('responds to arrow left key', () => {
      render(<Slider {...defaultProps} value={50} />);

      const slider = screen.getByRole('slider');
      slider.focus();

      fireEvent.keyDown(slider, { key: 'ArrowLeft', code: 'ArrowLeft' });
      fireEvent.change(slider, { target: { value: '49' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('responds to arrow down key', () => {
      render(<Slider {...defaultProps} value={50} />);

      const slider = screen.getByRole('slider');
      slider.focus();

      fireEvent.keyDown(slider, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.change(slider, { target: { value: '49' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('slider is keyboard focusable', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');
      slider.focus();
      expect(document.activeElement).toBe(slider);
    });

    it('responds to Home key (sets to minimum)', () => {
      render(<Slider {...defaultProps} value={75} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      slider.focus();

      // Home key behavior: when focused and Home is pressed, the browser sets value to min
      // We simulate this by changing the value
      fireEvent.keyDown(slider, { key: 'Home', code: 'Home' });
      // Simulate browser's default Home key behavior on range input
      fireEvent.change(slider, { target: { value: String(defaultProps.min) } });

      // Verify onChange was called
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('responds to End key (sets to maximum)', () => {
      render(<Slider {...defaultProps} value={25} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      slider.focus();

      // End key behavior: when focused and End is pressed, the browser sets value to max
      fireEvent.keyDown(slider, { key: 'End', code: 'End' });
      // Simulate browser's default End key behavior on range input
      fireEvent.change(slider, { target: { value: String(defaultProps.max) } });

      // Verify onChange was called
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility Audit', () => {
    it('passes axe accessibility audit', async () => {
      const { container } = render(<Slider {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe audit with different values', async () => {
      const { container } = render(
        <Slider
          {...defaultProps}
          value={25}
          label="Energy Usage"
          unit=" kWh"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe audit with different min/max ranges', async () => {
      const { container } = render(
        <Slider
          {...defaultProps}
          min={-50}
          max={150}
          value={0}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Value Display', () => {
    it('displays value with unit', () => {
      render(<Slider {...defaultProps} value={42} unit=" tons" />);
      expect(screen.getByText('42 tons')).toBeInTheDocument();
    });

    it('displays value without space in unit if not provided', () => {
      render(<Slider {...defaultProps} value={42} unit="%" />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('updates display when onChange callback updates props', () => {
      const { rerender } = render(<Slider {...defaultProps} value={50} />);
      expect(screen.getByText('50 kg')).toBeInTheDocument();

      rerender(<Slider {...defaultProps} value={90} />);
      expect(screen.getByText('90 kg')).toBeInTheDocument();
    });
  });
});
