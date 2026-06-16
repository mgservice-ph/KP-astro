const footerStyle = {
  textAlign: "center", padding: "16px 24px", fontSize: "0.8rem",
  color: "var(--muted)", borderTop: "1px solid var(--bdr)", marginTop: "24px"
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
      Krishnamurti Paddhati &copy; {new Date().getFullYear()} &mdash; KP Astrology Engine
    </footer>
  );
}
