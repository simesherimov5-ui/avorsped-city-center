"use client";

import { useState } from "react";
import { COMPANIES } from "./companies";
import "./company-ticker.css";

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="ctk-group" aria-hidden={hidden || undefined}>
      {COMPANIES.map(({ name }) => (
        <span key={name} className="ctk-pair">
          <span className="ctk-item">{name}</span>
          <span className="ctk-sep" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

/** "Quiet luxury" company ticker: a strip on every page, between the page and the footer. */
export default function CompanyTicker() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`ctk${paused ? " is-paused" : ""}`} role="region" aria-label="Компании во Јавор Шпед Холдинг">
      <div className="ctk-view">
        <div className="ctk-track">
          <Group />
          <Group hidden />
        </div>
      </div>
      <button
        type="button"
        className="ctk-pause"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Продолжи" : "Пауза"}
      >
        {paused ? (
          <svg width="10" height="12" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
            <path d="M1 0.8v12.4L11 7z" />
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
            <path d="M1 1h3.2v12H1zM7.8 1H11v12H7.8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
