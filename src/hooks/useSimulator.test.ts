import { renderHook, act } from '@testing-library/react';
import { useSimulator } from './useSimulator';

describe('useSimulator', () => {
  describe('Initial State', () => {
    it('should initialize all sliders at 0', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.sliders).toHaveLength(5);
      result.current.sliders.forEach((slider) => {
        expect(slider.value).toBe(0);
      });
    });

    it('should have baseline total emissions of 360kg', () => {
      const { result } = renderHook(() => useSimulator());

      const baselineTotal = 120 + 80 + 60 + 100; // transport + food + shopping + energy
      expect(baselineTotal).toBe(360);
      expect(result.current.result.carbonEmissions).toBe(360);
    });

    it('should have zero carbon reduction at start', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.result.carbonReduction).toBe(0);
    });

    it('should have zero money savings at start', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.result.moneySavings).toBe(0);
    });

    it('should have sustainability score of 50 at start', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.result.sustainabilityScore).toBe(50);
    });

    it('should have all default slider properties', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.sliders[0]).toEqual({
        id: 'driveLess',
        label: 'Drive Less',
        value: 0,
        min: 0,
        max: 100,
        step: 5,
        unit: '% reduction',
        category: 'transport',
      });
    });
  });

  describe('updateSlider - Drive Less (transport)', () => {
    it('should update driveLess slider to 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      const driveLessSlider = result.current.sliders.find((s) => s.id === 'driveLess');
      expect(driveLessSlider?.value).toBe(50);
    });

    it('should reduce transport emissions by 60kg when driveLess is 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      // transport baseline is 120, 50% reduction = 60kg
      const expectedReduction = 120 * 0.5; // 60kg
      const expectedEmissions = 360 - expectedReduction; // 300kg
      expect(result.current.result.carbonEmissions).toBe(300);
    });

    it('should calculate correct money savings for driveLess at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      // transport baseline is 120, 50% reduction = 60kg
      // cost savings: 60kg * 0.15 = 9.00
      expect(result.current.result.moneySavings).toBe(9.0);
    });

    it('should update carbon reduction percentage for driveLess at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      // (60kg / 360kg) * 100 = 16.666...% ≈ 16.7%
      expect(result.current.result.carbonReduction).toBe(16.7);
    });
  });

  describe('updateSlider - All Sliders at Various Percentages', () => {
    it('should handle driveLess at 0%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 0);
      });

      expect(result.current.sliders.find((s) => s.id === 'driveLess')?.value).toBe(0);
      expect(result.current.result.carbonEmissions).toBe(360);
    });

    it('should handle driveLess at 25%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 25);
      });

      // reduction: 120 * 0.25 = 30kg
      // emissions: 360 - 30 = 330
      expect(result.current.result.carbonEmissions).toBe(330);
      expect(result.current.result.carbonReduction).toBe(8.3);
    });

    it('should handle driveLess at 75%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 75);
      });

      // reduction: 120 * 0.75 = 90kg
      // emissions: 360 - 90 = 270
      expect(result.current.result.carbonEmissions).toBe(270);
      expect(result.current.result.carbonReduction).toBe(25);
    });

    it('should handle driveLess at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
      });

      // reduction: 120 * 1.0 = 120kg
      // emissions: 360 - 120 = 240
      expect(result.current.result.carbonEmissions).toBe(240);
      expect(result.current.result.carbonReduction).toBe(33.3);
    });

    it('should handle veganMeals at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('veganMeals', 50);
      });

      // food baseline is 80, 50% reduction = 40kg
      // emissions: 360 - 40 = 320
      expect(result.current.result.carbonEmissions).toBe(320);
      expect(result.current.result.moneySavings).toBe(3.2); // 40 * 0.08
    });

    it('should handle reduceShopping at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('reduceShopping', 50);
      });

      // shopping baseline is 60, 50% reduction = 30kg
      // emissions: 360 - 30 = 330
      // savings: 30 * 0.25 = 7.50
      expect(result.current.result.carbonEmissions).toBe(330);
      expect(result.current.result.moneySavings).toBe(7.5);
    });

    it('should handle renewableEnergy at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('renewableEnergy', 50);
      });

      // energy baseline is 100, 50% reduction = 50kg
      // emissions: 360 - 50 = 310
      // savings: 50 * 0.12 = 6.00
      expect(result.current.result.carbonEmissions).toBe(310);
      expect(result.current.result.moneySavings).toBe(6.0);
    });

    it('should handle publicTransit at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('publicTransit', 50);
      });

      // transport baseline is 120, 50% reduction = 60kg
      // emissions: 360 - 60 = 300
      // savings: 60 * 0.15 = 9.00
      expect(result.current.result.carbonEmissions).toBe(300);
      expect(result.current.result.moneySavings).toBe(9.0);
    });

    it('should handle publicTransit at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('publicTransit', 100);
      });

      // transport baseline is 120, 100% reduction = 120kg
      // emissions: 360 - 120 = 240
      // savings: 120 * 0.15 = 18.00
      expect(result.current.result.carbonEmissions).toBe(240);
      expect(result.current.result.moneySavings).toBe(18.0);
    });
  });

  describe('Multiple Sliders Simultaneously', () => {
    it('should combine reductions from multiple sliders', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50); // 60kg reduction
        result.current.updateSlider('veganMeals', 50); // 40kg reduction
      });

      // total reduction: 60 + 40 = 100kg
      // emissions: 360 - 100 = 260
      expect(result.current.result.carbonEmissions).toBe(260);
      expect(result.current.result.carbonReduction).toBe(27.8);
    });

    it('should correctly sum money savings from multiple sliders', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50); // 60kg * 0.15 = 9.00
        result.current.updateSlider('veganMeals', 50); // 40kg * 0.08 = 3.20
      });

      // total savings: 9.00 + 3.20 = 12.20
      expect(result.current.result.moneySavings).toBe(12.2);
    });

    it('should handle three sliders at once', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50); // 60kg reduction
        result.current.updateSlider('veganMeals', 50); // 40kg reduction
        result.current.updateSlider('reduceShopping', 50); // 30kg reduction
      });

      // total reduction: 60 + 40 + 30 = 130kg
      // emissions: 360 - 130 = 230
      expect(result.current.result.carbonEmissions).toBe(230);
      // savings: (60 * 0.15) + (40 * 0.08) + (30 * 0.25) = 9 + 3.2 + 7.5 = 19.7
      expect(result.current.result.moneySavings).toBe(19.7);
    });

    it('should handle all five sliders at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50); // transport: 60kg
        result.current.updateSlider('veganMeals', 50); // food: 40kg
        result.current.updateSlider('reduceShopping', 50); // shopping: 30kg
        result.current.updateSlider('renewableEnergy', 50); // energy: 50kg
        result.current.updateSlider('publicTransit', 50); // transport: 60kg
      });

      // total reduction: 60 + 40 + 30 + 50 + 60 = 240kg
      // emissions: 360 - 240 = 120
      expect(result.current.result.carbonEmissions).toBe(120);
      // carbon reduction: (240 / 360) * 100 = 66.666...% ≈ 66.7%
      expect(result.current.result.carbonReduction).toBe(66.7);
      // savings: (60*0.15) + (40*0.08) + (30*0.25) + (50*0.12) + (60*0.15)
      //        = 9 + 3.2 + 7.5 + 6 + 9 = 34.7
      expect(result.current.result.moneySavings).toBe(34.7);
    });

    it('should handle different percentages for multiple sliders', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 25);
        result.current.updateSlider('veganMeals', 75);
        result.current.updateSlider('reduceShopping', 100);
      });

      // reductions:
      // driveLess: 120 * 0.25 = 30kg
      // veganMeals: 80 * 0.75 = 60kg
      // reduceShopping: 60 * 1.0 = 60kg
      // total: 150kg
      // emissions: 360 - 150 = 210
      expect(result.current.result.carbonEmissions).toBe(210);
      // carbon reduction: (150 / 360) * 100 = 41.666...% ≈ 41.7%
      expect(result.current.result.carbonReduction).toBe(41.7);
    });
  });

  describe('Reset', () => {
    it('should reset all sliders to 0', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
        result.current.updateSlider('veganMeals', 75);
      });

      expect(result.current.sliders.find((s) => s.id === 'driveLess')?.value).toBe(50);
      expect(result.current.sliders.find((s) => s.id === 'veganMeals')?.value).toBe(75);

      act(() => {
        result.current.reset();
      });

      result.current.sliders.forEach((slider) => {
        expect(slider.value).toBe(0);
      });
    });

    it('should restore baseline emissions after reset', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
      });

      expect(result.current.result.carbonEmissions).toBe(240);

      act(() => {
        result.current.reset();
      });

      expect(result.current.result.carbonEmissions).toBe(360);
    });

    it('should restore zero carbon reduction after reset', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      expect(result.current.result.carbonReduction).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.result.carbonReduction).toBe(0);
    });

    it('should restore zero money savings after reset', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('reduceShopping', 50);
      });

      expect(result.current.result.moneySavings).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.result.moneySavings).toBe(0);
    });

    it('should restore sustainability score to 50 after reset', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
      });

      expect(result.current.result.sustainabilityScore).toBeGreaterThan(50);

      act(() => {
        result.current.reset();
      });

      expect(result.current.result.sustainabilityScore).toBe(50);
    });
  });

  describe('Sustainability Score Calculation', () => {
    it('should have sustainability score of 50 at baseline (0% reduction)', () => {
      const { result } = renderHook(() => useSimulator());

      // score = min(100, round(50 + 0 * 0.5)) = 50
      expect(result.current.result.sustainabilityScore).toBe(50);
    });

    it('should increase sustainability score with carbon reduction', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50); // 16.7% reduction
      });

      // score = min(100, round(50 + 16.7 * 0.5)) = min(100, round(58.35)) = 58
      expect(result.current.result.sustainabilityScore).toBe(58);
    });

    it('should calculate correct score for 33.3% carbon reduction', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100); // 33.3% reduction
      });

      // score = min(100, round(50 + 33.3 * 0.5)) = min(100, round(66.65)) = 67
      expect(result.current.result.sustainabilityScore).toBe(67);
    });

    it('should cap sustainability score at 100', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
        result.current.updateSlider('veganMeals', 100);
        result.current.updateSlider('reduceShopping', 100);
        result.current.updateSlider('renewableEnergy', 100);
        result.current.updateSlider('publicTransit', 100);
      });

      // total reduction: 360kg (100% of baseline)
      // carbon reduction: 100%
      // score = min(100, round(50 + 100 * 0.5)) = min(100, round(100)) = 100
      expect(result.current.result.sustainabilityScore).toBe(100);
    });

    it('should calculate score correctly for 50% total carbon reduction', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
        result.current.updateSlider('veganMeals', 50);
      });

      // reductions: 60 + 40 = 100kg
      // carbon reduction: (100 / 360) * 100 = 27.777...% ≈ 27.8%
      // score = min(100, round(50 + 27.8 * 0.5)) = min(100, round(63.9)) = 64
      expect(result.current.result.sustainabilityScore).toBe(64);
    });
  });

  describe('Boundary Conditions - All Sliders at 100%', () => {
    it('should zero out all emissions at 100% for all sliders', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
        result.current.updateSlider('veganMeals', 100);
        result.current.updateSlider('reduceShopping', 100);
        result.current.updateSlider('renewableEnergy', 100);
        result.current.updateSlider('publicTransit', 100);
      });

      // All reductions: 120 + 80 + 60 + 100 + 120 = 480kg
      // But baseline is only 360kg, so emissions should be 0
      expect(result.current.result.carbonEmissions).toBe(0);
    });

    it('should have 100% carbon reduction at all sliders 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
        result.current.updateSlider('veganMeals', 100);
        result.current.updateSlider('reduceShopping', 100);
        result.current.updateSlider('renewableEnergy', 100);
        result.current.updateSlider('publicTransit', 100);
      });

      expect(result.current.result.carbonReduction).toBe(100);
    });

    it('should calculate maximum money savings at all sliders 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
        result.current.updateSlider('veganMeals', 100);
        result.current.updateSlider('reduceShopping', 100);
        result.current.updateSlider('renewableEnergy', 100);
        result.current.updateSlider('publicTransit', 100);
      });

      // savings calculations are capped at baseline reductions
      // driveLess: 120 * 0.15 = 18.00
      // veganMeals: 80 * 0.08 = 6.40
      // reduceShopping: 60 * 0.25 = 15.00
      // renewableEnergy: 100 * 0.12 = 12.00
      // publicTransit: 120 * 0.15 = 18.00
      // total: 69.40
      expect(result.current.result.moneySavings).toBe(69.4);
    });

    it('should have max sustainability score at all sliders 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
        result.current.updateSlider('veganMeals', 100);
        result.current.updateSlider('reduceShopping', 100);
        result.current.updateSlider('renewableEnergy', 100);
        result.current.updateSlider('publicTransit', 100);
      });

      expect(result.current.result.sustainabilityScore).toBe(100);
    });
  });

  describe('Carbon Reduction Percentage Calculation', () => {
    it('should calculate 0% reduction at baseline', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.result.carbonReduction).toBe(0);
    });

    it('should calculate correct reduction for single slider at 50%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      // reduction: (60 / 360) * 100 = 16.666...% ≈ 16.7%
      expect(result.current.result.carbonReduction).toBe(16.7);
    });

    it('should calculate correct reduction for single slider at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
      });

      // reduction: (120 / 360) * 100 = 33.333...% ≈ 33.3%
      expect(result.current.result.carbonReduction).toBe(33.3);
    });

    it('should calculate correct reduction for veganMeals at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('veganMeals', 100);
      });

      // reduction: (80 / 360) * 100 = 22.222...% ≈ 22.2%
      expect(result.current.result.carbonReduction).toBe(22.2);
    });

    it('should calculate correct reduction for reduceShopping at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('reduceShopping', 100);
      });

      // reduction: (60 / 360) * 100 = 16.666...% ≈ 16.7%
      expect(result.current.result.carbonReduction).toBe(16.7);
    });

    it('should calculate correct reduction for renewableEnergy at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('renewableEnergy', 100);
      });

      // reduction: (100 / 360) * 100 = 27.777...% ≈ 27.8%
      expect(result.current.result.carbonReduction).toBe(27.8);
    });

    it('should calculate correct reduction for publicTransit at 100%', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('publicTransit', 100);
      });

      // reduction: (120 / 360) * 100 = 33.333...% ≈ 33.3%
      expect(result.current.result.carbonReduction).toBe(33.3);
    });

    it('should calculate combined carbon reduction correctly', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100); // 120kg
        result.current.updateSlider('renewableEnergy', 100); // 100kg
      });

      // total reduction: 220kg
      // percentage: (220 / 360) * 100 = 61.111...% ≈ 61.1%
      expect(result.current.result.carbonReduction).toBe(61.1);
    });
  });

  describe('Money Savings Calculation', () => {
    it('should be zero at baseline', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.result.moneySavings).toBe(0);
    });

    it('should calculate savings for transport category (driveLess)', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      // reduction: 120 * 0.5 = 60kg
      // savings: 60 * 0.15 = 9.00
      expect(result.current.result.moneySavings).toBe(9.0);
    });

    it('should calculate savings for food category (veganMeals)', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('veganMeals', 50);
      });

      // reduction: 80 * 0.5 = 40kg
      // savings: 40 * 0.08 = 3.20
      expect(result.current.result.moneySavings).toBe(3.2);
    });

    it('should calculate savings for shopping category (reduceShopping)', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('reduceShopping', 50);
      });

      // reduction: 60 * 0.5 = 30kg
      // savings: 30 * 0.25 = 7.50
      expect(result.current.result.moneySavings).toBe(7.5);
    });

    it('should calculate savings for energy category (renewableEnergy)', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('renewableEnergy', 50);
      });

      // reduction: 100 * 0.5 = 50kg
      // savings: 50 * 0.12 = 6.00
      expect(result.current.result.moneySavings).toBe(6.0);
    });

    it('should accumulate savings from multiple categories', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100); // 120 * 0.15 = 18.00
        result.current.updateSlider('veganMeals', 100); // 80 * 0.08 = 6.40
        result.current.updateSlider('reduceShopping', 100); // 60 * 0.25 = 15.00
      });

      // total: 18.00 + 6.40 + 15.00 = 39.40
      expect(result.current.result.moneySavings).toBe(39.4);
    });

    it('should round money savings to 2 decimal places', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 33);
      });

      // reduction: 120 * 0.33 = 39.6kg
      // savings: 39.6 * 0.15 = 5.94
      expect(result.current.result.moneySavings).toBe(5.94);
    });
  });

  describe('Emission Calculations', () => {
    it('should have correct baseline of 360kg', () => {
      const { result } = renderHook(() => useSimulator());

      // 120 + 80 + 60 + 100 = 360
      expect(result.current.result.carbonEmissions).toBe(360);
    });

    it('should subtract reductions from baseline correctly', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      // baseline - reduction = 360 - 60 = 300
      expect(result.current.result.carbonEmissions).toBe(300);
    });

    it('should round emissions to 1 decimal place', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 33);
      });

      // reduction: 120 * 0.33 = 39.6kg
      // emissions: 360 - 39.6 = 320.4
      expect(result.current.result.carbonEmissions).toBe(320.4);
    });

    it('should not go below zero emissions', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 100);
        result.current.updateSlider('veganMeals', 100);
        result.current.updateSlider('reduceShopping', 100);
        result.current.updateSlider('renewableEnergy', 100);
        result.current.updateSlider('publicTransit', 100);
      });

      expect(result.current.result.carbonEmissions).toBe(0);
    });
  });

  describe('Slider Identity and Structure', () => {
    it('should maintain all slider properties when updating', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      const slider = result.current.sliders.find((s) => s.id === 'driveLess');
      expect(slider).toEqual({
        id: 'driveLess',
        label: 'Drive Less',
        value: 50,
        min: 0,
        max: 100,
        step: 5,
        unit: '% reduction',
        category: 'transport',
      });
    });

    it('should not affect other sliders when updating one', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateSlider('driveLess', 50);
      });

      const veganMeals = result.current.sliders.find((s) => s.id === 'veganMeals');
      expect(veganMeals?.value).toBe(0);
    });

    it('should contain exactly 5 sliders', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.sliders).toHaveLength(5);
      expect(result.current.sliders.map((s) => s.id)).toEqual([
        'driveLess',
        'veganMeals',
        'reduceShopping',
        'renewableEnergy',
        'publicTransit',
      ]);
    });
  });
});
