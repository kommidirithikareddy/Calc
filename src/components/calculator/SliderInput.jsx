/**
 * SliderInput — reusable slider + number input combo
 * Props:
 *   label     {string}
 *   hint      {string}   shown right of label
 *   value     {number}
 *   min       {number}
 *   max       {number}
 *   step      {number}
 *   prefix    {string}   e.g. "$"
 *   suffix    {string}   e.g. "%"
 *   onChange  {function} receives new number value
 *   inputWidth {string}  css width of number input (default "90px")
 */
export default function SliderInput({
  label, hint, value, min = 0, max = 100, step = 1,
  prefix, suffix, onChange, inputWidth = '90px'
}) {
  function handleSlider(e) {
    onChange(parseFloat(e.target.value))
  }

  function handleInput(e) {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
  }

  // Calculate slider fill percentage for the track colour
  const pct = ((value - min) / (max - min)) * 100

  return (
    <>
      <div className="slider-input-group">
        {/* Label row */}
        <div className="sig-label-row">
          <label className="sig-label">{label}</label>
          {hint && <span className="sig-hint">{hint}</span>}
        </div>

        {/* Slider + number input */}
        <div className="sig-controls">
          {prefix && <span className="sig-prefix">{prefix}</span>}

          <input
            type="range"
            className="sig-slider"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSlider}
            style={{
              background: `linear-gradient(to right, #6366f1 ${pct}%, var(--border-2) ${pct}%)`
            }}
          />

          <input
            type="number"
            className="sig-number"
            style={{ width: inputWidth }}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleInput}
          />

          {suffix && <span className="sig-prefix">{suffix}</span>}
        </div>
      </div>

      <style>{`
        .slider-input-group {
          margin-bottom: 20px;
        }
        .sig-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .sig-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .sig-hint {
          font-size: 10px;
          color: var(--text-3);
        }
        .sig-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sig-prefix {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          flex-shrink: 0;
          min-width: 14px;
        }

        /* Slider */
        .sig-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 5px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          transition: background 0.1s;
        }
        .sig-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99,102,241,0.4);
          transition: box-shadow 0.15s, transform 0.12s;
        }
        .sig-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(99,102,241,0.15), 0 2px 8px rgba(99,102,241,0.4);
          transform: scale(1.1);
        }
        .sig-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .sig-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          border: none;
          box-shadow: 0 2px 8px rgba(99,102,241,0.4);
        }

        /* Number input */
        .sig-number {
          width: 90px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          background: var(--bg-input, var(--bg-card));
          outline: none;
          font-family: 'DM Sans', sans-serif;
          text-align: right;
          transition: border-color 0.12s, box-shadow 0.12s;
          flex-shrink: 0;
        }
        .sig-number:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .sig-number::-webkit-inner-spin-button,
        .sig-number::-webkit-outer-spin-button { opacity: 0; }
      `}</style>
    </>
  )
}
