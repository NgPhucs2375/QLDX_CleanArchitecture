import type { IPurchaseRequest } from "./types";

export const STYLES = `
  .pr-form { max-width: 1100px; margin: 0 auto; padding: 0; }
  .pr-form .ant-form-item-label > label { font-size: 14px; font-weight: 500; }
  .pr-form .ant-input, .pr-form .ant-select, .pr-form .ant-picker, .pr-form .ant-input-number { font-size: 14px; }
  .pr-card {
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .pr-card-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px; padding-bottom: 14px;
    border-bottom: 2px solid #e8e8e8;
  }
  .pr-card-header h3 { font-size: 17px; font-weight: 600; margin: 0; color: #1a1a1a; }
  .pr-card-icon {
    width: 32px; height: 32px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .pr-card-icon.blue { background: #e6f4ff; color: #1677ff; }
  .pr-card-icon.green { background: #f6ffed; color: #52c41a; }
  .pr-card-icon.orange { background: #fff7e6; color: #fa8c16; }
  .pr-card-icon.purple { background: #f9f0ff; color: #722ed1; }
  .pr-topbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 32px;
    background: #fff; border: 1px solid #d9d9d9;
    border-radius: 8px; padding: 14px 24px; margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .pr-topbar-item { display: flex; flex-direction: column; gap: 2px; }
  .pr-topbar-label { font-size: 12px; color: rgba(0,0,0,0.45); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-topbar-value { font-size: 14px; color: rgba(0,0,0,0.88); font-weight: 500; }
  .pr-badge {
    padding: 2px 12px; border-radius: 10px; font-size: 12px; font-weight: 500;
    width: fit-content;
  }
  .pr-badge.draft { background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; }
  .pr-badge.active { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
  .pr-field-row { display: flex; gap: 24px; flex-wrap: wrap; }
  .pr-field { flex: 1; min-width: 220px; }
  .pr-field label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: rgba(0,0,0,0.88); }
  .pr-layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 20px; align-items: start; }
  @media (max-width: 760px) { .pr-layout { grid-template-columns: minmax(0,1fr); } }
  .pr-chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .pr-chip {
    padding: 8px 18px; border: 1px solid #d9d9d9; border-radius: 20px;
    font-size: 14px; cursor: pointer; background: #fff;
    color: rgba(0,0,0,0.65); user-select: none; transition: all 0.2s;
  }
  .pr-chip:hover { border-color: #1677ff; color: #1677ff; background: #e6f4ff; }
  .pr-empty-hint {
    padding: 36px 24px; text-align: center; color: rgba(0,0,0,0.45); font-size: 15px;
    border: 1px dashed #d9d9d9; border-radius: 8px; background: #fafafa;
  }
  .pr-product-table { width: 100%; border-collapse: collapse; }
  .pr-product-table th {
    text-align: left; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.45);
    padding: 8px 12px; border-bottom: 2px solid #e8e8e8;
  }
  .pr-product-table td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
  .pr-category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .pr-category-header h4 { font-size: 15px; font-weight: 600; margin: 0; }
  .pr-category-subtotal { font-size: 15px; font-weight: 600; color: #1677ff; }
  .pr-add-row-btn {
    margin-top: 10px; border: 1px dashed #d9d9d9; background: none;
    color: rgba(0,0,0,0.45); border-radius: 6px; padding: 8px 16px;
    font-size: 14px; cursor: pointer; width: 100%; transition: all 0.2s;
  }
  .pr-add-row-btn:hover { border-color: #1677ff; color: #1677ff; background: #e6f4ff; }
  .pr-remove-row {
    border: none; background: none; color: rgba(0,0,0,0.25);
    font-size: 18px; cursor: pointer; padding: 0 4px; transition: color 0.2s;
  }
  .pr-remove-row:hover { color: #ff4d4f; }
  .pr-sidebar-card { position: sticky; top: 24px; }
  .pr-budget-row { display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; color: rgba(0,0,0,0.65); }
  .pr-budget-row strong { color: rgba(0,0,0,0.88); font-weight: 500; }
  .pr-budget-row.diff strong { font-size: 17px; }
  .pr-progress-track { height: 8px; background: #f0f0f0; border-radius: 4px; margin: 10px 0 6px; overflow: hidden; }
  .pr-progress-fill { height: 100%; border-radius: 4px; background: #52c41a; width: 0%; transition: width 0.3s; }
  .pr-approver-step { display: flex; align-items: center; gap: 10px; }
  .pr-approver-step-order {
    width: 28px; height: 28px; border-radius: 50%; background: #1677ff; color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0;
  }
  .pr-approver-step-label { font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.88); }
  .pr-approver-step-name { font-size: 12px; color: rgba(0,0,0,0.45); }
  .pr-approver-arrow { font-size: 18px; color: rgba(0,0,0,0.25); margin: 0 4px; }
`;

const statusMap: Record<number, { label: string; className: string }> = {
  1: { label: "Draft", className: "draft" },
  2: { label: "Pending Department", className: "active" },
  3: { label: "Pending Control", className: "active" },
  4: { label: "Returned for Edit", className: "draft" },
  5: { label: "Approved", className: "active" },
  6: { label: "Pending Order Confirm", className: "active" },
  7: { label: "Completed", className: "active" },
  8: { label: "Rejected by Dept", className: "draft" },
  9: { label: "Rejected by Control", className: "draft" },
};

export { statusMap };

interface PurchaseRequestFormProps {
  initialData?: IPurchaseRequest;
  children?: React.ReactNode;
  codeItem?: React.ReactNode;
  extraTopbar?: React.ReactNode;
}

export const PurchaseRequestForm = ({ initialData, children, codeItem, extraTopbar }: PurchaseRequestFormProps) => {
  return (
    <>
      <style>{STYLES}</style>
      <div className="pr-form">
        <div className="pr-topbar">
          <div className="pr-topbar-item">
            <span className="pr-topbar-label">Mã phiếu</span>
            {codeItem || (
              <span className="pr-topbar-value">{initialData?.Code || "—"}</span>
            )}
          </div>
          {initialData && (
            <>
              <div className="pr-topbar-item">
                <span className="pr-topbar-label">Ngày tạo</span>
                <span className="pr-topbar-value">{new Date(initialData.Created).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="pr-topbar-item">
                <span className="pr-topbar-label">Người tạo</span>
                <span className="pr-topbar-value">{initialData.CreatedBy || "—"}</span>
              </div>
              <div className="pr-topbar-item">
                <span className="pr-topbar-label">Trạng thái</span>
                <span className={`pr-badge ${statusMap[initialData.Status]?.className || "draft"}`}>
                  {statusMap[initialData.Status]?.label || "Unknown"}
                </span>
              </div>
            </>
          )}
          {!initialData && (
            <div className="pr-topbar-item">
              <span className="pr-topbar-label">Trạng thái</span>
              <span className="pr-badge draft">Nháp</span>
            </div>
          )}
          {extraTopbar}
        </div>

        {children}
      </div>
    </>
  );
};