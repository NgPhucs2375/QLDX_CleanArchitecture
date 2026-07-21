import { useShow } from "@refinedev/core";
import { Role } from "./types";
import { Show } from "@refinedev/antd";
import { Typography, Card, Row, Col, Tag, Divider } from "antd";

const { Title, Text } = Typography;

export const ShowRole = () => {
  const {
    queryResult: { isError, isLoading, data },
  } = useShow<Role>();
  const record = data?.data;

  if (isError) return <div>Lỗi tải dữ liệu</div>;

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi Tiết Vai Trò</Title>}
    >
      <Card bordered={false} style={{ background: '#ffffff', border: '1px solid #e1e7ee', borderRadius: 8, boxShadow: '0 2px 10px rgba(122, 157, 193, 0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)', padding: '16px 24px', margin: '-24px -24px 24px -24px', borderBottom: '1px solid #e1e7ee', borderRadius: '8px 8px 0 0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#476481' }}>Thông tin tham chiếu</h3>
        </div>
        
        <Row gutter={[32, 24]} style={{ padding: '0 8px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Mã Định Danh Hệ Thống (ID)</Title>
            <Text strong style={{ fontSize: 16 }}>{record?.Id}</Text>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Tên Vai Trò</Title>
            <Text strong style={{ fontSize: 16, color: '#476481' }}>{record?.Name}</Text>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Tên Chuẩn Hóa</Title>
            {record?.NormalizedName ? <Tag color="geekblue">{record.NormalizedName}</Tag> : '—'}
          </Col>

          <Col xs={24}>
            <Divider style={{ margin: '4px 0', borderColor: '#e1e7ee' }} />
          </Col>
          
          <Col xs={24}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Dấu Xác Thực (Concurrency Stamp)</Title>
            <Text type="secondary" code>{record?.ConcurrencyStamp}</Text>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};