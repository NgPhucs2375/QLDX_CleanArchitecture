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

const statusMap: Record<number, { label: string; color: string }> = { 1: { label: "Bản nháp", color: "default" }, 2: { label: "Chờ trưởng đơn vị duyệt", color: "volcano" }, 3: { label: "Chờ kiểm soát duyệt", color: "geekblue" }, 4: { label: "Trả chỉnh sửa", color: "warning" }, 5: { label: "Chờ xác nhận đơn hàng", color: "purple" }, 6: { label: "Hoàn thành", color: "cyan" }, 7: { label: "Từ chối", color: "red" }, 8: { label: "Từ chối", color: "red" } };

const actionIcons: Record<string, React.ReactNode> = {
  submit: <SendOutlined />, "approve-department": <CheckCircleOutlined />, reject: <CloseCircleOutlined />,
  approve: <CheckCircleOutlined />, "return-for-edit": <RollbackOutlined />, "confirm-order": <ShoppingCartOutlined />,
};

const actionLabelMap: Record<string, string> = {
  submit: "Gửi duyệt", "approve-department": "Duyệt", approve: "Phê duyệt", reject: "Từ chối",
  "return-for-edit": "Trả về", "confirm-order": "Hoàn tất",
};

const actionColors: Record<string, string> = {
  submit: "geekblue", "approve-department": "cyan", approve: "cyan", reject: "red",
  "return-for-edit": "volcano", "confirm-order": "purple", confirm: "purple",
  return: "volcano",
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
      { label: "Trưởng đơn vị duyệt", endpoint: "approve-department", type: "primary" as const, icon: actionIcons["approve-department"] },
      { label: "Phê duyệt", endpoint: "approve", type: "primary" as const, icon: actionIcons.approve },
      { label: "Từ chối", endpoint: "reject", type: "primary" as const, danger: true, icon: actionIcons.reject },
      { label: "Trả về chỉnh sửa", endpoint: "return-for-edit", type: "default" as const, icon: actionIcons["return-for-edit"] },
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

  const flatItems = useMemo(() => {
    const result: Array<ILocalItem & { _categoryName: string; _categoryId: number }> = [];
    categories.forEach((cat) => {
      ((cat.RequestItems || cat.requestItems) || []).forEach((item) => {
        result.push({ ...item, _categoryName: cat.Name ?? cat.name ?? "", _categoryId: cat.Id ?? cat.id ?? 0 });
      });
    });
    return result;
  }, [categories]);

  return (
    <Show isLoading={isLoading} title={<Title level={3} className="pr-m-0 pr-text-emerald">Chi tiết Phiếu Đề Xuất</Title>}
      headerButtons={(() => {
        const userId = identity?.Uid;
        const isCreator = userId && record?.CreatedBy && String(userId) === String(record.CreatedBy);
        const showEdit = !!isCreator && (status === 1 || status === 4);
        return showEdit ? <EditButton type="primary" ghost size="middle">Chỉnh sửa</EditButton> : <></>;
      })()}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" className="pr-w-100">

                <Card loading={isLoading} className="pr-card pr-card-emerald"
                    title={<Space><InfoCircleOutlined className="pr-text-emerald" style={{ fontSize: '20px' }} /><Text strong className="pr-text-emerald" style={{ fontSize: '18px' }}>Thông tin quy chiếu</Text></Space>}
                    extra={visibleActions.length > 0 && (
                        <Space>
                            {visibleActions.map((act) => (
                                <Button key={act.endpoint} type="primary" size="middle" danger={act.classColor === "pr-text-danger"} icon={act.icon} onClick={() => { if (act.endpoint === "confirm-order") { setConfirmModalVisible(true); } else { setActionEndpoint(act.endpoint); setActionLabel(act.label); setModalVisible(true); } }}>
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
                            <Text strong>{creatorName}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng Tiền Đề Xuất">
                            <Text strong className="pr-text-emerald">{fmtVnd(record?.TotalProposedAmount)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng Tiền Thực Tế">
                            <Text strong className={record?.TotalActualAmount ? "pr-text-teal" : undefined}>
                              {record?.TotalActualAmount != null ? fmtVnd(record.TotalActualAmount) : "—"}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng Thái">
                            {status != null && <Tag color={statusMap[status]?.color} style={{ padding: '4px 12px', fontSize: '14px', borderRadius: '4px' }}>{statusMap[status]?.label}</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Tạo">
                            {record?.Created ? <DateField value={record?.Created} format="DD/MM/YYYY - HH:mm" /> : "—"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {flatItems.length > 0 && (
                  <Card loading={isLoading} className="pr-card"
                    title={<Space><CheckCircleOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Danh mục hàng hóa</Text></Space>}
                    extra={<Text className="pr-text-secondary">Tổng đề xuất: <Text strong className="pr-text-emerald">{fmtVnd(record?.TotalProposedAmount)}</Text></Text>}
                  >
                    <Table dataSource={flatItems} rowKey={(i) => i.Id ?? i.id} pagination={false} size="small" scroll={{ x: 'max-content' }}
                      columns={[
                        { title: "Danh mục", dataIndex: "_categoryName", width: 150, render: (val: string) => <Tag color="blue">{val}</Tag> },
                        { title: "Sản phẩm", dataIndex: "ProductName", render: (val, i) => <Text strong>{i.Product?.Name || i.product?.name || val}</Text> },
                        { title: "SL Đề xuất", dataIndex: "ProposedQuantity", align: "center" as const },
                        { title: "Đơn giá", dataIndex: "UnitPrice", align: "right" as const, render: (val: number) => fmtVnd(val) },
                        { title: "Thành tiền", align: "right" as const, render: (_, item) => <Text strong className="pr-text-emerald">{fmtVnd((item.ProposedQuantity ?? 0) * (item.UnitPrice ?? 0))}</Text> },
                      ]}
                    />
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
                        // Dùng <Flex> thay cho <div> để tạo khung cuộn (scroll)
                        <Flex vertical style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 4px 8px 16px' }}>
                          <Timeline 
                            className = "pr-timeline-bold"
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
                                  // Dùng <Card> thay cho <div> bọc từng step
                                  <Card
                                    size="small"
                                    bordered={true}
                                    style={{
                                      marginBottom: 12,
                                      background: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#f8fafc',
                                      borderColor: isApproved ? '#bbf7d0' : isRejected ? '#fecaca' : '#e2e8f0',
                                      borderRadius: 8
                                    }}
                                    styles={{ body: { padding: '14px 20px' } }} // Dùng bodyStyle={{ padding: '14px 20px' }} nếu bạn xài antd v4
                                  >
                                    {/* Header: Vai trò & Tên (Dùng <Flex> dàn 2 bên) */}
                                    <Flex justify="space-between" align="flex-start" style={{ marginBottom: 4 }}>
                                      <Space size={6} wrap>
                                        <Tag 
                                          color={isApproved ? "success" : isRejected ? "error" : "default"} 
                                          style={{ margin: 0, whiteSpace: 'normal', lineHeight: '20px' }}
                                        >
                                          {apRole}
                                        </Tag>
                                        <Text strong style={{ fontSize: 14, wordBreak: 'break-word' }}>
                                          {apName}
                                        </Text>
                                      </Space>
                                      {isApproved && <CheckCircleFilled style={{ color: '#10b981', fontSize: 18 }} />}
                                      {isRejected && <CloseCircleFilled style={{ color: '#ef4444', fontSize: 18 }} />}
                                    </Flex>

                                    {/* Body: Hành động & Thời gian */}
                                    {approvalAction && (
                                      <Space style={{ marginTop: 8 }}>
                                        <Tag color={actionColors[actionVal] || "blue"} style={{ fontSize: 12 }}>
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
                                      <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                                        Đang chờ duyệt
                                      </Paragraph>
                                    )}

                                    {/* Footer: Ghi chú (Nếu có) */}
                                    {approvalAction?.Note && (
                                      <Alert 
                                        message={approvalAction.Note} 
                                        type={isRejected ? "error" : "info"} 
                                        showIcon
                                        style={{ padding: '6px 10px', marginTop: 8, fontSize: 13 }} 
                          />
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
    // Dùng <Flex> thay cho <div> bọc ngoài cùng
    <Flex vertical style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 4px 8px 16px' }}>
      <Timeline 
        className="pr-timeline-bold"
        items={[...approvals].reverse().slice(0, showAllHistory ? undefined : 5).map((ap) => {
          const act = ap.Action || ap.action || "";
          const isDanger = act === "reject" || act === "return" || act === "rejected";
          const actLabel = actionLabelMap[act] || act;
          const actColor = actionColors[act] || (isDanger ? "red" : "blue");
          
          const historyLineColor = isDanger ? "red" : "blue";

          return {
            color: historyLineColor,
            className: `pr-line-${historyLineColor}`, // <--- Gắn class màu cho đường Line
            dot: isDanger 
              ? <CloseCircleFilled style={{ fontSize: '20px', color: '#ef4444' }} />
              : <CheckCircleFilled style={{ fontSize: '20px', color: '#3b82f6' }} />,
            
            children: (
              // Dùng <Card> thay cho <div> bọc từng lịch sử
              <Card
                size="small"
                bordered={true}
                style={{
                  marginBottom: 12,
                  background: isDanger ? '#fef2f2' : '#eff6ff',
                  borderColor: isDanger ? '#fecaca' : '#bfdbfe',
                  borderRadius: 8
                }}
                styles={{ body: { padding: '12px 20px' } }}
              >
                {/* Dùng <Flex> thay cho <div> dàn ngang Header */}
                <Flex justify="space-between" align="flex-start" gap={8}>
                  <Space size={6} wrap>
                    <Text strong style={{ fontSize: 14, wordBreak: 'break-word' }}>
                      {ap.ApproverName || ap.approverName || "Hệ thống"}
                    </Text>
                    <Tag 
                      color={actColor} 
                      style={{ margin: 0, fontSize: 12, whiteSpace: 'normal', lineHeight: '20px' }}
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

                {/* Ghi chú */}
                {ap.Note && (
                  <Alert 
                    message={ap.Note} 
                    type={isDanger ? "error" : "info"} 
                    showIcon
                    style={{ padding: '6px 10px', marginTop: 8, fontSize: 13 }} 
                  />
                )}
              </Card>
            )
          };
        })} 
      />
      
      {/* Nút Xem thêm / Thu gọn (Dùng <Flex justify="center"> thay cho <div>) */}
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
    <Text type="secondary">Chưa có lịch sử</Text>
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
