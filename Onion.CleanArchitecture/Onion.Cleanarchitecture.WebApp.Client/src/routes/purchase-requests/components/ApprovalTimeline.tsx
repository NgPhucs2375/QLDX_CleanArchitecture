import { DateField } from "@refinedev/antd";
import { Card, Flex, Space, Tag, Timeline, Typography } from "antd";
import { CheckCircleFilled, CloseCircleFilled, ClockCircleOutlined } from "@ant-design/icons";
import { getActionDisplay } from "../constants/purchase-request";
import type { IPurchaseRequestApprover, IPurchaseRequestApproval } from "../types";
import "../../../assets/purchase-request.css";

const { Text } = Typography;

interface ApprovalTimelineProps {
  approvers: IPurchaseRequestApprover[];
  approvals: IPurchaseRequestApproval[];
}

const getApprovalStatus = (status: number) => ({
  isApproved: status === 2,
  isRejected: status === 3,
  isPending: status === 0 || status === 1,
});

const timelineDot = (isApproved: boolean, isRejected: boolean) =>
  isApproved ? (
    <CheckCircleFilled style={{ fontSize: 22, color: "#10b981" }} />
  ) : isRejected ? (
    <CloseCircleFilled style={{ fontSize: 22, color: "#ef4444" }} />
  ) : (
    <ClockCircleOutlined style={{ fontSize: 22, color: "#94a3b8" }} />
  );

const getApprovalAction = (approvals: IPurchaseRequestApproval[], approverId: string) =>
  approvals.find((ap) => String(ap.ApproverId) === String(approverId));

export const ApprovalTimeline = ({ approvers, approvals }: ApprovalTimelineProps) => {
  if (approvers.length === 0) {
    return <Text type="secondary">Chưa có luồng duyệt</Text>;
  }

  const sorted = [...approvers].sort((a, b) => a.StepOrder - b.StepOrder);

  return (
    <Timeline
      className="pr-timeline-bold"
      items={sorted.map((ap) => {
        const { isApproved, isRejected, isPending } = getApprovalStatus(ap.Status);
        const approvalAction = getApprovalAction(approvals, ap.ApproverId);
        const actionVal = approvalAction?.Action ?? "";
        const actionDisplay = getActionDisplay(actionVal);
        const timelineColor = isApproved ? "green" : isRejected ? "red" : "gray";
        const roleLabel = ap.StepOrder === 1 ? "Trưởng đơn vị" : "Kiểm soát";

        return {
          color: timelineColor,
          dot: timelineDot(isApproved, isRejected),
          className: `pr-line-${timelineColor}`,
          children: (
            <Card
              size="small"
              bordered
              style={{
                marginBottom: 16,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderLeft: isApproved
                  ? "4px solid #10b981"
                  : isRejected
                  ? "4px solid #ef4444"
                  : "4px solid #cbd5e1",
                borderRadius: 8,
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
              }}
              styles={{ body: { padding: "14px 16px" } }}
            >
              <Flex justify="space-between" align="flex-start" style={{ marginBottom: 4 }}>
                <Space size={8} wrap>
                  <Tag color="processing" bordered={false} style={{ margin: 0, fontWeight: 500 }}>
                    {roleLabel}
                  </Tag>
                  <Text strong style={{ fontSize: 14 }}>{ap.ApproverName}</Text>
                </Space>
              </Flex>

              {approvalAction && (
                <Space style={{ marginTop: 8 }}>
                  <Tag color={actionDisplay.color} bordered={false} style={{ fontSize: 12, fontWeight: 500 }}>
                    {actionDisplay.label}
                  </Tag>
                  {approvalAction.Created && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <DateField value={approvalAction.Created} format="DD/MM HH:mm" />
                    </Text>
                  )}
                </Space>
              )}

              {isPending && (
                <Text type="secondary" italic style={{ fontSize: 13, display: "block", marginTop: 8 }}>
                  Đang chờ xử lý...
                </Text>
              )}

              {approvalAction?.Note && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: isRejected ? "#fef2f2" : "#f8fafc",
                    borderLeft: `2px solid ${isRejected ? "#fca5a5" : "#cbd5e1"}`,
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <Text strong type={isRejected ? "danger" : "secondary"}>Ghi chú: </Text>
                    {approvalAction.Note}
                  </Text>
                </div>
              )}
            </Card>
          ),
        };
      })}
    />
  );
};
