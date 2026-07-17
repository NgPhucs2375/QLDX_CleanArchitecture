import { useShow } from "@refinedev/core";
import { IProduct } from "./types";
import { Show, useSelect } from "@refinedev/antd";
import { Typography, Card, Row, Col, Divider, Tag } from "antd";

const { Title, Text } = Typography;

export const ShowProduct = () => {
  const { queryResult: { isLoading, data } } = useShow<IProduct>();
  const record = data?.data;

  // Lấy danh sách category để map tên thay vì hiện ID
  const { selectProps: categorySelectProps } = useSelect({ resource: "categories" });
  const catName = categorySelectProps.options?.find(opt => opt.value == record?.CategoryId)?.label;

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi tiết Sản phẩm</Title>}
    >
      <Card bordered={false} style={{ background: '#ffffff', border: '1px solid #e1e7ee', borderRadius: 8, boxShadow: '0 2px 10px rgba(122, 157, 193, 0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)', padding: '16px 24px', margin: '-24px -24px 24px -24px', borderBottom: '1px solid #e1e7ee', borderRadius: '8px 8px 0 0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#476481' }}>Thông tin cơ bản</h3>
        </div>
        
        <Row gutter={[32, 24]} style={{ padding: '0 8px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Mã Sản Phẩm</Title>
            <Text code style={{ fontSize: 16 }}>{record?.Code}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Tên Sản Phẩm</Title>
            <Text strong style={{ fontSize: 16, color: '#476481' }}>{record?.Name}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Danh mục</Title>
            <Text style={{ fontSize: 16 }}>{catName || record?.CategoryId}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Trạng thái</Title>
            {record?.IsActive ? <Tag color="cyan">Đang hoạt động</Tag> : <Tag color="default">Ngừng kinh doanh</Tag>}
          </Col>

          <Col xs={24}>
            <Divider style={{ margin: '4px 0', borderColor: '#e1e7ee' }} />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Đơn giá</Title>
            <Text strong style={{ fontSize: 20, color: '#7a9dc1' }}>{record?.UnitPrice?.toLocaleString("vi-VN")} ₫</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Đơn vị tính</Title>
            <Text style={{ fontSize: 16 }}>{record?.Unit}</Text>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};