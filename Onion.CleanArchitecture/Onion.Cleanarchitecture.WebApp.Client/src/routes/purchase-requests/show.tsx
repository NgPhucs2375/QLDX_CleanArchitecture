import { useShow, useCustomMutation, useApiUrl, useOne, useMany, useGetIdentity } from "@refinedev/core";
import { IPurchaseRequest, IPurchaseRequestApprover } from "./types";
import { DateField, Show, EditButton } from "@refinedev/antd";
import { Typography, Tag, Button, Space, Modal, App, Card, Table, InputNumber, Input, Timeline, Row, Col, Descriptions, Alert, Flex } from "antd";
import { ShoppingCartOutlined, InfoCircleOutlined, CheckCircleOutlined, CheckCircleFilled, CloseCircleFilled, CloseCircleOutlined, ClockCircleOutlined, RollbackOutlined, SendOutlined, SwapOutlined } from "@ant-design/icons";import { useState, useEffect, useMemo } from "react";
import "../../assets/purchase-request.css";

const { Title, Text, Paragraph } = Typography;
const fmtVnd = (n?: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

interface ILocalCategory {
  Id?: number; id?: number;
  Name?: string; name?: string;
  Category?: { Name?: string; name?: string; AllowedQuota?: number; allowedQuota?: number };
  category?: { Name?: string; name?: string; AllowedQuota?: number; allowedQuota?: number };
  AllowedQuota?: number; allowedQuota?: number;
  RequestItems?: ILocalItem[]; requestItems?: ILocalItem[];
}
interface ILocalItem {
  id: number;
  Id?: number;
  ProductId?: number; productId?: number;
  ProductName?: string; productName?: string;
  ProposedQuantity?: number; proposedQuantity?: number;
  UnitPrice?: number; unitPrice?: number;
  TotalAmount?: number; totalAmount?: number;
  ActualQuantity?: number; actualQuantity?: number;
  Product?: { Name?: string; name?: string };
  product?: { Name?: string; name?: string };
}
interface ILocalApproval {
  Id?: number; id?: number;
  ApproverId?: string; approverId?: string;
  ApproverName?: string; approverName?: string;
  Action?: string; action?: string;
  Note?: string; note?: string;
  Created?: string; created?: string;
}
interface ILocalPurchaseRequest extends IPurchaseRequest {
  Name?: string;
  name?: string;
  Reason?: string;
  reason?: string;
  ContactName?: string;
  contactName?: string;
  ContactPhone?: string;
  contactPhone?: string;
  ShippingAddress?: string;
  shippingAddress?: string;
  totalActualAmount?: number;
  totalProposedAmount?: number;
  Categories?: ILocalCategory[];
  categories?: ILocalCategory[];
  RequestCategories?: ILocalCategory[];
  requestCategories?: ILocalCategory[];
  approvers?: ILocalApprover[];
  approvals?: ILocalApproval[];
}
interface ILocalApprover extends IPurchaseRequestApprover {
  approverId?: string;
  approverName?: string;
  role?: number;
  stepOrder?: number;
  status?: number;
}

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Bản nháp", color: "default" },
  2: { label: "Chờ Trưởng đơn vị duyệt", color: "processing" },
  3: { label: "Chờ Kiểm soát duyệt", color: "geekblue" },
  4: { label: "Trả về chỉnh sửa", color: "warning" },
  5: { label: "Chờ xác nhận đơn hàng", color: "purple" },
  6: { label: "Hoàn thành", color: "success" },
  7: { label: "Từ chối", color: "error" },
  8: { label: "Từ chối", color: "error" }
};
const actionIcons: Record<string, React.ReactNode> = {
  submit: <SendOutlined />, "approve-department": <CheckCircleOutlined />, reject: <CloseCircleOutlined />,
  approve: <CheckCircleOutlined />, "return-for-edit": <RollbackOutlined />, "confirm-order": <ShoppingCartOutlined />,
};

const actionLabelMap: Record<string, string> = {
  submit: "Gửi duyệt", "approve-department": "Duyệt", approve: "Phê duyệt", reject: "Từ chối",
  "return-for-edit": "Trả về", "confirm-order": "Hoàn tất",
};

