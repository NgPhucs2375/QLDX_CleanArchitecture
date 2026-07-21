import React from "react";
import { Row, Col, Card, Typography, Statistic, Table, Tag } from "antd";
import { 
  FileTextOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  WarningOutlined 
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { DateField } from "@refinedev/antd";

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  // Lấy danh sách 5 phiếu đề xuất mới nhất để hiển thị nhanh
  const { data: recentRequests, isLoading } = useList({
    resource: "purchase-requests",
    pagination: { current: 1, pageSize: 5 },
    sorters: [{ field: "Id", order: "desc" }],
  });

  // Tái sử dụng bảng màu Status Map
  const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: "Nháp", color: "default" },
    2: { label: "Đơn vị đang duyệt", color: "orange" },
    3: { label: "Kiểm soát đang duyệt", color: "blue" },
    4: { label: "Yêu cầu chỉnh sửa", color: "warning" },
    5: { label: "Đã duyệt", color: "green" },
    6: { label: "Chờ xác nhận đặt hàng", color: "purple" },
    7: { label: "Hoàn thành", color: "cyan" },
    8: { label: "Từ chối", color: "red" },
  };

  const columns = [
    {
      title: "Mã Phiếu",
      dataIndex: "Code",
      render: (val: string) => <Text strong style={{ color: '#476481' }}>{val}</Text>
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      render: (val: number) => (
        <Tag color={statusMap[val]?.color || "default"}>
          {statusMap[val]?.label || "Không xác định"}
        </Tag>
      )
    },
    {
      title: "Đề xuất",
      dataIndex: "TotalProposedAmount",
      align: "right" as const,
      render: (val: number) => <Text strong style={{ color: '#7a9dc1' }}>{(val || 0).toLocaleString("vi-VN")} ₫</Text>
    },
    {
      title: "Ngày tạo",
      dataIndex: "Created",
      render: (val: any) => <DateField value={val} format="DD/MM/YYYY HH:mm" style={{ color: '#6b7c93' }} />
    }
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <Title level={3} style={{ margin: "0 0 24px 0", color: "#476481", fontWeight: 700 }}>
        Tổng Quan Hệ Thống
      </Title>

      {/* Row 1: Các thẻ thống kê (Mock data cho UI, bạn có thể dùng useCustom để gọi API đếm thực tế) */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.08)", borderLeft: "4px solid #7a9dc1" }}>
            <Statistic 
              title={<span style={{ color: "#6b7c93", fontWeight: 600 }}>Tổng Đề Xuất</span>} 
              value={124} 
              prefix={<FileTextOutlined style={{ color: "#7a9dc1", marginRight: 8 }} />} 
              valueStyle={{ color: "#476481", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.08)", borderLeft: "4px solid #fa8c16" }}>
            <Statistic 
              title={<span style={{ color: "#6b7c93", fontWeight: 600 }}>Đang Chờ Duyệt</span>} 
              value={18} 
              prefix={<SyncOutlined spin style={{ color: "#fa8c16", marginRight: 8 }} />} 
              valueStyle={{ color: "#476481", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.08)", borderLeft: "4px solid #52c41a" }}>
            <Statistic 
              title={<span style={{ color: "#6b7c93", fontWeight: 600 }}>Đã Hoàn Thành</span>} 
              value={95} 
              prefix={<CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />} 
              valueStyle={{ color: "#476481", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.08)", borderLeft: "4px solid #ff4d4f" }}>
            <Statistic 
              title={<span style={{ color: "#6b7c93", fontWeight: 600 }}>Cần Chỉnh Sửa / Từ Chối</span>} 
              value={11} 
              prefix={<WarningOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />} 
              valueStyle={{ color: "#476481", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Bảng dữ liệu gần đây */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ color: "#476481", fontWeight: 700 }}>Đề Xuất Mua Hàng Mới Nhất</span>} 
            bordered={false} 
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.05)" }}
            headStyle={{ borderBottom: "1px solid #e1e7ee", background: "linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)", borderRadius: "8px 8px 0 0" }}
            bodyStyle={{ padding: 0 }}
          >
            <Table 
              dataSource={recentRequests?.data || []} 
              columns={columns} 
              rowKey="Id"
              pagination={false}
              loading={isLoading}
              size="middle"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ color: "#476481", fontWeight: 700 }}>Thông Tin Nhanh</span>} 
            bordered={false} 
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.05)", height: "100%" }}
            headStyle={{ borderBottom: "1px solid #e1e7ee", background: "linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)", borderRadius: "8px 8px 0 0" }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px dashed #d3dfea' }}>
                  <Text strong style={{ color: '#476481', display: 'block', marginBottom: 8 }}>Mẹo hệ thống:</Text>
                  <Text style={{ color: '#6b7c93' }}>Hãy kiểm tra định mức (Quota) ở tab <strong>Cấu hình đề xuất</strong> trước khi tạo phiếu mua hàng mới để tránh bị cảnh báo vượt ngân sách.</Text>
               </div>
               <div style={{ padding: 16, background: '#f0fdfa', borderRadius: 8, border: '1px solid #ccfbf1' }}>
                  <Text strong style={{ color: '#0d9488', display: 'block', marginBottom: 8 }}>Trợ giúp:</Text>
                  <Text style={{ color: '#115e59' }}>Luồng duyệt mặc định yêu cầu 2 cấp: <strong>Trưởng đơn vị</strong> &rarr; <strong>Kiểm soát</strong> trước khi chốt đơn.</Text>
               </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};