import { Button, Space } from "antd";
import type { VisibleAction } from "../hooks/usePurchaseRequestShow";

interface ActionButtonsProps {
  actions: VisibleAction[];
  onAction: (endpoint: string, label: string) => void;
}

const buttonClassName = (endpoint: string) =>
  endpoint === "return-for-edit" ? "pr-btn-warning" : "";

export const ActionButtons = ({ actions, onAction }: ActionButtonsProps) => (
  <Space>
    {actions.map((act) => (
      <Button
        key={act.endpoint}
        type="primary"
        size="middle"
        danger={act.danger}
        className={buttonClassName(act.endpoint)}
        onClick={() => onAction(act.endpoint, act.label)}
      >
        {act.label}
      </Button>
    ))}
  </Space>
);
