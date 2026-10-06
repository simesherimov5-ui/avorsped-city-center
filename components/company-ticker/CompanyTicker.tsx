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

/** "Quiet luxury" company ticker: the last strip on every page, below the footer. */
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
        {paused ? "▶" : "❚❚"}
      </button>
    </div>
  );
}
