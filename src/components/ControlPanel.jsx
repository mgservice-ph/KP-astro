import { useState, useEffect, useCallback, useRef } from "react";

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
  const [locDraft, setLocDraft] = useState(config?.location || "");
  const picking = useRef(false);

  useEffect(() => {
    setLocDraft(config?.location || "");
  }, [config?.location]);

  const update = useCallback((key, value) => {
    onConfigChange && onConfigChange(prev => ({ ...prev, [key]: value }));
  }, [onConfigChange]);

  const updateMulti = useCallback((updates) => {
    onConfigChange && onConfigChange(prev => ({ ...prev, ...updates }));
  }, [onConfigChange]);

  useEffect(() => {
    if (locDraft.length < 3) { setSuggestions([]); setShowSug(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(locDraft)}`
        );
        const data = await res.json();
        setSuggestions(data.map(d => ({ display: d.display_name, lat: d.lat, lon: d.lon })));
        setShowSug(true);
      } catch { setSuggestions([]); }
    }, 500);
    return () => clearTimeout(timer);
  }, [locDraft]);

  const pickSuggestion = (s) => {
    picking.current = true;
    setLocDraft(s.display);
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
          <label style={labelStyle} htmlFor="subjectName">Subject Profile Name</label>
          <input id="subjectName" style={inputStyle} type="text" value={config?.name || ""}
            onChange={e => update("name", e.target.value)} placeholder="Enter name" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="dob">Date of Birth</label>
          <input id="dob" style={inputStyle} type="date" value={config?.dob || ""}
            onChange={e => update("dob", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="tob">Time of Birth</label>
          <input id="tob" style={inputStyle} type="time" value={config?.tob || ""}
            onChange={e => update("tob", e.target.value)} />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={{ position: "relative" }}>
          <label style={labelStyle} htmlFor="location">Location</label>
          <input id="location" style={inputStyle} type="text" value={locDraft}
            onChange={e => setLocDraft(e.target.value)}
            onBlur={() => { if (!picking.current) { update("location", locDraft); } }}
            onFocus={() => picking.current = false} placeholder="City, Country" />
          {showSug && suggestions.length > 0 && (
            <div style={suggestionStyle}>
              {suggestions.map((s, i) => (
                <div key={i} style={suggestionItemStyle}
                  onMouseDown={e => { e.preventDefault(); pickSuggestion(s); }}
                  onMouseEnter={e => e.currentTarget.style.background = "#333"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >{s.display}</div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle} htmlFor="latitude">Latitude</label>
          <input id="latitude" style={inputStyle} type="number" step="any" value={config?.latitude ?? ""}
            onChange={e => update("latitude", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="longitude">Longitude</label>
          <input id="longitude" style={inputStyle} type="number" step="any" value={config?.longitude ?? ""}
            onChange={e => update("longitude", parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div style={{ ...rowStyle, alignItems: "end" }}>
        <div>
          <label style={labelStyle} htmlFor="ayanamsa">Ayanamsa Mode</label>
          <select id="ayanamsa" style={inputStyle} value={config?.ayanamsa || "kp"}
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
