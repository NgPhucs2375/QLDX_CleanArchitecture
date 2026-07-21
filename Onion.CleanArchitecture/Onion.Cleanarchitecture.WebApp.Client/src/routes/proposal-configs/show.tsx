import { useShow, useOne } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tag, Card, Space, Descriptions, Table, Row, Col } from "antd";
import { InfoCircleOutlined, UnorderedListOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import "../../assets/proposal-config.css"; // CSS riêng biệt cho Proposal Config

const { Title, Text } = Typography;

// Mapping trạng thái (Giả định Status 2 là Hiệu lực dựa trên data bạn gửi)
const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: "Nháp", color: "default" },
    2: { label: "Đang hiệu lực", color: "green" },
    3: { label: "Vô hiệu hóa", color: "red" },
};

export const ShowProposalConfig = () => {
    const { queryResult: { data, isLoading } } = useShow();
    const record = data?.data as any;
    const status = record?.Status;

    // Map lại đúng tên trường từ JSON của Backend
    const configCategories = record?.ConfigCategories || [];
    const configApprovers = record?.ConfigApprovers || [];
    const userId = record?.CreatedBy;

    // Tự động fetch thông tin User dựa vào trường CreatedBy
    const { data: userData, isLoading: userLoading } = useOne({
        resource: "users", // Giả định endpoint của bạn là users
        id: userId,
        queryOptions: { enabled: !!userId, }
    });
    
    // Nối FirstName và LastName của UserS
    const creatorName = userData?.data 
        ? `${userData.data.FirstName} ${userData.data.LastName}` 
        : record?.CreatedBy;

    return (
        <Show 
            isLoading={isLoading} 
            title={<Title level={3} className="pr-m-0 pr-text-emerald">Chi tiết Cấu Hình Đề Xuất</Title>}
        >
            <Row gutter={[24, 24]}>
                {/* CỘT TRÁI: THÔNG TIN QUY CHIẾU & NGƯỜI DUYỆT */}
                <Col xs={24} lg={14}>
                    <Space direction="vertical" size="large" className="pr-w-100">
                        
                        {/* THÔNG TIN CHUNG */}
                        <Card loading={isLoading} className="pr-card pr-card-emerald" 
                            title={<Space><InfoCircleOutlined className="pr-text-emerald" style={{ fontSize: '20px' }} /><Text strong className="pr-text-emerald" style={{ fontSize: '18px' }}>Thông tin quy chiếu</Text></Space>}
                        >
                            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered size="middle" labelStyle={{ fontWeight: 'bold', color: '#64748b' }}>
                                <Descriptions.Item label="Mã Cấu Hình">
                                    <Text strong className="pr-text-emerald">{record?.Code}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên Cấu Hình">
                                    <Text strong>{record?.Name}</Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Ngày Hiệu Lực">
                                    {record?.EffectiveDate ? <DateField value={record?.EffectiveDate} format="DD/MM/YYYY - HH:mm" /> : "—"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng Thái">
                                    {status != null && <Tag color={statusMap[status]?.color} style={{ padding: '4px 12px', fontSize: '14px' }}>{statusMap[status]?.label}</Tag>}
                                </Descriptions.Item>

                                <Descriptions.Item label="Người Tạo">
                                    <Text>{userLoading ? "Đang tải..." : creatorName}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày Tạo">
                                    {record?.Created ? <DateField value={record?.Created} format="DD/MM/YYYY" /> : "—"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* DANH SÁCH NGƯỜI DUYỆT */}
                        <Card loading={isLoading} className="pr-card"
                            title={<Space><UsergroupAddOutlined style={{ color: '#0284c7', fontSize: '20px' }} /><Text strong style={{ fontSize: '18px' }}>Danh sách Người duyệt</Text></Space>}
                        >
                            <Table 
                                dataSource={configApprovers} 
                                rowKey="Id" 
                                pagination={false}
                                columns={[
                                    { title: "Thứ tự duyệt", dataIndex: "StepOrder", align: "center" as const, render: (val) => <Tag color="blue">Bước {val}</Tag> },
                                    { title: "Mã Người Duyệt / Vai Trò", dataIndex: "ApproverId", render: (val) => <Text strong>{val}</Text> },
                                    { title: "Vai trò luồng", dataIndex: "Role", align: "center" as const }
                                ]}
                            />
                        </Card>

                    </Space>
                </Col>

                {/* CỘT PHẢI: DANH SÁCH DANH MỤC ÁP DỤNG */}
                <Col xs={24} lg={10}>
                    <Card loading={isLoading} className="pr-card pr-bg-emerald-light pr-border-emerald pr-sticky-sidebar"
                        title={<Space><UnorderedListOutlined className="pr-text-emerald" style={{ fontSize: '20px' }} /><Text strong className="pr-text-emerald" style={{ fontSize: '18px' }}>Danh mục áp dụng</Text></Space>}
                    >
                        <Table 
                            dataSource={configCategories} 
                            rowKey="Id" 
                            pagination={false}
                            columns={[
                                { title: "Mã Danh Mục", dataIndex: "CategoryId", render: (val) => <Text strong className="pr-text-teal">{val}</Text> },
                                { title: "Hạn mức (Quota)", dataIndex: "AllowedQuota", align: "right" as const, render: (val) => <Text strong>{(val || 0).toLocaleString("vi-VN")} ₫</Text> }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </Show>
    );
};