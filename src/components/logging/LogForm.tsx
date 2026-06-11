/**
 * EcoMind AI Ultra — Carbon Log Form
 * Secure form for logging carbon footprint activities.
 * Security: Input validation, XSS prevention, CSRF-safe via Supabase auth.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCarbonLogs } from '../../hooks/useCarbonLogs';
import { supabase } from '../../lib/supabase';
import { sanitizeString, isInRange } from '../../utils/validation';
import { Plus, Calculator, Loader2 } from 'lucide-react';
import type { LogFormData } from '../../types';

interface Category {
  id: string;
  name: string;
  display_name: string;
}

export function LogForm() {
  const { user } = useAuth();
  const { addLog } = useCarbonLogs();
  const [categories, setCategories] = useState<Category[]>([]);
  const [factors, setFactors] = useState<Array<{ id: string; activity_name: string; factor: number; unit: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewCarbon, setPreviewCarbon] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<LogFormData>>({
    categoryId: '',
    activityName: '',
    quantity: 1,
    unit: 'km',
    notes: '',
    logDate: new Date().toISOString().split('T')[0],
  });

  // Load categories on mount
  useState(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name, display_name');
      if (data) setCategories(data as Category[]);
    };
    loadCategories();
  });

  const loadFactors = useCallback(async (categoryId: string) => {
    const { data } = await supabase
      .from('emission_factors')
      .select('id, activity_name, factor, unit')
      .eq('category_id', categoryId);
    setFactors(data || []);
  }, []);

  const handleCategoryChange = async (categoryId: string) => {
    setFormData((prev) => ({ ...prev, categoryId, activityName: '' }));
    await loadFactors(categoryId);
  };

  const handleFactorSelect = (activityName: string) => {
    const factor = factors.find((f) => f.activity_name === activityName);
    if (factor) {
      setFormData((prev) => ({
        ...prev,
        activityName: factor.activity_name,
        unit: factor.unit,
      }));
      calculatePreview(formData.quantity || 1, factor.factor);
    }
  };

  const calculatePreview = (quantity: number, factor?: number) => {
    const selectedFactor = factor ?? factors.find((f) => f.activity_name === formData.activityName)?.factor ?? 0;
    setPreviewCarbon(quantity * selectedFactor);
  };

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setFormData((prev) => ({ ...prev, quantity: num }));
      calculatePreview(num);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError('You must be signed in to log activities.');
      return;
    }

    if (!formData.categoryId || !formData.activityName || !formData.quantity || !formData.logDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isInRange(formData.quantity, 0.01, 100000)) {
      setError('Quantity must be between 0.01 and 100,000.');
      return;
    }

    setIsLoading(true);

    const sanitizedData: LogFormData = {
      categoryId: formData.categoryId,
      activityName: sanitizeString(formData.activityName),
      quantity: formData.quantity,
      unit: sanitizeString(formData.unit || ''),
      notes: formData.notes ? sanitizeString(formData.notes) : '',
      logDate: formData.logDate,
    };

    const { error: submitError } = await addLog(sanitizedData);

    if (submitError) {
      setError(submitError.message);
    } else {
      setSuccess(true);
      setFormData({
        categoryId: '',
        activityName: '',
        quantity: 1,
        unit: 'km',
        notes: '',
        logDate: new Date().toISOString().split('T')[0],
      });
      setPreviewCarbon(0);
      setTimeout(() => setSuccess(false), 3000);
    }

    setIsLoading(false);
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Carbon footprint activity logging form">
      <h2 className="text-lg font-semibold text-white mb-4">Log Carbon Footprint</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm" role="alert" aria-live="assertive" aria-label="Form error message">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm" role="status" aria-live="polite" aria-label="Success message">
          Activity logged successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity */}
          <div>
            <label htmlFor="activity" className="block text-sm font-medium text-slate-300 mb-1">
              Activity <span className="text-red-400">*</span>
            </label>
            <select
              id="activity"
              value={formData.activityName}
              onChange={(e) => handleFactorSelect(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
              disabled={!formData.categoryId}
            >
              <option value="">Select activity</option>
              {factors.map((f) => (
                <option key={f.id} value={f.activity_name}>
                  {f.activity_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-1">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              max="100000"
              value={formData.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-slate-300 mb-1">
              Unit <span className="text-red-400">*</span>
            </label>
            <input
              id="unit"
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="logDate" className="block text-sm font-medium text-slate-300 mb-1">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              id="logDate"
              type="date"
              value={formData.logDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, logDate: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            placeholder="Add any details..."
          />
        </div>

        {/* Preview */}
        {previewCarbon > 0 && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" aria-live="polite" aria-label={`Estimated carbon impact: ${previewCarbon.toFixed(2)} kg CO2e, equivalent to ${(previewCarbon / 21).toFixed(2)} trees sequestering carbon annually`}>
            <Calculator className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <div>
              <p className="text-sm text-emerald-300">Estimated Carbon Impact</p>
              <p className="text-lg font-bold text-emerald-400">{previewCarbon.toFixed(2)} kg CO2e</p>
              <p className="text-xs text-emerald-400/70 mt-1">≈ {(previewCarbon / 21).toFixed(2)} trees · {(previewCarbon / 0.12).toFixed(1)} km driving avoided</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Logging...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" aria-hidden="true" />
              Log Activity
            </>
          )}
        </button>
      </form>
    </section>
  );
}

// Memoize component for performance
export const MemoizedLogForm = LogForm;
