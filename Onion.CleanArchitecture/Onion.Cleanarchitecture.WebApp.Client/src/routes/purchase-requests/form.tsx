import React from "react";

export const STYLES = `
  .pr-form { max-width: 100%; margin: 0 auto; padding: 0; font-size: 15px; }
  .pr-form .ant-form-item { margin-bottom: 20px; }
  .pr-form .ant-form-item-label > label { font-size: 15px; font-weight: 600; color: #3a4a5b; }
  .pr-form .ant-input, .pr-form .ant-select, .pr-form .ant-picker, .pr-form .ant-input-number,
  .pr-form .ant-input-number-input { font-size: 15px !important; }
  
  .pr-card {
    background: #ffffff;
    border: 1px solid #e1e7ee;
    border-radius: 8px;
    padding: 0 0 24px 0;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(122, 157, 193, 0.05);
    overflow: hidden;
    height: 100%;
  }
  .pr-card-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%); /* Nền ngọc trai bạc nhẹ */
    border-bottom: 1px solid #e1e7ee;
    margin-bottom: 20px;
  }
  .pr-card-header h3 { font-size: 17px; font-weight: 700; margin: 0; color: #476481; } /* Xanh đại dương trầm */
  .pr-card-body { padding: 0 24px; }

  .pr-layout { display: block; }
  
  .pr-chips { display: flex; flex-wrap: wrap; gap: 12px; }
  .pr-chip {
    padding: 10px 20px; border: 1px solid #d3dfea; border-radius: 6px;
    font-size: 15px; cursor: pointer; background: #fff; font-weight: 500;
    color: #5c6c7e; user-select: none; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .pr-chip:hover:not(.readonly) { border-color: #7a9dc1; color: #7a9dc1; background: #f2f6fb; }
  .pr-chip.readonly {
    background: #f4f7fa; border-color: #e1e7ee; color: #a5b4c3;
    cursor: not-allowed;
  }
  .pr-chip.readonly .anticon { color: #7a9dc1; font-size: 16px; }

  /* Bảng sản phẩm ánh ngọc trai sang trọng */
  .pr-table-container { overflow-x: auto; padding: 0; border: 1px solid #e1e7ee; border-radius: 6px; margin: 0 24px;}
  .pr-product-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
  .pr-product-table th {
    text-align: left; font-size: 14px; font-weight: 600; color: #ffffff;
    padding: 14px 16px; background: #7a9dc1; /* Tiêu đề màu Xanh Blue Ngọc Trai */
    border-bottom: 2px solid #5d82a6;
    white-space: nowrap;
  }
  .pr-product-table td { padding: 14px 16px; border-bottom: 1px solid #f2f6fb; vertical-align: middle; }
  
  .pr-nowrap-text { white-space: nowrap; font-size: 15px; }
  .pr-amount-text { white-space: nowrap; font-weight: 600; font-variant-numeric: tabular-nums; font-size: 15px; }
  
  .pr-category-block {
    border: 1px solid #d3dfea; border-radius: 8px; margin-bottom: 24px;
    box-shadow: 0 2px 6px rgba(122, 157, 193, 0.04); overflow: hidden;
  }
  .pr-category-header { 
    display: flex; justify-content: space-between; align-items: center; 
    padding: 16px 24px; background: #f0f4f9; border-bottom: 1px solid #d3dfea;
  }
  .pr-category-header h4 { font-size: 18px; font-weight: 700; margin: 0; color: #476481; }
  
  .pr-category-footer {
    display: flex; justify-content: flex-end; gap: 40px;
    padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f2f6fb;
    font-size: 15px; flex-wrap: nowrap; white-space: nowrap;
  }
  .pr-quota-item { color: #6b7c93; }
  .pr-quota-item strong { font-size: 17px; margin-left: 8px; font-variant-numeric: tabular-nums; color: #2c3e50; }

  .pr-add-row-btn {
    margin: 16px 24px; border: 1px dashed #c0d1e1; background: #fff;
    color: #7a9dc1; border-radius: 6px; padding: 10px 20px; font-weight: 600;
    font-size: 15px; cursor: pointer; width: calc(100% - 48px); transition: all 0.2s;
  }
  .pr-add-row-btn:hover { border-color: #476481; background: #f0f4f9; }
  
  .pr-remove-btn {
    border: none; background: #fdf3f2; color: #e0534a; border-radius: 6px;
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; transition: all 0.2s;
  }
  .pr-remove-btn:hover { background: #fbe6e4; }

  .pr-approver-step { display: flex; align-items: center; gap: 12px; background: #f4f7fa; padding: 10px 16px; border-radius: 6px; border: 1px solid #e1e7ee; }
  .pr-approver-step-order {
    width: 32px; height: 32px; border-radius: 50%; background: #7a9dc1; color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;
  }
  .pr-approver-step-label { font-size: 15px; font-weight: 700; color: #476481; }
`;

export const PurchaseRequestForm = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <style>{STYLES}</style>
      <div className="pr-form">{children}</div>
    </>
  );
};