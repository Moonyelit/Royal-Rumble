// ProgressBar.jsx
import "./ProgressBar.css";

function ProgressBar({ pv, pvMax, faType, barName, bgType, className }) {
  return (
    <div className="progress md-progress">
      <div
        className={`progress-bar progress-bar-custom ${bgType} ${className || ''}`}
        style={{ width: (pv * 100) / pvMax + "%" }}
        aria-valuenow={pv}
        aria-valuemin="0"
        aria-valuemax={pvMax}
        role="progressbar"
      >
        <i className={`fas ${faType}`}>
          {pv} {barName}
        </i>
      </div>
    </div>
  );
}

export default ProgressBar;
