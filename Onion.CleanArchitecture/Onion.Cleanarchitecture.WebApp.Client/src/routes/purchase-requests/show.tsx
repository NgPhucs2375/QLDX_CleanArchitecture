import { useShow, useCustomMutation, useApiUrl, useOne } from "@refinedev/core";
import { IPurchaseRequest } from "./types";
import { DateField, Show } from "@refinedev/antd";
import { Typography, Tag, Button, Space, Modal, App, Card, Table, InputNumber, Input, Timeline, Row, Col, Descriptions, Alert } from "antd";
import { CheckOutlined, ShoppingCartOutlined, InfoCircleOutlined, CheckCircleOutlined, CheckCircleFilled, CloseCircleFilled, ClockCircleOutlined } from "@ant-design/icons";import { useState, useEffect, useMemo } from "react";
import "../../assets/purchase-request.css";

const { Title, Text, Paragraph } = Typography;
const fmtVnd = (n: number) => (n || 0).toLocaleString("vi-VN") + " ₫";
interface IPRItem { Id: number; ProductId: number; ProductName: string; ProposedQuantity: number; UnitPrice: number; TotalAmount: number; ActualQuantity: number; }

const statusMap: Record<number, { label: string; color: string }> = { 1: { label: "Bản nháp", color: "default" }, 2: { label: "Chờ trưởng đơn vị duyệt", color: "volcano" }, 3: { label: "Chờ kiểm soát duyệt", color: "geekblue" }, 4: { label: "Trả chỉnh sửa", color: "warning" }, 5: { label: "Chờ xác nhận đơn hàng", color: "purple" }, 6: { label: "Hoàn thành", color: "cyan" }, 7: { label: "Từ chối", color: "red" }, 8: { label: "Từ chối", color: "red" } };
const availableActions: Record<number, { label: string; endpoint: string; classColor: string; icon?: React.ReactNode }[]> = {
  1: [{ label: "Gửi duyệt", endpoint: "submit", classColor: "pr-btn-geekblue" }],
  2: [{ label: "Trưởng đơn vị duyệt", endpoint: "approve-department", classColor: "pr-btn-cyan" }, { label: "Từ chối", endpoint: "reject", classColor: "pr-text-danger" }],
  3: [{ label: "Phê duyệt", endpoint: "approve", classColor: "pr-btn-cyan" }, { label: "Từ chối", endpoint: "reject", classColor: "pr-text-danger" }, { label: "Trả về chỉnh sửa", endpoint: "return-for-edit", classColor: "pr-btn-volcano" }],
  4: [{ label: "Gửi duyệt lại", endpoint: "submit", classColor: "pr-btn-geekblue" }],
  5: [{ label: "Hoàn tất đơn hàng", endpoint: "confirm-order", classColor: "pr-btn-purple", icon: <ShoppingCartOutlined /> }],
};

export const ShowPurchaseRequest = () => {
  const { queryResult: { isLoading, data, refetch } } = useShow<IPurchaseRequest>();
  const { mutate, isLoading: isMutating } = useCustomMutation();
  const apiUrl = useApiUrl();
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [actionEndpoint, setActionEndpoint] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [actionNote, setActionNote] = useState("");

  const record = data?.data as any;
  const status = record?.Status;
  const actions = status != null ? availableActions[status] : undefined;

  const { data: deptData } = useOne({ resource: "departments", id: record?.DepartmentId ?? "", queryOptions: { enabled: !!record?.DepartmentId } });
  
  const categories = useMemo(() => record?.Categories || record?.categories || record?.RequestCategories || record?.requestCategories || [], [record]);
  const approvers = useMemo(() => record?.Approvers || record?.approvers || [], [record]);
  const approvals = useMemo(() => record?.Approvals || record?.approvals || [], [record]);

  const [localQty, setLocalQty] = useState<Record<number, number>>({});
  const [isPristine, setIsPristine] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const initialQty: Record<number, number> = {};
    const pristineState: Record<number, boolean> = {};
    categories.forEach((cat: any) => {
        (cat.RequestItems || []).forEach((item: any) => {
            initialQty[item.Id || item.id] = item.ActualQuantity > 0 ? item.ActualQuantity : item.ProposedQuantity;
            pristineState[item.Id || item.id] = true;
        });
    });
    setLocalQty(initialQty); setIsPristine(pristineState);
  }, [categories]);

  const handleSaveRow = (item: IPRItem) => {
    const qty = localQty[item.Id];
    mutate({ url: `${apiUrl}/purchase-request-items/${item.Id}/update-actual-quantity`, method: "put", values: { Id: item.Id, ActualQuantity: qty } }, { onSuccess: () => { message.success(`Đã cập nhật`); setIsPristine(prev => ({ ...prev, [item.Id]: true })); refetch(); } });
  };

  const executeTrigger = () => {
    let finalAction = actionEndpoint;
    if (actionEndpoint === "return-for-edit") finalAction = "return";
    if (actionEndpoint === "approve-department") finalAction = "approve";
    if (actionEndpoint === "confirm-order") finalAction = "confirm";

    mutate({ url: `${apiUrl}/purchase-requests/${record!.Id}/trigger`, method: "post", values: { id: record!.Id, action: finalAction, note: actionNote } }, { onSuccess: () => { message.success(`Thành công!`); setModalVisible(false); refetch(); } });
  };

  return (
    <Show isLoading={isLoading} title={<Title level={3} className="pr-m-0 pr-text-emerald">Chi tiết Phiếu Đề Xuất</Title>}>
      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI: THÔNG TIN VÀ DANH MỤC */}
        <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" className="pr-w-100">
                
