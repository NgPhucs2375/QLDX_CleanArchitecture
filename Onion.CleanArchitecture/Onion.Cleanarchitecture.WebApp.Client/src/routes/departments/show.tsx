import { useShow } from "@refinedev/core";
import { IDepartment } from "./types";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tag, Card, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;

export const ShowDepartment = () => {
  const { queryResult: { isLoading, data } } = useShow<IDepartment>();
  const record = data?.data;

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi Tiết Đơn Vị/Phòng Ban</Title>}
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
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Mã Đơn Vị</Title>
            <Text strong style={{ fontSize: 16, color: '#476481' }}>{record?.Code}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Tên Đơn Vị/Phòng Ban</Title>
            <Text strong style={{ fontSize: 16 }}>{record?.Name}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Trạng Thái</Title>
            {record?.IsActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="default">Ngừng hoạt động</Tag>}
          </Col>

          <Col xs={24}>
            <Divider style={{ margin: '4px 0', borderColor: '#e1e7ee' }} />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>ID Trưởng Đơn Vị</Title>
            <Text>{record?.ManagerId || <Text type="secondary">Chưa phân công</Text>}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Người Tạo</Title>
            <Text>{record?.CreatedBy || 'Hệ thống'}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Ngày Tạo</Title>
            <DateField value={record?.Created} format="DD/MM/YYYY HH:mm" style={{ fontWeight: 600, color: '#7a9dc1' }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Cập Nhật Cuối</Title>
            {record?.LastModified ? <DateField value={record?.LastModified} format="DD/MM/YYYY HH:mm" style={{ fontWeight: 600, color: '#7a9dc1' }} /> : '—'}
          </Col>
        </Row>
      </Card>
    </Show>
  );
};