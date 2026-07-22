import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { IProduct } from "./types";
import { Show } from "@refinedev/antd";
import { Typography, Card, Space, Descriptions, Tag } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import "../../assets/product.css";

const { Title, Text } = Typography;

export const ShowProduct = () => {
  const { queryResult: { isLoading, data } } = useShow<IProduct>();
  const record = data?.data;

  const { data: categoryData, isFetching: categoryFetching } = useOne({
    resource: "categories",
    id: record?.CategoryId || "",
    queryOptions: { enabled: !!record?.CategoryId },
  });

  // Xử lý an toàn cho object lồng
  const catName = (categoryData?.data as any)?.data?.Name || categoryData?.data?.Name || record?.CategoryId;

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} className="pd-m-0 pd-text-ocean pd-font-bold">Chi tiết sản phẩm</Title>}
    >
      <Card loading={isLoading} className="pd-card pd-card-ocean" 
        title={<Space><InfoCircleOutlined className="pd-text-ocean" style={{ fontSize: '20px' }} /><Text strong className="pd-text-ocean pd-font-16">Thông tin cơ bản</Text></Space>}
      >
        <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered size="middle" labelStyle={{ fontWeight: 'bold', color: '#64748b' }}>
            <Descriptions.Item label="Mã sản phẩm">
                <Text strong className="pd-text-ocean">{record?.Code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên sản phẩm">
                <Text strong>{record?.Name}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Danh mục áp dụng">
                <Text>{categoryFetching ? "Đang tải..." : (catName || "—")}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái kinh doanh">
                {record?.IsActive ? <Tag color="success" className="pd-tag-rounded">Đang hoạt động</Tag> : <Tag color="default" className="pd-tag-rounded">Ngừng kinh doanh</Tag>}
            </Descriptions.Item>

            <Descriptions.Item label="Đơn giá">
                <Text strong style={{ fontSize: '16px', color: '#0d9488' }}>{record?.UnitPrice?.toLocaleString("vi-VN")} ₫</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị tính">
                <Text>{record?.Unit || "—"}</Text>
            </Descriptions.Item>
        </Descriptions>
      </Card>
    </Show>
  );
};