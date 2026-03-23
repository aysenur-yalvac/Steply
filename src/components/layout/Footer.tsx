import React from 'react';

export default function Footer() {
  return (
    <footer
      className="w-full py-5 mt-auto flex justify-center items-center"
      style={{
        background: "rgba(11,14,20,0.95)",
        borderTop: "1px solid rgba(160,32,240,0.12)",
      }}
    >
      <p className="text-sm text-slate-500 font-medium">
        Powered by{" "}
        <a
          href="https://must-b.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold transition-colors duration-200 hover:opacity-80"
          style={{ color: "#A020F0" }}
        >
          Must-b
        </a>
      </p>
    </footer>
  );
}
