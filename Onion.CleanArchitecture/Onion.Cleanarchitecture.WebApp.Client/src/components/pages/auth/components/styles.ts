import { CSSProperties } from "react";

export const layoutStyles: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)",
};

export const containerStyles: CSSProperties = {
  width: "420px",
  maxWidth: "100%",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(122, 157, 193, 0.15)",
  border: "1px solid #e1e7ee",
};

export const headStyles: CSSProperties = {
  borderBottom: 0,
  padding: 0,
};

export const bodyStyles: CSSProperties = { 
  padding: "40px 32px" 
};

export const titleStyles: CSSProperties = {
  textAlign: "center",
  marginBottom: "8px",
  fontSize: "22px",
  lineHeight: "32px",
  fontWeight: 700,
  color: "#476481",
};