{/* Thông tin quy chiếu có kèm nút Action */}
                <Card loading={isLoading} className="pr-card pr-card-emerald" 
                    title={<Space><InfoCircleOutlined className="pr-text-emerald" style={{ fontSize: '20px' }} /><Text strong className="pr-text-emerald" style={{ fontSize: '18px' }}>Thông tin quy chiếu</Text></Space>} 
                    extra={actions && actions.length > 0 && (
                        <Space>
                            {actions.map((act) => (
                                <Button key={act.endpoint} type="primary" size="middle" danger={act.classColor === "pr-text-danger"} icon={act.icon} onClick={() => { setActionEndpoint(act.endpoint); setActionLabel(act.label); setModalVisible(true); }}>
                                    {act.label}
                                </Button>
                            ))}
                        </Space>
                    )}
                >
                    <Descriptions column={{ xs: 1, sm: 2, lg: 2 }} layout="vertical" bordered size="middle" labelStyle={{ fontWeight: 'bold', color: '#64748b' }} contentStyle={{ fontSize: '15px' }}>
                        <Descriptions.Item label="Mã Phiếu">
                            <Text strong className="pr-text-emerald">{record?.Code}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Phiếu">
                            <Text strong>{record?.Name || record?.Code || "—"}</Text>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Đơn Vị Yêu Cầu">
                            <Text strong>{deptData?.data?.Name || record?.DepartmentId}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Người Tạo">
                            <Text>{record?.CreatedBy}</Text>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Tổng Tiền Đề Xuất">
                            <Text strong className="pr-text-emerald">{fmtVnd(record?.TotalProposedAmount)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng Tiền Thực Tế">
                            <Text strong className="pr-text-teal">{fmtVnd(record?.TotalActualAmount)}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng Thái">
                            {status != null && <Tag color={statusMap[status]?.color} style={{ padding: '4px 12px', fontSize: '14px', borderRadius: '4px' }}>{statusMap[status]?.label}</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Tạo">
                            {record?.Created ? <DateField value={record?.Created} format="DD/MM/YYYY - HH:mm" /> : "—"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
                {/* Danh sách các Danh mục */}
                {categories.map((cat: any) => {
                    const catItems = cat.RequestItems || [];
                    const catTotalProposed = catItems.reduce((sum: number, i: any) => sum + ((i.ProposedQuantity || 0) * (i.UnitPrice || 0)), 0);
                    
                    return (
                    <Card loading={isLoading} key={cat.Id || cat.id} className="pr-card" 
                        title={<Space><CheckCircleOutlined className="pr-text-emerald"/><Text strong>{cat.Name || cat.name}</Text></Space>}
                        extra={<Text className="pr-text-secondary">Đề xuất: <Text strong className="pr-text-emerald">{fmtVnd(catTotalProposed)}</Text></Text>}
                    >
                        <Table dataSource={catItems} rowKey={(i) => i.Id || i.id} pagination={false} scroll={{ x: 'max-content' }} columns={[
                            { title: "Sản phẩm", dataIndex: "ProductName", render: (val: string, i: any) => <Text strong>{i.Product?.Name || i.product?.name || val}</Text> },
                            { title: "SL Đề xuất", dataIndex: ["ProposedQuantity"], align: "center" as const },
                            { title: "Đơn giá", dataIndex: ["UnitPrice"], align: "right" as const, render: (val) => fmtVnd(val) },
                            { title: "SL Thực tế", align: "center" as const, width: 150, render: (_: any, item: any) => {
                                const id = item.Id || item.id;
                                if (status !== 6) return <Text strong className="pr-text-teal">{item.ActualQuantity || "—"}</Text>;
                                return (
                                <Space.Compact className="pr-w-100 pr-flex-center">
                                    <InputNumber min={0} value={localQty[id]} onChange={(val) => { setLocalQty(prev => ({ ...prev, [id]: val || 0 })); setIsPristine(prev => ({ ...prev, [id]: false })); }} className="pr-input-qty" />
                                    <Button disabled={isPristine[id]} onClick={() => handleSaveRow(item)} icon={<CheckOutlined />} />
                                </Space.Compact>
                                );
                            }},
                            { title: "Thành tiền", align: "right" as const, render: (_: any, item: any) => <Text strong>{fmtVnd((localQty[item.Id || item.id] ?? 0) * (item.UnitPrice || 0))}</Text> }
                        ]} />
                    </Card>
                    );
                })}
            </Space>
        </Col>

        {/* CỘT PHẢI: LUỒNG DUYỆT & LỊCH SỬ */}
{/* CỘT PHẢI: LUỒNG DUYỆT & LỊCH SỬ */}
        <Col xs={24} lg={8}>
            <div className="pr-sticky-sidebar">
                <Space direction="vertical" size="large" className="pr-w-100">
                    
                    {/* Tiến trình phê duyệt */}
                    <Card loading={isLoading} className="pr-card pr-bg-emerald-light pr-border-emerald" 
                        title={<Text strong className="pr-text-emerald" style={{ fontSize: '18px' }}>Tiến trình phê duyệt</Text>}>
                        {approvers.length > 0 ? (
                            <Timeline items={approvers.map((ap: any) => {
                                const isApproved = ap.Status === 2;
                                const isRejected = ap.Status === 3;
                                
                                return {
                                    color: isApproved ? "green" : isRejected ? "red" : "gray",
                                    dot: isApproved ? <CheckCircleFilled style={{ fontSize: '20px', color: '#10b981' }} /> : 
                                         isRejected ? <CloseCircleFilled style={{ fontSize: '20px', color: '#ef4444' }} /> : 
                                         <ClockCircleOutlined style={{ fontSize: '20px', color: '#94a3b8' }} />,
                                    children: (
                                        <div style={{ paddingBottom: '16px' }}>
                                            <Text strong style={{ fontSize: '16px', color: isApproved ? '#059669' : (isRejected ? '#dc2626' : '#334155') }}>
                                                {ap.ApproverName || ap.ApproverId || "Người duyệt"}
                                            </Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '14px' }}>Vai trò: Bước {ap.StepOrder}</Text>
                                            <div style={{ marginTop: '8px' }}>
                                                {isApproved && <Tag color="success" style={{ fontSize: '13px' }}>Đã duyệt</Tag>}
                                                {isRejected && <Tag color="error" style={{ fontSize: '13px' }}>Từ chối</Tag>}
                                                {ap.Status === 1 && <Tag color="default" style={{ fontSize: '13px' }}>Đang chờ</Tag>}
                                            </div>
                                        </div>
                                    )
                                };
                            })} />
                        ) : <Text type="secondary">Chưa có luồng duyệt</Text>}
                    </Card>

                    {/* Lịch sử thao tác */}
                    <Card loading={isLoading} className="pr-card" 
                        title={<Text strong style={{ fontSize: '18px' }}>Lịch sử thao tác</Text>}>
                        {approvals.length > 0 ? (
                            <Timeline items={approvals.map((ap: any) => {
                                const isDanger = ap.Action === "reject" || ap.Action === "return";
                                return {
                                    color: isDanger ? "red" : "blue",
                                    children: (
                                        <div style={{ paddingBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text strong style={{ fontSize: '15px' }}>{ap.ApproverName || "Hệ thống"}</Text>
                                                {ap.Created && (
                                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                                        <DateField value={ap.Created} format="DD/MM - HH:mm" />
                                                    </Text>
                                                )}
                                            </div>
                                            <div style={{ margin: '4px 0 8px 0' }}>
                                                <Tag color={isDanger ? "red" : "blue"}>{ap.Action}</Tag>
                                            </div>
                                            {ap.Note && (
                                                <Alert 
                                                    message={<span style={{ fontSize: '14px' }}>{ap.Note}</span>} 
                                                    type={isDanger ? "error" : "info"} 
                                                    showIcon 
                                                    style={{ padding: '6px 10px' }} 
                                                />
                                            )}
                                        </div>
                                    )
                                };
                            })} />
                        ) : <Text type="secondary">Chưa có lịch sử</Text>}
                    </Card>

                </Space>
            </div>
        </Col>
      </Row>

      <Modal title={actionLabel} open={modalVisible} onOk={executeTrigger} onCancel={() => setModalVisible(false)} confirmLoading={isMutating} okButtonProps={{ danger: actionEndpoint === "reject" }}>
        <Paragraph>Xác nhận "{actionLabel}"?</Paragraph>
        <Input.TextArea rows={3} placeholder="Ghi chú (bắt buộc nếu từ chối)..." value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
      </Modal>
    </Show>
  );
};