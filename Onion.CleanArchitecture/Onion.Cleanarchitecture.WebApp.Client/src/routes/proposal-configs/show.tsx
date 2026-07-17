import { useShow } from "@refinedev/core";
import { IProposalConfig } from "./types";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tag, Card, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Bản nháp", color: "default" },
  2: { label: "Đang áp dụng", color: "geekblue" },
  3: { label: "Ngưng áp dụng", color: "volcano" },
};

export const ShowProposalConfig = () => {
  const { queryResult: { isLoading, data } } = useShow<IProposalConfig>();
  const record = data?.data;
  const status = record?.Status;

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi tiết Cấu hình Đề xuất</Title>}
    >
      <Card bordered={false} style={{ background: '#ffffff', border: '1px solid #e1e7ee', borderRadius: 8, boxShadow: '0 2px 10px rgba(122, 157, 193, 0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)', padding: '16px 24px', margin: '-24px -24px 24px -24px', borderBottom: '1px solid #e1e7ee', borderRadius: '8px 8px 0 0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#476481' }}>Thông tin tham chiếu</h3>
        </div>
        
        <Row gutter={[32, 24]} style={{ padding: '0 8px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Mã Hệ Thống (ID)</Title>
            <Text strong style={{ fontSize: 16 }}>#{record?.Id}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Mã Cấu Hình</Title>
            <Text strong style={{ fontSize: 16, color: '#476481' }}>{record?.Code}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Tên Cấu Hình</Title>
            <Text strong style={{ fontSize: 16 }}>{record?.Name}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Trạng Thái</Title>
            {status != null && <Tag color={statusMap[status]?.color} style={{ padding: '4px 12px', borderRadius: 12, fontSize: 14 }}>{statusMap[status]?.label || status}</Tag>}
          </Col>

          <Col xs={24}>
            <Divider style={{ margin: '4px 0', borderColor: '#e1e7ee' }} />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Ngày Hiệu Lực</Title>
            <DateField value={record?.EffectiveDate} format="DD/MM/YYYY" style={{ fontWeight: 600, fontSize: 16, color: '#7a9dc1' }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Người Tạo</Title>
            <Text>{record?.CreatedBy || 'Hệ thống'}</Text>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};