"use client";

import { Printer, Rows3 } from "lucide-react";
import { useState } from "react";

export function ResumeActions() {
  const [compact, setCompact] = useState(false);

  function toggleDensity() {
    const next = !compact;
    setCompact(next);
    document.documentElement.dataset.density = next ? "compact" : "comfortable";
  }

  return (
    <div className="resume-actions" aria-label="简历工具">
      <button type="button" onClick={() => window.print()} aria-label="打印简历">
        <Printer aria-hidden="true" />
        <span>打印</span>
      </button>
      <button
        type="button"
        onClick={toggleDensity}
        aria-label={compact ? "切换为舒展布局" : "切换为紧凑布局"}
        aria-pressed={compact}
      >
        <Rows3 aria-hidden="true" />
        <span>{compact ? "舒展" : "紧凑"}</span>
      </button>
    </div>
  );
}
