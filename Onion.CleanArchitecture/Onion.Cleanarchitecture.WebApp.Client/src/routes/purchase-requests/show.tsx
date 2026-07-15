import { useShow, useCustomMutation, useApiUrl } from "@refinedev/core";
import { IPurchaseRequest } from "./types";
import { Show } from "@refinedev/antd";
import { Typography, Tag, Button, Space, Modal, App, Card, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Nháp", color: "default" },
  2: { label: "Đơn vị đang duyệt", color: "orange" },
  3: { label: "Kiểm soát đang duyệt", color: "blue" },
  4: { label: "Yêu cầu chỉnh sửa", color: "warning" },
  5: { label: "Đã duyệt", color: "green" },
  6: { label: "Chờ đặt hàng", color: "purple" },
  7: { label: "Hoàn thành", color: "cyan" },
  8: { label: "Đơn vị từ chối", color: "red" },
  9: { label: "Kiểm soát từ chối", color: "red" },
};

const availableActions: Record<number, { label: string; endpoint: string; action: string; color: string }[]> = {
  1: [{ label: "Gửi duyệt", endpoint: "submit", action: "submit", color: "blue" }],
  2: [
    { label: "Đơn vị duyệt", endpoint: "approve-department", action: "approve-department", color: "green" },
    { label: "Từ chối", endpoint: "reject", action: "reject", color: "red" },
  ],
  3: [
    { label: "Phê duyệt", endpoint: "approve", action: "approve", color: "green" },
    { label: "Từ chối", endpoint: "reject", action: "reject", color: "red" },
    { label: "Trả về chỉnh sửa", endpoint: "return-for-edit", action: "return-for-edit", color: "orange" },
  ],
  4: [{ label: "Gửi duyệt lại", endpoint: "submit", action: "submit", color: "blue" }],
  5: [{ label: "Xác nhận đặt hàng", endpoint: "confirm-order", action: "confirm-order", color: "purple" }],
  6: [{ label: "Hoàn thành", endpoint: "complete", action: "complete", color: "cyan" }],
};

export const ShowPurchaseRequest = () => {
  const { queryResult: { isLoading, data, refetch } } = useShow<IPurchaseRequest>();
  const { mutate, isLoading: isMutating } = useCustomMutation();
  const apiUrl = useApiUrl();
  const { message } = App.useApp();

  const record = data?.data;
  const status = record?.Status;
  const actions = status != null ? availableActions[status] : undefined;

  const handleAction = (endpoint: string, label: string) => {
    Modal.confirm({
      title: `Xác nhận ${label}`,
      content: `Bạn có chắc chắn muốn thực hiện hành động "${label}" với phiếu này?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        mutate(
          {
            url: `${apiUrl}/purchase-requests/${record!.Id}/${endpoint}`,
            method: "post",
            values: {},
          },
          {
            onSuccess: () => {
              message.success(`Thực hiện ${label} thành công`);
              refetch();
            },
            onError: (error: any) => {
              message.error(error?.response?.data?.message || `Lỗi khi thực hiện ${label}`);
            },
          }
        );
      },
    });
  };

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0 }}>Chi tiết Phiếu Đề Xuất Mua Hàng</Title>}
    >
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Mã phiếu</Title>
            <Text code style={{ fontSize: 16 }}>{record?.Code}</Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>ID Đơn vị áp dụng</Title>
            <Text strong>{record?.DepartmentId}</Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Trạng thái</Title>
            {status != null && <Tag color={statusMap[status]?.color} style={{ fontSize: 14, padding: '4px 10px' }}>{statusMap[status]?.label || status}</Tag>}
          </Col>

          <Col xs={24}><Divider style={{ margin: '12px 0' }} /></Col>

          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Tổng tiền đề xuất</Title>
            <Text strong style={{ fontSize: 20, color: '#1677ff' }}>
              {record?.TotalProposedAmount?.toLocaleString("vi-VN")} ₫
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Tổng tiền thực tế</Title>
            <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
              {record?.TotalActualAmount?.toLocaleString("vi-VN")} ₫
            </Text>
          </Col>
        </Row>
      </Card>

      {actions && actions.length > 0 && (
        <Card bordered={false} style={{ marginTop: 24, borderRadius: 8, background: '#fafafa' }}>
          <Space size="middle">
            <Text strong>Thao tác xử lý:</Text>
            {actions.map((action) => (
              <Button
                key={action.endpoint}
                type="primary"
                danger={action.color === "red"}
                style={{ 
                  backgroundColor: action.color === "green" ? "#52c41a" : action.color === "purple" ? "#722ed1" : action.color === "cyan" ? "#13c2c2" : action.color === "orange" ? "#fa8c16" : undefined 
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