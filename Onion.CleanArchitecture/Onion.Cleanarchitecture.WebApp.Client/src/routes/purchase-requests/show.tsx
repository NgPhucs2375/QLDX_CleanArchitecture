import { useShow, useCustomMutation, useApiUrl } from "@refinedev/core";
import { IPurchaseRequest } from "./types";
import { Show } from "@refinedev/antd";
import { Typography, Tag, Button, Space, Modal, App, Card, Row, Col, Table, InputNumber } from "antd";
import { CheckOutlined, ShoppingCartOutlined, InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";

const { Title, Text } = Typography;

// --- CSS CHUẨN XANH BLUE NGỌC TRAI ---
const STYLES = `
  .pearl-card { background: #ffffff; border: 1px solid #e1e7ee; border-radius: 8px; box-shadow: 0 2px 10px rgba(122, 157, 193, 0.05); margin-bottom: 24px; overflow: hidden; }
  .pearl-header-section { background: linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%); padding: 20px 24px; border-bottom: 1px solid #e1e7ee; display: flex; align-items: center; gap: 12px; }
  .pearl-header-section h3 { margin: 0; color: #476481; font-weight: 700; font-size: 17px; }
  
  .pearl-table-wrapper { padding: 0; overflow-x: auto; }
  .pearl-table-wrapper .ant-table { font-size: 15px; }
  .pearl-table-wrapper .ant-table-thead > tr > th { background: #7a9dc1 !important; color: #ffffff !important; font-weight: 600; border-bottom: 2px solid #5d82a6 !important; padding: 14px 16px; }
  .pearl-table-wrapper .ant-table-tbody > tr > td { padding: 14px 16px !important; border-bottom: 1px solid #f2f6fb !important; vertical-align: middle; }
  .pearl-table-wrapper .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
  
  .pearl-footer-section { background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e1e7ee; display: flex; justify-content: space-between; align-items: center; }
  
  .btn-update-qty { background: #f0fdfa; border: 1px solid #10b981; color: #10b981; border-radius: 0 6px 6px 0; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .btn-update-qty:hover { background: #10b981; color: #fff; }
  .btn-update-qty:disabled { background: #f4f7fa; border-color: #d3dfea; color: #a5b4c3; }
`;

const fmtVnd = (n: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

interface IPRItem {
  Id: number;
  ProductId: number;
  ProductName: string;
  ProposedQuantity: number;
  UnitPrice: number;
  TotalAmount: number;
  ActualQuantity: number;
  ActualTotalAmount: number;
}

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Bản nháp", color: "default" },
  2: { label: "Chờ trưởng đơn vị duyệt", color: "volcano" },
  3: { label: "Chờ kiểm soát duyệt", color: "geekblue" },
  4: { label: "Trả chỉnh sửa", color: "warning" },
  5: { label: "Chờ xác nhận đơn hàng", color: "purple" },
  6: { label: "Hoàn thành", color: "cyan" },
  7: { label: "Từ chối bởi trưởng đơn vị", color: "red" },
  8: { label: "Từ chối bởi kiểm soát", color: "red" },
};

const triggerMap: Record<string, number> = {
  submit: 1, "approve-department": 2, reject: 3, "return-for-edit": 4,
  approve: 5, "confirm-order": 6, complete: 7,
};

const availableActions: Record<number, { label: string; endpoint: string; color: string; icon?: React.ReactNode }[]> = {
  1: [{ label: "Gửi duyệt", endpoint: "submit", color: "geekblue" }],
  2: [
    { label: "Trưởng đơn vị duyệt", endpoint: "approve-department", color: "cyan" },
    { label: "Từ chối", endpoint: "reject", color: "red" },
  ],
  3: [
    { label: "Phê duyệt", endpoint: "approve", color: "cyan" },
    { label: "Từ chối", endpoint: "reject", color: "red" },
    { label: "Trả về chỉnh sửa", endpoint: "return-for-edit", color: "volcano" },
  ],
  4: [{ label: "Gửi duyệt lại", endpoint: "submit", color: "geekblue" }],
  5: [{ label: "Hoàn tất xác nhận đơn hàng", endpoint: "confirm-order", color: "purple", icon: <ShoppingCartOutlined /> }],
};

export const ShowPurchaseRequest = () => {
  const { queryResult: { isLoading, data, refetch } } = useShow<IPurchaseRequest>();
  const { mutate, isLoading: isMutating } = useCustomMutation();
  const apiUrl = useApiUrl();
  const { message } = App.useApp();

  const record = data?.data as any;
  const status = record?.Status;
  const actions = status != null ? availableActions[status] : undefined;

  // --- SỬ DỤNG USEMEMO ĐỂ ĐÓNG BĂNG MẢNG ITEMS (GIẢI QUYẾT LỖI ESLINT) ---
  const items: IPRItem[] = useMemo(() => {
    const rawCategories = record?.RequestCategories || record?.requestCategories || [];
    return rawCategories.flatMap((cat: any) => {
        const catItems = cat.RequestItems || cat.requestItems || [];
        return catItems.map((i: any) => ({
            ...i,
            ProductName: i.Product?.Name || i.product?.name || `Sản phẩm #${i.ProductId || i.productId}`,
            Id: i.Id || i.id,
            ProposedQuantity: i.ProposedQuantity || i.proposedQuantity,
            UnitPrice: i.UnitPrice || i.unitPrice,
            TotalAmount: i.TotalAmount || i.totalAmount,
            ActualQuantity: i.ActualQuantity || i.actualQuantity,
            ActualTotalAmount: i.ActualTotalAmount || i.actualTotalAmount,
        }));
    });
  }, [record]); // Chỉ tính toán lại items khi record từ server thay đổi

  const [localQty, setLocalQty] = useState<Record<number, number>>({});
  const [isPristine, setIsPristine] = useState<Record<number, boolean>>({});

  // --- SỬ DỤNG ITEMS LÀM DEPENDENCY ---
  useEffect(() => {
    if (items && items.length > 0) {
      const initialQty: Record<number, number> = {};
      const pristineState: Record<number, boolean> = {};
      items.forEach(item => {
        initialQty[item.Id] = item.ActualQuantity > 0 ? item.ActualQuantity : item.ProposedQuantity;
        pristineState[item.Id] = true; 
      });
      setLocalQty(initialQty);
      setIsPristine(pristineState);
    }
  }, [items]); // Lỗi Warning đã bị triệt tiêu an toàn!

  const handleSaveRow = (item: IPRItem) => {
    const qty = localQty[item.Id];
    mutate(
      {
        url: `${apiUrl}/purchase-request-items/${item.Id}/update-actual-quantity`,
        method: "put",
        values: { Id: item.Id, ActualQuantity: qty },
      },
      {
        onSuccess: () => {
          message.success(`Đã cập nhật thực tế thành ${qty}`);
          setIsPristine(prev => ({ ...prev, [item.Id]: true }));
          refetch(); 
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.message || "Lỗi cập nhật số lượng");
        }
      }
    );
  };

  const handleAction = (endpoint: string, label: string) => {
    if (endpoint === "confirm-order") {
      const hasUnsaved = Object.values(isPristine).some(pristine => !pristine);
      if (hasUnsaved) {
        message.warning("Vui lòng ấn [✓] để lưu số lượng thực tế cho tất cả các dòng trước khi xác nhận!");
        return;
      }
    }

    Modal.confirm({
      title: `Xác nhận ${label}`,
      content: `Bạn có chắc chắn muốn "${label}" phiếu đề xuất này?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        mutate(
          {
            url: `${apiUrl}/purchase-requests/${record!.Id}/trigger`,
            method: "post",
            values: { trigger: triggerMap[endpoint], note: "" },
          },
          {
            onSuccess: () => {
              message.success(`Thực hiện thành công`);
              refetch();
            },
            onError: (error: any) => {
              message.error(error?.response?.data?.message || `Lỗi khi thao tác`);
            },
          }
        );
      },
    });
  };

  const totalProposed = items.reduce((sum, item) => sum + (item.TotalAmount || 0), 0);
  const totalRealtimeActual = items.reduce((sum, item) => {
      const qty = localQty[item.Id] ?? item.ProposedQuantity;
      return sum + (qty * (item.UnitPrice || 0));
  }, 0);

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "ProductName",
      render: (val: string) => <Text strong style={{ color: '#476481' }}>{val}</Text>
    },
    {
      title: "SL Đề xuất",
      dataIndex: "ProposedQuantity",
      align: "center" as const,
      render: (val: number) => <Text style={{ color: '#6b7c93' }}>{val}</Text>
    },
    {
      title: "Đơn giá",
      dataIndex: "UnitPrice",
      align: "right" as const,
      render: (val: number) => <Text>{fmtVnd(val)}</Text>
    },
    {
      title: "SL Thực tế",
      align: "center" as const,
      width: 180,
      render: (_: any, item: IPRItem) => {
        if (status !== 5) {
          return <Text strong style={{ color: '#0d9488', fontSize: 16 }}>{item.ActualQuantity || "—"}</Text>;
        }
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <InputNumber 
              min={0} 
              value={localQty[item.Id]} 
              onChange={(val) => {
                setLocalQty(prev => ({ ...prev, [item.Id]: val || 0 }));
                setIsPristine(prev => ({ ...prev, [item.Id]: false }));
              }}
              onPressEnter={() => handleSaveRow(item)} 
              style={{ width: 70, textAlign: 'center', borderRadius: '6px 0 0 6px', height: 36 }}
            />
            <Button 
              className="btn-update-qty"
              disabled={isPristine[item.Id]}
              onClick={() => handleSaveRow(item)}
              loading={isMutating && !isPristine[item.Id]}
              title="Lưu số lượng dòng này"
            >
              <CheckOutlined />
            </Button>
          </div>
        );
      }
    },
    {
      title: "Thành tiền (Thực tế)",
      align: "right" as const,
      render: (_: any, item: IPRItem) => {
        const qty = localQty[item.Id] ?? 0;
        const total = qty * item.UnitPrice;
        const isSaved = isPristine[item.Id];
        return <Text strong style={{ color: isSaved ? '#0d9488' : '#fa8c16' }}>{fmtVnd(total)}</Text>;
      }
    }
  ];

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi tiết Phiếu Đề Xuất Mua Hàng</Title>}
    >
      <style>{STYLES}</style>
      
      <div className="pearl-card">
        <div className="pearl-header-section">
          <div style={{ background: '#e6edf4', color: '#7a9dc1', padding: '6px 10px', borderRadius: 8 }}><InfoCircleOutlined style={{ fontSize: 18 }} /></div>
          <h3>Thông tin quy chiếu</h3>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Mã phiếu</Title>
              <Text code style={{ fontSize: 16 }}>{record?.Code}</Text>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>ID Đơn vị áp dụng</Title>
              <Text strong>{record?.DepartmentId}</Text>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Người tạo</Title>
              <Text>{record?.CreatedBy || "Hệ thống"}</Text>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Trạng thái</Title>
              {status != null && <Tag color={statusMap[status]?.color} style={{ fontSize: 14, padding: '4px 12px', borderRadius: 12 }}>{statusMap[status]?.label || status}</Tag>}
            </Col>
          </Row>
        </div>
      </div>

      {items.length > 0 && (
        <div className="pearl-card">
          <div className="pearl-header-section" style={{ background: '#fdfbf7' }}>
            <div style={{ background: '#f6ffed', color: '#52c41a', padding: '6px 10px', borderRadius: 8 }}><CheckCircleOutlined style={{ fontSize: 18 }} /></div>
            <h3 style={{ color: '#3a4a5b' }}>Danh sách hàng hóa & Đối chiếu nhập liệu</h3>
          </div>
          
          <div className="pearl-table-wrapper">
            <Table dataSource={items} columns={columns} rowKey="Id" pagination={false} />
          </div>

          <div className="pearl-footer-section">
            <div>
              {status === 5 && <Text type="secondary">Gõ số lượng và bấm Enter hoặc nút [✓] màu xanh để cập nhật từng dòng.</Text>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: 8, color: '#6b7c93', fontSize: 15 }}>
                Tổng tiền đề xuất ban đầu: <Text strong style={{ fontSize: 16, marginLeft: 8 }}>{fmtVnd(totalProposed)}</Text>
              </div>
              <div style={{ fontSize: 18, color: '#2c3e50', fontWeight: 600 }}>
                Tổng thực tế (Cập nhật Real-time): <Text strong style={{ fontSize: 24, color: '#0d9488', marginLeft: 8 }}>{fmtVnd(totalRealtimeActual)}</Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {actions && actions.length > 0 && (
        <Card bordered={false} style={{ borderRadius: 8, border: '1px dashed #d3dfea', background: '#f4f7fa' }}>
          <Space size="middle">
            <Text strong style={{ color: '#476481' }}>Thao tác luồng trạng thái:</Text>
            {actions.map((action) => (
              <Button
                key={action.endpoint}
                type="primary"
                size="large"
                danger={action.color === "red"}
                icon={action.icon}
                style={{ 
                  backgroundColor: action.color === "cyan" ? "#13c2c2" : action.color === "purple" ? "#722ed1" : action.color === "geekblue" ? "#2f54eb" : action.color === "volcano" ? "#fa541c" : undefined,
                  borderRadius: 6,
                  fontWeight: 600
                }}
                loading={isMutating}
                onClick={() => handleAction(action.endpoint, action.label)}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        </Card>
      )}
    </Show>
  );
};