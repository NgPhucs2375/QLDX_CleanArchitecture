import { Tag } from "antd";
import { PurchaseRequestStatus } from "../constants/enums";
import { getStatusConfig } from "../constants/purchase-request";

interface StatusTagProps {
  status: PurchaseRequestStatus;
  style?: React.CSSProperties;
}

export const StatusTag = ({ status, style }: StatusTagProps) => {
  const config = getStatusConfig(status);
  return (
    <Tag color={config.color} style={{ padding: "4px 12px", fontSize: 14, borderRadius: 4, ...style }}>
      {config.label}
    </Tag>
  );
};
