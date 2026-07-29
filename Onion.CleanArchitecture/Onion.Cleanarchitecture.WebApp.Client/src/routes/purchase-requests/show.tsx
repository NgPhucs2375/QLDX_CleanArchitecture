import { DateField, Show, EditButton } from "@refinedev/antd";
import {
  Typography, Tag, Button, Space, Modal, Card, Table, Input, Row, Col, Descriptions, Flex, Timeline,
} from "antd";
import {
  InfoCircleOutlined, CheckCircleOutlined,
  CheckCircleFilled, CloseCircleFilled, SwapOutlined,
} from "@ant-design/icons";
import { usePurchaseRequestShow } from "./hooks";
import { StatusTag, ApprovalTimeline, ConfirmOrderModal } from "./components";
import { getActionDisplay } from "./constants/purchase-request";
import "../../assets/purchase-request.css";

const { Title, Text, Paragraph } = Typography;
const fmtVnd = (n?: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

export const ShowPurchaseRequest = () => {
  const {
    record, status, isLoading, isMutating, deptName, creatorName,
    categories, approvals, visibleActions, showEdit,
    modalVisible, confirmModalVisible, actionLabel, actionNote,
    showAllHistory, localQty, setModalVisible, setConfirmModalVisible,
    setActionEndpoint, setActionLabel, setActionNote, setShowAllHistory,
    setLocalQty, handleBulkConfirm, executeTrigger,
  } = usePurchaseRequestShow();

  const categoriesList = categories ?? [];
  const approvalList = approvals ?? [];

  const handleQtyChange = (id: number, val: number | null) => {
    setLocalQty({ ...localQty, [id]: val || 0 });
  };

  const historyItems = showAllHistory
    ? [...approvalList].reverse()
    : [...approvalList].reverse().slice(0, 5);

  const makeAction = (endpoint: string, label: string) => {
    setActionEndpoint(endpoint);
    setActionLabel(label);
    if (endpoint === "confirm-order") {
      setConfirmModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  return (
    <Show isLoading={isLoading}
      title={<Title level={3} className="pr-m-0 pr-text-emerald">Chi tiết Phiếu Đề Xuất</Title>}
      headerButtons={<></>}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card loading={isLoading} className="pr-card pr-card-emerald"
              title={<Space><InfoCircleOutlined className="pr-text-emerald" style={{ fontSize: 20 }} />
                <Text strong className="pr-text-emerald" style={{ fontSize: 18 }}>Thông tin quy chiếu</Text></Space>}
              extra={
                (showEdit || visibleActions.length > 0) ? (
                  <Space>
                    {showEdit && <EditButton size="middle" className="pr-btn-edit">Chỉnh sửa</EditButton>}
                    {visibleActions.map((act) => (
                      <Button key={act.endpoint} type="primary" size="middle" danger={act.danger}
                        className={act.endpoint === "return-for-edit" ? "pr-btn-warning" : ""}
                        onClick={() => makeAction(act.endpoint, act.label)}
                      >
                        {act.label}
                      </Button>
                    ))}
                  </Space>
                ) : undefined
              }
            >
              <Descriptions column={{ xs: 1, sm: 2, lg: 2 }} layout="vertical" bordered size="middle"
                labelStyle={{ fontWeight: "bold", color: "#64748b" }} contentStyle={{ fontSize: 15 }}
              >
                <Descriptions.Item label="Mã Phiếu"><Text strong className="pr-text-emerald">{record?.Code}</Text></Descriptions.Item>
                <Descriptions.Item label="Tên Phiếu"><Text strong>{record?.Name || record?.Code || "—"}</Text></Descriptions.Item>
                <Descriptions.Item label="Đơn Vị Yêu Cầu"><Text strong>{deptName || record?.DepartmentId}</Text></Descriptions.Item>
                <Descriptions.Item label="Người Tạo"><Text strong>{creatorName}</Text></Descriptions.Item>
                <Descriptions.Item label="Tổng Tiền Đề Xuất">
                  <Text strong className="pr-text-teal" style={{ fontSize: 16 }}>{fmtVnd(record?.TotalProposedAmount)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Tiền Thực Tế">
                  <Text strong className="pr-text-teal" style={{ fontSize: 16 }}>
                    {record?.TotalActualAmount != null ? fmtVnd(record.TotalActualAmount) : "—"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Chênh Lệch">
                  {(() => {
                    const p = record?.TotalProposedAmount;
                    const a = record?.TotalActualAmount;
                    if (a == null) return <Text type="secondary">—</Text>;
                    const diff = (p ?? 0) - a;
                    return <Text strong className={diff >= 0 ? "pr-text-emerald" : "pr-text-danger"} style={{ fontSize: 16 }}>
                      {diff >= 0 ? "" : "-"}{fmtVnd(Math.abs(diff))}
                    </Text>;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">
                  {status != null && <StatusTag status={status} />}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày Tạo">
                  {record?.Created ? <DateField value={record.Created} format="DD/MM/YYYY - HH:mm" /> : "—"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {categoriesList.length > 0 && (
              <Card loading={isLoading} className="pr-card"
                title={<Space><CheckCircleOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Danh mục hàng hóa</Text></Space>}
                extra={<Text className="pr-text-secondary">Tổng đề xuất: <Text strong className="pr-text-emerald">{fmtVnd(record?.TotalProposedAmount)}</Text></Text>}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  {categoriesList.map((cat) => {
                    const catItems = cat.RequestItems ?? [];
                    const subtotal = catItems.reduce((s, i) => s + i.ProposedQuantity * i.UnitPrice, 0);
                    const quota = cat.Category?.AllowedQuota ?? cat.AllowedQuota ?? 0;
                    const diff = quota - subtotal;
                    return (
                      <Card key={cat.Id} size="small" className="pr-card"
                        title={<Text strong className="pr-text-emerald">{cat.Category?.Name ?? cat.Name}</Text>}
                        extra={
                          <Space size="middle" wrap>
                            <Text className="pr-text-secondary">Định mức: <Text strong>{fmtVnd(quota)}</Text></Text>
                            <Text className="pr-text-secondary">Tạm tính: <Text strong className="pr-text-emerald">{fmtVnd(subtotal)}</Text></Text>
                            <Text className="pr-text-secondary">Chênh lệch: <Text strong className={diff < 0 ? "pr-text-danger" : "pr-text-success"}>
                              {diff >= 0 ? "+" : ""}{fmtVnd(diff)}
                            </Text></Text>
                          </Space>
                        }
                      >
                        <Table dataSource={catItems} rowKey="Id" pagination={false} size="small"
                          columns={[
                            { title: "Sản phẩm", dataIndex: "ProductName", render: (val, i) => <Text strong>{i.Product?.Name ?? val}</Text> },
                            { title: "SL Đề xuất", dataIndex: "ProposedQuantity", align: "center" },
                            { title: "Đơn giá (₫)", align: "right", render: (_, item) => <Text>{(item.UnitPrice || 0).toLocaleString("vi-VN")}</Text> },
                            { title: "Thành tiền (₫)", align: "right", render: (_, item) => <Text strong className="pr-text-teal">{((item.ProposedQuantity ?? 0) * (item.UnitPrice ?? 0)).toLocaleString("vi-VN")}</Text> },
                          ]}
                        />
                      </Card>
                    );
                  })}
                </Space>
              </Card>
            )}
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <div className="pr-sticky-sidebar">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card loading={isLoading} className="pr-card"
                title={<Space><SwapOutlined className="pr-text-emerald" /><Text strong className="pr-text-emerald" style={{ fontSize: 16 }}>Tiến trình phê duyệt</Text></Space>}
              >
                <Flex vertical style={{ maxHeight: 420, overflowY: "auto", padding: "12px 4px 8px 16px" }}>
                  <ApprovalTimeline approvers={record?.Approvers ?? []} approvals={approvalList} />
                </Flex>
              </Card>

              <Card loading={isLoading} className="pr-card"
                title={<Text strong style={{ fontSize: 16 }}>Lịch sử thao tác</Text>}
              >
                {historyItems.length > 0 ? (
                  <Flex vertical style={{ maxHeight: 420, overflowY: "auto", padding: "12px 4px 8px 16px" }}>
                    <Timeline
                      items={historyItems.map((ap) => {
                        const act = ap.Action ?? "";
                        const isDanger = act.includes("Từ chối") || act.includes("Trả chỉnh sửa");
                        const config = getActionDisplay(act);
                        return {
                          color: isDanger ? "red" : "gray",
                          dot: isDanger
                            ? <CloseCircleFilled style={{ fontSize: 20, color: "#ef4444" }} />
                            : <CheckCircleFilled style={{ fontSize: 20, color: "#3b82f6" }} />,
                          children: (
                            <Card size="small" bordered
                              style={{ marginBottom: 16, background: "#ffffff", borderColor: "#e2e8f0", borderRadius: 8 }}
                              styles={{ body: { padding: "12px 16px" } }}
                            >
                              <Flex justify="space-between" align="flex-start" gap={8}>
                                <Space size={8} wrap>
                                  <Text strong style={{ fontSize: 14 }}>{ap.ApproverName || "Hệ thống"}</Text>
                                  <Tag color={config.color} bordered={false} style={{ margin: 0, fontWeight: 500 }}>{config.label}</Tag>
                                </Space>
                                {ap.Created && (
                                  <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                                    <DateField value={ap.Created} format="DD/MM - HH:mm" />
                                  </Text>
                                )}
                              </Flex>
                              {ap.Note && (
                                <div style={{ marginTop: 12, padding: "8px 12px", background: "#f8fafc", borderLeft: `2px solid ${isDanger ? "#ef4444" : "#cbd5e1"}`, borderRadius: "0 4px 4px 0" }}>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    <Text strong type={isDanger ? "danger" : "secondary"}>Ghi chú: </Text>
                                    {ap.Note}
                                  </Text>
                                </div>
                              )}
                            </Card>
                          ),
                        };
                      })}
                    />
                    {!showAllHistory && approvalList.length > 5 && (
                      <Flex justify="center" style={{ padding: "8px 0" }}>
                        <Button type="link" onClick={() => setShowAllHistory(true)}>
                          Xem thêm ({approvalList.length - 5} mục cũ hơn)
                        </Button>
                      </Flex>
                    )}
                    {showAllHistory && approvalList.length > 5 && (
                      <Flex justify="center" style={{ padding: "8px 0" }}>
                        <Button type="link" onClick={() => setShowAllHistory(false)}>Thu gọn</Button>
                      </Flex>
                    )}
                  </Flex>
                ) : (
                  <Text type="secondary">Chưa có lịch sử thao tác</Text>
                )}
              </Card>
            </Space>
          </div>
        </Col>
      </Row>

      <Modal title={actionLabel} open={modalVisible}
        onOk={executeTrigger} onCancel={() => setModalVisible(false)}
        confirmLoading={isMutating}
        okButtonProps={{ danger: actionLabel.includes("Từ chối") }}
      >
        <Paragraph>Xác nhận "{actionLabel}"?</Paragraph>
        <Input.TextArea rows={3} placeholder="Ghi chú (bắt buộc nếu từ chối)..." value={actionNote}
          onChange={(e) => setActionNote(e.target.value)}
        />
      </Modal>

      <ConfirmOrderModal
        open={confirmModalVisible}
        onOk={handleBulkConfirm}
        onCancel={() => { setConfirmModalVisible(false); setActionNote(""); }}
        loading={isMutating}
        categories={categoriesList}
        localQty={localQty}
        onQtyChange={handleQtyChange}
        note={actionNote}
        onNoteChange={setActionNote}
        totalProposedAmount={record?.TotalProposedAmount}
      />
    </Show>
  );
};
