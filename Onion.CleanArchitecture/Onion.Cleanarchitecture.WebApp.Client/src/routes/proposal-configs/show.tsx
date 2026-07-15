import { useShow } from "@refinedev/core";
import { IProposalConfig } from "./types";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tag, Card, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Nháp", color: "default" },
  2: { label: "Đang áp dụng", color: "green" },
  3: { label: "Ngưng áp dụng", color: "red" },
};

export const ShowProposalConfig = () => {
  const { queryResult: { isLoading, data } } = useShow<IProposalConfig>();
  const record = data?.data;
  const status = record?.Status;

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0 }}>Chi tiết Cấu hình Đề xuất</Title>}
    >
      <Card bordered={false} className="pc-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>ID</Title>
            <Text strong>{record?.Id}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Mã Cấu Hình</Title>
            <Text code>{record?.Code}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Tên Cấu Hình</Title>
            <Text strong>{record?.Name}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Ngày Hiệu Lực</Title>
            <DateField value={record?.EffectiveDate} format="DD/MM/YYYY" style={{ fontWeight: 500 }} />
          </Col>
          <Col xs={24}>
            <Divider style={{ margin: '12px 0' }} />
          </Col>
          <Col xs={24} sm={12}>
            <Title level={5} style={{ marginTop: 0, color: '#8c8c8c' }}>Trạng Thái</Title>
            {status != null && <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>}
          </Col>
          {/* Bạn có thể thêm các trường Created/Modified vào đây nếu cần */}
        </Row>
      </Card>
    </Show>
  );
};