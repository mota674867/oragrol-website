"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function UtilityBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const isFr = locale === "fr";
  const otherLocale = isFr ? "en" : "fr";
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div
      style={{
        background: "#0A0A0A",
        borderBottom: "1px solid #1a1a1a",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        fontSize: "11px",
        position: "relative",
        zIndex: 60,
      }}
    >
      {/* Left — Free Scan */}
      <Link
        href="/scan"
        style={{
          color: "#e86b1f",
          fontWeight: 600,
          letterSpacing: ".06em",
          textDecoration: "none",
        }}
      >
        {isFr ? "Scan gratuit →" : "Free Scan →"}
      </Link>

      {/* Right — Log in + EN/FR */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>

        {/* Log in dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setLoginOpen(!loginOpen)}
            onBlur={() => setTimeout(() => setLoginOpen(false), 150)}
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "inherit",
              letterSpacing: ".04em",
            }}
          >
            {isFr ? "Connexion" : "Log in"} <span style={{ fontSize: "8px" }}>▾</span>
          </button>

          {loginOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "260px",
                background: "#111",
                border: "1px solid #222",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                zIndex: 100,
              }}
            >
              <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid #1f1f1f" }}>
                <p style={{ fontSize: "9px", color: "#555", letterSpacing: ".14em", margin: 0, fontWeight: 600 }}>
                  {isFr ? "VOS PORTAILS" : "YOUR PORTALS"}
                </p>
              </div>

              <a
                href="https://app.oragrolglobal.com/or-one"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", padding: "12px 16px", borderBottom: "1px solid #1a1a1a", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#e0e0e0", margin: "0 0 2px" }}>OR ONE Dashboard</p>
                <p style={{ fontSize: "10px", color: "#555", margin: 0 }}>
                  {isFr ? "Agents IA, approbations et rapports" : "AI agents, approvals and reports"}
                </p>
              </a>

              <a
                href="https://app.oragrolglobal.com/services"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", padding: "12px 16px", borderBottom: "1px solid #1a1a1a", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#e0e0e0", margin: "0 0 2px" }}>
                  {isFr ? "Tableau de bord Services" : "Services Dashboard"}
                </p>
                <p style={{ fontSize: "10px", color: "#555", margin: 0 }}>
                  {isFr ? "Statut de protection et rapports" : "Protection status and reports"}
                </p>
              </a>

              <Link
                href="/contact"
                style={{ display: "block", padding: "10px 16px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <p style={{ fontSize: "12px", color: "#e0e0e0", margin: 0 }}>
                  {isFr ? "Nouveau client ? Commencez ici →" : "New client? Start here →"}
                </p>
              </Link>
            </div>
          )}
        </div>

        {/* EN / FR toggle */}
        <div style={{ color: "#666", letterSpacing: ".06em" }}>
          <span style={{ color: "#e86b1f", fontWeight: 600 }}>{locale.toUpperCase()}</span>
          <span style={{ color: "#333" }}>&nbsp;/&nbsp;</span>
          <Link
            href={pathname}
            locale={otherLocale}
            style={{ color: "#666", textDecoration: "none" }}
            aria-label={isFr ? "Switch to English" : "Passer en français"}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      </div>
    </div>
  );
}
