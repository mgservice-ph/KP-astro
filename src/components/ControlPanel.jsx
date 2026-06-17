import { useState, useEffect, useCallback } from "react";

const panelStyle = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "6px",
  padding: "12px", margin: "10px 0"
};
const labelStyle = { display: "block", fontSize: "0.7rem", color: "var(--muted)", marginBottom: "2px" };
const inputStyle = {
  width: "100%", padding: "5px 8px", borderRadius: "3px", border: "1px solid var(--bdr-strong)",
  background: "var(--card-sub)", color: "var(--fg)", fontSize: "0.8rem", boxSizing: "border-box"
};
const rowStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginBottom: "8px" };
const btnStyle = {
  padding: "6px 18px", borderRadius: "4px", border: "1px solid var(--accent)",
  background: "var(--accent-light)", color: "var(--accent-strong)",
  fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.3px",
  fontFamily: "inherit", transition: "all 0.2s"
};
const suggestionStyle = {
  position: "absolute", top: "100%", left: 0, right: 0,
  background: "var(--card)", border: "1px solid var(--bdr-strong)", borderRadius: "4px",
  maxHeight: "200px", overflowY: "auto", zIndex: 50
};
const suggestionItemStyle = {
  padding: "8px 10px", cursor: "pointer", fontSize: "0.85rem",
  borderBottom: "1px solid var(--bdr)", color: "var(--fg)"
};

export default function ControlPanel({ config, onConfigChange, onCompute }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);

  const update = useCallback((key, value) => {
    onConfigChange && onConfigChange(prev => ({ ...prev, [key]: value }));
  }, [onConfigChange]);

  const updateMulti = useCallback((updates) => {
    onConfigChange && onConfigChange(prev => ({ ...prev, ...updates }));
  }, [onConfigChange]);

  useEffect(() => {
    const loc = config?.location || "";
    if (loc.length < 3) { setSuggestions([]); setShowSug(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(loc)}`
        );
        const data = await res.json();
        setSuggestions(data.map(d => ({ display: d.display_name, lat: d.lat, lon: d.lon })));
        setShowSug(true);
      } catch { setSuggestions([]); }
    }, 500);
    return () => clearTimeout(timer);
  }, [config?.location]);

  const pickSuggestion = (s) => {
    updateMulti({
      location: s.display,
      latitude: parseFloat(s.lat),
      longitude: parseFloat(s.lon),
    });
    setShowSug(false);
  };

  return (
    <div style={panelStyle}>
      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Subject Profile Name</label>
          <input style={inputStyle} type="text" value={config?.name || ""}
            onChange={e => update("name", e.target.value)} placeholder="Enter name" />
        </div>
        <div>
          <label style={labelStyle}>Date of Birth</label>
          <input style={inputStyle} type="date" value={config?.dob || ""}
            onChange={e => update("dob", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Time of Birth</label>
          <input style={inputStyle} type="time" value={config?.tob || ""}
            onChange={e => update("tob", e.target.value)} />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} type="text" value={config?.location || ""}
            onChange={e => update("location", e.target.value)} placeholder="City, Country" />
          {showSug && suggestions.length > 0 && (
            <div style={suggestionStyle}>
              {suggestions.map((s, i) => (
                <div key={i} style={suggestionItemStyle}
                  onClick={() => pickSuggestion(s)}
                  onMouseEnter={e => e.currentTarget.style.background = "#333"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >{s.display}</div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>Latitude</label>
          <input style={inputStyle} type="number" step="any" value={config?.latitude ?? ""}
            onChange={e => update("latitude", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Longitude</label>
          <input style={inputStyle} type="number" step="any" value={config?.longitude ?? ""}
            onChange={e => update("longitude", parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div style={{ ...rowStyle, alignItems: "end" }}>
        <div>
          <label style={labelStyle}>Ayanamsa Mode</label>
          <select style={inputStyle} value={config?.ayanamsa || "kp"}
            onChange={e => update("ayanamsa", e.target.value)}>
            <option value="kp">KP</option>
            <option value="lahiri">Lahiri</option>
            <option value="raman">Raman</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button style={btnStyle} onClick={onCompute}>Run Analytics</button>
        </div>
      </div>
    </div>
  );
}
