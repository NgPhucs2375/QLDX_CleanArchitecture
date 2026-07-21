import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { IProduct } from "./types";
import { Show } from "@refinedev/antd";
import { Typography, Card, Row, Col, Divider, Tag } from "antd";

const { Title, Text } = Typography;

export const ShowProduct = () => {
  const { queryResult: { isLoading, data } } = useShow<IProduct>();
  const record = data?.data;

  // Lấy chi tiết category thay vì load toàn bộ select
  const { data: categoryData, isLoading: categoryIsLoading } = useOne({
    resource: "categories",
    id: record?.CategoryId || "",
    queryOptions: { enabled: !!record?.CategoryId },
  });

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi tiết Sản phẩm</Title>}
    >
      <Card bordered={false} style={{ background: '#ffffff', borderRadius: 8, boxShadow: '0 2px 8px rgba(122,157,193,0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)', padding: '16px 24px', margin: '-24px -24px 24px -24px', borderBottom: '1px solid #e1e7ee', borderRadius: '8px 8px 0 0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#476481' }}>Thông tin cơ bản</h3>
        </div>
        
        <Row gutter={[32, 24]} style={{ padding: '8px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>Mã Sản Phẩm</Text><br/>
            <Text code style={{ fontSize: 16 }}>{record?.Code}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>Tên Sản Phẩm</Text><br/>
            <Text strong style={{ fontSize: 16, color: '#476481' }}>{record?.Name}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>Danh mục</Text><br/>
            <Text style={{ fontSize: 16 }}>{categoryIsLoading ? "Đang tải..." : (categoryData?.data?.Name || record?.CategoryId)}</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái</Text><br/>
            {record?.IsActive ? <Tag color="cyan">Đang hoạt động</Tag> : <Tag color="default">Ngừng kinh doanh</Tag>}
          </Col>

          <Col xs={24}><Divider style={{ margin: '4px 0', borderColor: '#e1e7ee' }} /></Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>Đơn giá</Text><br/>
            <Text strong style={{ fontSize: 20, color: '#7a9dc1' }}>{record?.UnitPrice?.toLocaleString("vi-VN")} ₫</Text>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>Đơn vị tính</Text><br/>
            <Text style={{ fontSize: 16 }}>{record?.Unit}</Text>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};