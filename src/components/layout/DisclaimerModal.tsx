import React from 'react';
import { AlertTriangle, Check, ShieldAlert, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5 text-amber-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-extrabold text-zinc-100 tracking-tight">
              Safety, Health & Algorithmic Disclaimer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-zinc-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            FitMind AI is an educational fitness, body composition, and sports nutrition management tool. It is NOT a medical device, and it does not provide clinical diagnoses, medical clearance, or medical treatment plans.
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-zinc-100 uppercase tracking-wider text-[11px] mb-1">
                1. Statistical & Estimation Boundaries
              </h3>
              <p className="text-zinc-400">
                Body fat calculations are computed using the US Navy Circumference Method (Hodgdon & Beckett regression). While clinically validated with a standard error of ~3.0–3.5% compared to hydrostatic weighing, it is an anthropometric estimate, not an in-vivo DEXA scan or MRI.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-zinc-100 uppercase tracking-wider text-[11px] mb-1">
                2. Calorie & Nutritional Estimates
              </h3>
              <p className="text-zinc-400">
                Basal Metabolic Rate (BMR) uses the Mifflin-St Jeor equation, and Total Daily Energy Expenditure (TDEE) applies physical activity multipliers. Individual metabolic efficiency, thyroid function, non-exercise activity thermogenesis (NEAT), and gut absorption vary significantly.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-zinc-100 uppercase tracking-wider text-[11px] mb-1">
                3. Training & Physical Safeguards
              </h3>
              <p className="text-zinc-400">
                Workout routines are structured general athletic resistance programs. Always perform proper warm-ups and stop immediately if you experience sharp joint pain, dizziness, or chest discomfort.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-zinc-100 uppercase tracking-wider text-[11px] mb-1">
                4. Contraindications & Vulnerable Populations
              </h3>
              <p className="text-zinc-400">
                Adolescents under 18, pregnant or nursing individuals, and individuals with a history of eating disorders, cardiovascular disease, or kidney conditions should strictly consult a licensed physician or registered dietitian before starting calorie restriction.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
