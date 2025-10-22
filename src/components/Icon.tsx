import React from "react";

/* =========================================
   Icon — icônes SVG utilisées dans la nav
   ========================================= */
export function Icon({
  name,
  active = false,
  size = 22,
}: {
  name:
    | "home"
    | "dart"
    | "user"
    | "users"
    | "folder"
    | "chart"
    | "settings";
  active?: boolean;
  size?: number;
}) {
  const color = active ? "var(--c-primary)" : "#e7e7e7";

  switch (name) {
    case "home":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <path
            d="M3 10L12 3l9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "dart":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <path
            d="M21 3l-6 6-2-2L19 1l2 2Zm-9 9L3 21l2 2 9-9-2-2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "user":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
          <path
            d="M4 21v-1a7 7 0 0 1 16 0v1"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "users":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
          <path
            d="M17 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-1a7 7 0 0 1 14 0v1M14 21v-1a7 7 0 0 1 8-7"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "folder":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <path
            d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "chart":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 19h16M8 16V8m4 8V4m4 12v-6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "settings":
      return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5-3a7.5 7.5 0 0 0-.3-2l2.1-1.6-2-3.4-2.5 1a7.5 7.5 0 0 0-1.7-1L14 2h-4l-.6 2a7.5 7.5 0 0 0-1.7 1l-2.5-1-2 3.4L4.3 10a7.5 7.5 0 0 0 0 4l-2.1 1.6 2 3.4 2.5-1a7.5 7.5 0 0 0 1.7 1L10 22h4l.6-2a7.5 7.5 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6c.2-.7.3-1.4.3-2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      return null;
  }
}