const actionColors: Record<string, string> = {
  submit: "geekblue", 
  "approve-department": "success", // Green
  approve: "success",             // Green
  reject: "error",               // Red
  "return-for-edit": "warning",  // Amber
  return: "warning",
  "confirm-order": "purple", 
  confirm: "purple",
};

export const ShowPurchaseRequest = () => {
  const { queryResult: { isLoading, data, refetch } } = useShow<ILocalPurchaseRequest>();
  const { mutate, isLoading: isMutating } = useCustomMutation();
  const apiUrl = useApiUrl();
  const { message } = App.useApp();
  const { data: identity } = useGetIdentity<{ Uid: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionEndpoint, setActionEndpoint] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const record = data?.data;
  const status = record?.Status;

  const userId = identity?.Uid;
  const isCreator = userId && record?.CreatedBy && String(userId) === String(record.CreatedBy);
  const showEdit = !!isCreator && (status === 1 || status === 4);

  const { data: deptData } = useOne({ resource: "departments", id: record?.DepartmentId ?? "", queryOptions: { enabled: !!record?.DepartmentId } });

  const { data: creatorData } = useMany({ resource: "users", ids: record?.CreatedBy ? [record.CreatedBy] : [], queryOptions: { enabled: !!record?.CreatedBy } });

  const categories = useMemo(() => record?.Categories || record?.categories || record?.RequestCategories || record?.requestCategories || [], [record]) as ILocalCategory[];
  const approvers = useMemo(() => (record?.Approvers || record?.approvers || []) as ILocalApprover[], [record]);
  const approvals = useMemo(() => (record?.Approvals || record?.approvals || []) as ILocalApproval[], [record]);

  const [localQty, setLocalQty] = useState<Record<number, number>>({});

  useEffect(() => {
    const initialQty: Record<number, number> = {};
    categories.forEach((cat) => {
        ((cat.RequestItems || cat.requestItems) || []).forEach((item) => {
            initialQty[item.Id ?? item.id] = (item.ActualQuantity ?? 0) > 0 ? (item.ActualQuantity ?? 0) : (item.ProposedQuantity ?? 0);
        });
    });
    setLocalQty(initialQty);
  }, [categories]);

  const creatorUser = (creatorData?.data as Array<Record<string, unknown>>)?.find((u) => u.Id === record?.CreatedBy || u.id === record?.CreatedBy) as Record<string, unknown> | undefined;
  const creatorName = (creatorUser?.UserName ?? creatorUser?.userName ?? creatorUser?.Name ?? creatorUser?.name) as string | undefined || record?.CreatedBy;

  const currentApprover = useMemo(() => {
    if (!identity?.Uid || !approvers.length) return null;
    return approvers.find((ap) => String(ap.ApproverId ?? ap.approverId ?? "") === String(identity.Uid)) ?? null;
  }, [identity, approvers]);

  const visibleActions = useMemo(() => {
    if (status == null) return [];
    const userId = identity?.Uid;
    const isCreator = userId && record?.CreatedBy && String(userId) === String(record.CreatedBy);

    const allActions = [
      { label: "Gửi duyệt", endpoint: "submit", type: "primary" as const, icon: actionIcons.submit },
      { label: "Từ chối", endpoint: "reject", type: "primary" as const, danger: true, icon: actionIcons.reject },
      { label: "Duyệt", endpoint: "approve-department", type: "primary" as const, icon: actionIcons["approve-department"] },
      { label: "Trả về chỉnh sửa", endpoint: "return-for-edit", type: "primary" as const, icon: actionIcons["return-for-edit"] },
      { label: "Phê duyệt", endpoint: "approve", type: "primary" as const, icon: actionIcons.approve },
      { label: "Hoàn tất đơn hàng", endpoint: "confirm-order", type: "primary" as const, icon: actionIcons["confirm-order"] },
    ];


    // Sửa thành Dictionary
    const canAct = currentApprover && (currentApprover.Status === 0 || currentApprover.Status === 1);

    const isStep1 = currentApprover?.StepOrder === 1 || currentApprover?.stepOrder === 1;
    const isStep2 = currentApprover?.StepOrder === 2 || currentApprover?.stepOrder === 2;

    const roleConditions: Record<string, boolean> = {
      "submit": !!isCreator && (status === 1 || status === 4),
      "approve-department": !!canAct && isStep1,
      "reject": (!!canAct && isStep1) || (!!canAct && isStep2),
      "approve": !!canAct && isStep2,
      "return-for-edit": !!canAct && isStep2,
      "confirm-order": !!isCreator && status === 5,
    };

    return allActions.filter((a) => roleConditions[a.endpoint] === true);
  }, [status, identity, currentApprover, record?.CreatedBy]);

  const sortedApprovers = useMemo(() => {
    return [...approvers].sort((a, b) => (a.StepOrder || a.stepOrder || 0) - (b.StepOrder || b.stepOrder || 0));
  }, [approvers]);

  const getApprovalAction = (approverId: string) => {
    return approvals.find((ap) =>
      String(ap.ApproverId || ap.approverId) === String(approverId)
    );
  };

  const handleBulkConfirm = () => {
    const items = categories.flatMap((cat) => (cat.RequestItems || cat.requestItems) || [])
      .filter((item) => {
        const id = item.Id ?? item.id;
        return localQty[id] !== undefined && localQty[id] !== item.ActualQuantity;
      })
      .map((item) => ({
        id: item.Id ?? item.id,
        actualQuantity: localQty[item.Id ?? item.id] ?? item.ProposedQuantity,
      }));

    if (items.length === 0) {
      message.warning("Không có thay đổi số lượng nào!");
      return;
    }

    mutate({
      url: `${apiUrl}/purchase-request-items/${record!.Id}/update-true-quantity-items`,
      method: "put",
      values: { purchaseRequestId: record!.Id, actualQuantityItems: items }
    }, {
      onSuccess: () => {
        mutate({
          url: `${apiUrl}/purchase-requests/${record!.Id}/trigger`,
          method: "post",
          values: { id: record!.Id, action: "confirm", note: actionNote }
        }, {
          onSuccess: () => {
            message.success("Hoàn tất đơn hàng thành công!");
            setConfirmModalVisible(false);
            setActionNote("");
            refetch();
          }
        });
      }
    });
  };

  const executeTrigger = () => {
    let finalAction = actionEndpoint;
    if (actionEndpoint === "return-for-edit") finalAction = "return";
    if (actionEndpoint === "approve-department") finalAction = "approve";
    if (actionEndpoint === "confirm-order") finalAction = "confirm";

    mutate({ url: `${apiUrl}/purchase-requests/${record!.Id}/trigger`, method: "post", values: { id: record!.Id, action: finalAction, note: actionNote } }, { onSuccess: () => { message.success(`Thành công!`); setModalVisible(false); refetch(); } });
  };

  return (
    <Show isLoading={isLoading} title={<Title level={3} className="pr-m-0 pr-text-emerald">Chi tiết Phiếu Đề Xuất</Title>} headerButtons={<></>}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" className="pr-w-100">

                <Card loading={isLoading} className="pr-card pr-card-emerald"
                    title={<Space><InfoCircleOutlined className="pr-text-emerald" style={{ fontSize: '20px' }} />
                    <Text strong className="pr-text-emerald" style={{ fontSize: '18px' }}>Thông tin quy chiếu</Text></Space>}
                    extra={(showEdit || visibleActions.length > 0) ? (
                        <Space>
                            {showEdit && <EditButton size="middle" className="pr-btn-edit">Chỉnh sửa</EditButton>}
                            {visibleActions.map((act) => (
                                <Button key={act.endpoint} type="primary" size="middle" danger={act.danger === true} icon={act.icon} className={act.endpoint === "return-for-edit" ? "pr-btn-warning" : ""} onClick={() => { if (act.endpoint === "confirm-order") { setConfirmModalVisible(true); } else { setActionEndpoint(act.endpoint); setActionLabel(act.label); setModalVisible(true); } }}>
                                    {act.label}
                                </Button>
                            ))}
                        </Space>
                    ) : undefined}
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
                            <Text strong>{creatorName}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng Tiền Đề Xuất">
                            <Text strong className="pr-text-teal" style={{fontSize: '16px'}}>{fmtVnd(record?.TotalProposedAmount)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng Tiền Thực Tế">
                            <Text className="pr-text-teal" strong style={{fontSize: '16px'}}>
                              {record?.TotalActualAmount != null ? fmtVnd(record.TotalActualAmount) : "—"}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng Chênh Lệch">
                            {(() => {
                                const proposed = record?.TotalProposedAmount;
                                const actual = record?.TotalActualAmount;
                                if (actual == null) return <Text type="secondary">—</Text>;
                                const diff = proposed - actual;
                                return <Text strong className={diff >= 0 ? "pr-text-emerald" : "pr-text-danger"} style={{fontSize: '16px'}}>{diff >= 0 ? "" : "-"}{fmtVnd(Math.abs(diff))}</Text>;
                            })()}
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng Thái">
                            {status != null && <Tag color={statusMap[status]?.color} style={{ padding: '4px 12px', fontSize: '14px', borderRadius: '4px' }}>{statusMap[status]?.label}</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Tạo">
                            {record?.Created ? <DateField value={record?.Created} format="DD/MM/YYYY - HH:mm" /> : "—"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {categories.length > 0 && (
                  <Card loading={isLoading} className="pr-card"
                    title={<Space><CheckCircleOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Danh mục hàng hóa</Text></Space>}
                    extra={<Text className="pr-text-secondary">Tổng đề xuất: <Text strong className="pr-text-emerald">{fmtVnd(record?.TotalProposedAmount)}</Text></Text>}
                  >
                    <Space direction="vertical" size="middle" className="pr-w-100">
                      {categories.map((cat) => {
                        const catItems = (cat.RequestItems || cat.requestItems) || [];
                        const subtotal = catItems.reduce((sum, i) => sum + ((i.ProposedQuantity || 0) * (i.UnitPrice || 0)), 0);
                        const quota = cat.AllowedQuota ?? cat.allowedQuota ?? 0;
                        const diff = quota - subtotal;

                        return (
                          <Card key={cat.Id ?? cat.id} size="small" className="pr-card"
                            title={<Text strong className="pr-text-emerald">{cat.Category?.Name || cat.category?.name || cat.Name || cat.name || "Danh mục"}</Text>}
                            extra={
                              <Space size="middle" wrap>
                                <Text className="pr-text-secondary">Định mức: <Text strong>{fmtVnd(quota)}</Text></Text>
                                <Text className="pr-text-secondary">Tạm tính: <Text strong className="pr-text-emerald">{fmtVnd(subtotal)}</Text></Text>
                                <Text className="pr-text-secondary">Chênh lệch: <Text strong className={diff < 0 ? 'pr-text-danger' : 'pr-text-success'}>{diff >= 0 ? '+' : ''}{fmtVnd(diff)}</Text></Text>
                              </Space>
                            }
                          >
                            <Table dataSource={catItems} rowKey={(i) => i.Id ?? i.id} pagination={false} size="small"
                              columns={[
                                { title: "Sản phẩm", dataIndex: "ProductName", render: (val, i) => <Text strong>{i.Product?.Name || i.product?.name || val}</Text> },
                                { title: "SL Đề xuất", dataIndex: "ProposedQuantity", align: "center" as const },
                                { title: "Đơn giá (₫)", align: "right" as const, render: (_, item) => <Text>{(item.UnitPrice || 0).toLocaleString("vi-VN")}</Text> },
                                { title: "Thành tiền (₫)", align: "right" as const, render: (_, item) => <Text strong className="pr-text-teal">{((item.ProposedQuantity ?? 0) * (item.UnitPrice ?? 0)).toLocaleString("vi-VN")}</Text> },
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
                <Space direction="vertical" size="large" className="pr-w-100">

                    <Card 
                      loading={isLoading} 
                      className="pr-card"
                      title={
                        <Space>
                          <SwapOutlined className="pr-text-emerald" />
                          <Text strong className="pr-text-emerald" style={{ fontSize: '16px' }}>
                            Tiến trình phê duyệt
                          </Text>
                        </Space>
                      }
                    >
                      {sortedApprovers.length > 0 ? (
                        <Flex vertical style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 4px 8px 16px' }}>
                          <Timeline 
                            className="pr-timeline-bold"
                            items={sortedApprovers.map((ap) => {
                              const apId = ap.ApproverId ?? ap.approverId ?? "";
                              const apName = ap.ApproverName ?? ap.approverName ?? apId;
                              const apRole = ap.Role ?? ap.role ?? (ap.StepOrder === 1 ? "Trưởng đơn vị" : "Kiểm soát");
                              
                              const isApproved = ap.Status === 2;
                              const isRejected = ap.Status === 3;
                              const isPending = ap.Status === 0 || ap.Status === 1;
                              
                              const approvalAction = getApprovalAction(apId);
                              const actionVal = (approvalAction?.Action ?? approvalAction?.action) || "";
                              
                              const timelineColor = isApproved ? "green" : isRejected ? "red" : "gray";
                              const timelineDot = isApproved ? (
                                <CheckCircleFilled style={{ fontSize: '22px', color: '#10b981' }} />
                              ) : isRejected ? (
                                <CloseCircleFilled style={{ fontSize: '22px', color: '#ef4444' }} />
                              ) : (
                                <ClockCircleOutlined style={{ fontSize: '22px', color: '#94a3b8' }} />
                              );

                              return {
                                color: timelineColor,
                                dot: timelineDot,
                                className: `pr-line-${timelineColor}`,
                                children: (
                                  <Card
                                    size="small"
                                    bordered={true}
                                    style={{
                                      marginBottom: 16,
                                      background: '#ffffff', // Đưa nền về trắng sạch sẽ
                                      border: '1px solid #e2e8f0', // Viền xám nhạt toàn cục
                                      borderLeft: isApproved ? '4px solid #10b981' : isRejected ? '4px solid #ef4444' : '4px solid #cbd5e1', // Điểm nhấn viền trái theo trạng thái
                                      borderRadius: 8,
                                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                                    }}
                                    styles={{ body: { padding: '14px 16px' } }}
                                  >
                                    {/* Header: Vai trò & Tên */}
                                    <Flex justify="space-between" align="flex-start" style={{ marginBottom: 4 }}>
                                      <Space size={8} wrap>
                                        <Tag 
                                          /* Dùng màu Processing (Xanh lam) cố định cho chức danh để tránh loạn màu */
                                          color="processing" 
                                          bordered={false}
                                          style={{ margin: 0, fontWeight: 500 }}
                                        >
                                          {apRole}
                                        </Tag>
                                        <Text strong style={{ fontSize: 14 }}>
                                          {apName}
                                        </Text>
                                      </Space>
                                    </Flex>

                                    {/* Body: Hành động & Thời gian */}
                                    {approvalAction && (
                                      <Space style={{ marginTop: 8 }}>
                                        <Tag color={actionColors[actionVal] || "default"} bordered={false} style={{ fontSize: 12, fontWeight: 500 }}>
                                          {actionLabelMap[actionVal] || actionVal}
                                        </Tag>
                                        {approvalAction.Created && (
                                          <Text type="secondary" style={{ fontSize: 12 }}>
                                            <DateField value={approvalAction.Created} format="DD/MM HH:mm" />
                                          </Text>
                                        )}
                                      </Space>
                                    )}

                                    {/* Status: Đang chờ */}
                                    {isPending && (
                                      <Text type="secondary" italic style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
                                        Đang chờ xử lý...
                                      </Text>
                                    )}

                                    {/* Footer: Ghi chú */}
                                    {approvalAction?.Note && (
                                      <div style={{ 
                                        marginTop: 12, 
                                        padding: '8px 12px', 
                                        background: isRejected ? '#fef2f2' : '#f8fafc', 
                                        borderLeft: `2px solid ${isRejected ? '#fca5a5' : '#cbd5e1'}`,
                                        borderRadius: '0 4px 4px 0'
                                      }}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                          <Text strong type={isRejected ? "danger" : "secondary"}>Ghi chú: </Text> 
                                          {approvalAction.Note}
                                        </Text>
                                      </div>
                                    )}
                                  </Card>
                                )
                              };
                            })} 
                          />
                        </Flex>
                      ) : (
                        <Text type="secondary">Chưa có luồng duyệt</Text>
                      )}
                    </Card>
                    <Card 
                      loading={isLoading} 
                      className="pr-card"
                      title={<Text strong style={{ fontSize: '16px' }}>Lịch sử thao tác</Text>}
                    >
                      {approvals.length > 0 ? (
                        <Flex vertical style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 4px 8px 16px' }}>
                          <Timeline 
                            className="pr-timeline-bold"
                            items={[...approvals].reverse().slice(0, showAllHistory ? undefined : 5).map((ap) => {
                              const act = ap.Action || ap.action || "";
                              const isDanger = act === "reject" || act === "return" || act === "rejected";
                              const actLabel = actionLabelMap[act] || act;
                              
                              return {
                                color: isDanger ? 'red' : 'gray', // Màu đường line trung tính hoặc đỏ nếu từ chối
                                dot: isDanger 
                                  ? <CloseCircleFilled style={{ fontSize: '20px', color: '#ef4444' }} />
                                  : <CheckCircleFilled style={{ fontSize: '20px', color: '#3b82f6' }} />,
                                
                                children: (
                                  <Card
                                    size="small"
                                    bordered={true}
                                    style={{
                                      marginBottom: 16,
                                      background: '#ffffff', // Nền trắng sạch sẽ
                                      borderColor: '#e2e8f0', // Viền xám trung tính
                                      borderRadius: 8,
                                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                                    }}
                                    styles={{ body: { padding: '12px 16px' } }}
                                  >
                                    <Flex justify="space-between" align="flex-start" gap={8}>
                                      <Space size={8} wrap>
                                        <Text strong style={{ fontSize: 14, wordBreak: 'break-word' }}>
                                          {ap.ApproverName || ap.approverName || "Hệ thống"}
                                        </Text>
                                        <Tag 
                                          color={isDanger ? "error" : "processing"} 
                                          bordered={false}
                                          style={{ margin: 0, fontWeight: 500 }}
                                        >
                                          {actLabel}
                                        </Tag>
                                      </Space>
                                      
                                      {ap.Created && (
                                        <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                                          <DateField value={ap.Created} format="DD/MM - HH:mm" />
                                        </Text>
                                      )}
                                    </Flex>

                                    {/* Ghi chú được thiết kế lại, bỏ <Alert> nặng nề */}
                                    {ap.Note && (
                                      <Flex 
                                        vertical 
                                        style={{ 
                                          marginTop: 12, 
                                          padding: '8px 12px', 
                                          background: '#f8fafc', // Xám siêu nhạt
                                          borderLeft: `2px solid ${isDanger ? '#ef4444' : '#cbd5e1'}`, // Vạch màu phân biệt
                                          borderRadius: '0 4px 4px 0' 
                                        }}
                                      >
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                          <Text strong type={isDanger ? "danger" : "secondary"}>Ghi chú: </Text>
                                          {ap.Note}
                                        </Text>
                                      </Flex>
                                    )}
                                  </Card>
                                )
                              };
                            })} 
                          />
                          
                          {!showAllHistory && approvals.length > 5 && (
                            <Flex justify="center" style={{ padding: '8px 0' }}>
                              <Button type="link" onClick={() => setShowAllHistory(true)}>
                                Xem thêm ({approvals.length - 5} mục cũ hơn)
                              </Button>
                            </Flex>
                          )}
                          {showAllHistory && approvals.length > 5 && (
                            <Flex justify="center" style={{ padding: '8px 0' }}>
                              <Button type="link" onClick={() => setShowAllHistory(false)}>
                                Thu gọn
                              </Button>
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

      <Modal title={actionLabel} open={modalVisible} onOk={executeTrigger} onCancel={() => setModalVisible(false)} confirmLoading={isMutating} okButtonProps={{ danger: actionEndpoint === "reject" }}>
        <Paragraph>Xác nhận "{actionLabel}"?</Paragraph>
        <Input.TextArea rows={3} placeholder="Ghi chú (bắt buộc nếu từ chối)..." value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
      </Modal>

      <Modal title={<Space><ShoppingCartOutlined /><Text strong>Xác nhận hoàn tất đơn hàng</Text></Space>}
        open={confirmModalVisible} width={1000}
        onOk={handleBulkConfirm}
        onCancel={() => { setConfirmModalVisible(false); setActionNote(""); }}
        confirmLoading={isMutating}
        okText="Xác nhận hoàn thành"
        cancelText="Hủy"
      >
        <Space direction="vertical" size="middle" className="pr-w-100">
          {categories.map((cat) => {
            const catItems = (cat.RequestItems || cat.requestItems) || [];
            const catActualTotal = catItems.reduce((sum, i) => {
              const qty = localQty[i.Id ?? i.id] ?? i.ProposedQuantity;
              return sum + qty * (i.UnitPrice || 0);
            }, 0);
            const catProposedTotal = catItems.reduce((sum, i) => sum + ((i.ProposedQuantity || 0) * (i.UnitPrice || 0)), 0);
            const catDiff = catProposedTotal - catActualTotal;

            return (
              <Card key={cat.Id || cat.id} size="small"
                title={<Text strong>{cat.Name || cat.name}</Text>}
                extra={
                  <Space size="middle">
                    <Text>Hạn mức: <Text strong>{fmtVnd(cat.AllowedQuota || cat.allowedQuota)}</Text></Text>
                    <Text>Đề xuất: <Text strong className="pr-text-emerald">{fmtVnd(catProposedTotal)}</Text></Text>
                    <Text>Thực tế: <Text strong className="pr-text-teal">{fmtVnd(catActualTotal)}</Text></Text>
                    <Text>Chênh lệch: <Text strong className={catDiff > 0 ? "pr-text-danger" : "pr-text-emerald"}>{catDiff >= 0 ? "-" : "+"}{fmtVnd(Math.abs(catDiff))}</Text></Text>
                  </Space>
                }
              >
                <Table dataSource={catItems} rowKey={(i) => i.Id ?? i.id} pagination={false} size="small"
                  columns={[
                    { title: "Sản phẩm", dataIndex: "ProductName", render: (val, i) => <Text strong>{i.Product?.Name || i.product?.name || val}</Text> },
                    { title: "SL Đề xuất", dataIndex: "ProposedQuantity", align: "center" as const },
                    { title: "Đơn giá", dataIndex: "UnitPrice", align: "right" as const, render: (val: number) => fmtVnd(val) },
                    { title: "SL Thực tế", align: "center" as const, width: 120, render: (_, item) => {
                        const id = item.Id ?? item.id;
                        return <InputNumber min={0} style={{ width: 80 }} value={localQty[id]}
                          onChange={(val) => setLocalQty(prev => ({ ...prev, [id]: val || 0 }))} />;
                    }},
                    { title: "Thành tiền", align: "right" as const, render: (_, item) => {
                        const qty = localQty[item.Id ?? item.id] ?? item.ProposedQuantity;
                        return <Text strong>{fmtVnd(qty * (item.UnitPrice || 0))}</Text>;
                    }},
                    { title: "Chênh lệch", align: "right" as const, render: (_, item) => {
                        const proposed = (item.ProposedQuantity || 0) * (item.UnitPrice || 0);
                        const actual = (localQty[item.Id ?? item.id] ?? item.ProposedQuantity) * (item.UnitPrice || 0);
                        const diff = proposed - actual;
                        return <Text type={diff > 0 ? "danger" : diff < 0 ? "success" : undefined}>
                          {diff !== 0 ? fmtVnd(Math.abs(diff)) : "—"}
                        </Text>;
                    }},
                  ]}
                />
              </Card>
            );
          })}

          <Descriptions bordered size="small" column={3} labelStyle={{ fontWeight: "bold" }}>
            <Descriptions.Item label="Tổng đề xuất">
              <Text strong className="pr-text-emerald">{fmtVnd(record?.TotalProposedAmount)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng thực tế">
              <Text strong className="pr-text-teal">{fmtVnd(
                categories.reduce((sum, cat) => {
                  const catItems = (cat.RequestItems || cat.requestItems) || [];
                  return sum + catItems.reduce((s, i) => {
                    const qty = localQty[i.Id ?? i.id] ?? i.ProposedQuantity;
                    return s + qty * (i.UnitPrice || 0);
                  }, 0);
                }, 0)
              )}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chênh lệch">
              <Text strong className="pr-text-danger">{fmtVnd(
                Math.abs((record?.TotalProposedAmount || 0) - categories.reduce((sum, cat) => {
                  const catItems = (cat.RequestItems || cat.requestItems) || [];
                  return sum + catItems.reduce((s, i) => {
                    const qty = localQty[i.Id ?? i.id] ?? i.ProposedQuantity;
                    return s + qty * (i.UnitPrice || 0);
                  }, 0);
                }, 0))
              )}</Text>
            </Descriptions.Item>
          </Descriptions>

          <Input.TextArea rows={2} placeholder="Ghi chú (không bắt buộc)..." value={actionNote}
            onChange={(e) => setActionNote(e.target.value)} />
        </Space>
      </Modal>
    </Show>
  );
};
