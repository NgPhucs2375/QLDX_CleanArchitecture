import React from "react";

export const STYLES = `
  .cat-form { max-width: 100%; margin: 0 auto; padding: 0; font-size: 15px; }
  .cat-form .ant-form-item { margin-bottom: 20px; }
  .cat-form .ant-form-item-label > label { font-size: 15px; font-weight: 600; color: #3a4a5b; }
  .cat-form .ant-input, .cat-form .ant-select { font-size: 15px !important; }
  
  .cat-card {
    background: #ffffff;
    border: 1px solid #e1e7ee;
    border-radius: 8px;
    padding: 0 0 24px 0;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(122, 157, 193, 0.05);
    overflow: hidden;
  }
  .cat-card-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%);
    border-bottom: 1px solid #e1e7ee;
    margin-bottom: 20px;
  }
  .cat-card-header h3 { font-size: 17px; font-weight: 700; margin: 0; color: #476481; }
  .cat-card-body { padding: 0 24px; }
  
  .cat-card-icon {
    width: 38px; height: 38px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    background: #e6f4ff; color: #1677ff;
  }
`;

export const CategoryForm = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <style>{STYLES}</style>
      <div className="cat-form">{children}</div>
    </>
  );
};