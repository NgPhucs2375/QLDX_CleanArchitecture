import { useShow, useOne, useMany } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tag, Card, Space, Descriptions, Table, Row, Col } from "antd";
import { InfoCircleOutlined, UnorderedListOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import "../../assets/proposal-config.css"; 

const { Title, Text } = Typography;

const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: "Bản nháp", color: "default" },
    2: { label: "Đang hiệu lực", color: "success" },
    3: { label: "Vô hiệu hóa", color: "error" },
};

export const ShowProposalConfig = () => {
    const { queryResult: { data, isLoading } } = useShow();
    const record = data?.data as any;
    const status = record?.Status || record?.status;

    // Fix lỗi 1: Bao phủ toàn bộ các trường hợp API trả về (PascalCase & camelCase)
    const configCategories = record?.ConfigCategories || record?.configCategories || record?.Categories || record?.categories || [];
    const configApprovers = record?.ConfigApprovers || record?.configApprovers || record?.Approves || record?.approves || [];
    
    const userId = record?.CreatedBy || record?.createdBy;

    // 1. Lấy thông tin Người tạo
    const { data: userData, isLoading: userLoading } = useOne({
        resource: "users", 
        id: userId,
        queryOptions: { enabled: !!userId }
    });
    const creatorName = userData?.data 
        ? `${userData.data.FirstName || userData.data.firstName} ${userData.data.LastName || userData.data.lastName}` 
        : userId;

    // 2. Thu thập ID để tra cứu
    const categoryIds = [...new Set(configCategories.map((c: any) => c.CategoryId || c.categoryId).filter(Boolean))] as (string | number)[];
    const deptIds = [...new Set([...configCategories, ...configApprovers].map((item: any) => item.DepartmentId || item.departmentId).filter(Boolean))] as (string | number)[];
    const approverIds = [...new Set(configApprovers.map((a: any) => a.ApproverId || a.approverId).filter(Boolean))] as (string | number)[];

    // 3. Tra cứu Tên
    const { data: categoryData, isFetching: catFetching } = useMany({ 
        resource: "categories", 
        ids: categoryIds, 
        queryOptions: { enabled: categoryIds.length > 0 } 
    });
    const { data: deptData, isFetching: deptFetching } = useMany({ 
        resource: "departments", 
        ids: deptIds, 
        queryOptions: { enabled: deptIds.length > 0 } 
    });
    const { data: approverData, isFetching: approverFetching } = useMany({ 
        resource: "users", 
        ids: approverIds, 
        queryOptions: { enabled: approverIds.length > 0 } 
    });

    return (
        <Show 
            isLoading={isLoading} 
            title={<Title level={3} className="pc-m-0 pc-text-ocean pc-font-bold">Chi tiết cấu hình đề xuất</Title>}
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Space direction="vertical" size="large" className="pc-w-100">
                        
                        {/* THÔNG TIN CHUNG (Vẫn giữ loading cho Card chính vì đây là thông tin cốt lõi) */}
                        <Card loading={isLoading} className="pc-card pc-card-ocean" 
                            title={<Space><InfoCircleOutlined className="pc-text-ocean" style={{ fontSize: '20px' }} /><Text strong className="pc-text-ocean" style={{ fontSize: '18px' }}>Thông tin thiết lập chung</Text></Space>}
                        >
                            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered size="middle" labelStyle={{ fontWeight: 'bold', color: '#64748b' }}>
                                <Descriptions.Item label="Mã Cấu Hình">
                                    <Text strong className="pc-text-ocean">{record?.Code || record?.code}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên Cấu Hình">
                                    <Text strong>{record?.Name || record?.name}</Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Ngày Hiệu Lực">
                                    {(record?.EffectiveDate || record?.effectiveDate) ? <DateField value={record?.EffectiveDate || record?.effectiveDate} format="DD/MM/YYYY" /> : "—"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng Thái">
                                    {status != null && <Tag color={statusMap[status]?.color} className="pc-tag-rounded" style={{ padding: '4px 12px', fontSize: '14px' }}>{statusMap[status]?.label}</Tag>}
                                </Descriptions.Item>

                                <Descriptions.Item label="Người Tạo">
                                    <Text>{userLoading ? "Đang tải..." : creatorName}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày Tạo">
                                    {(record?.Created || record?.created) ? <DateField value={record?.Created || record?.created} format="DD/MM/YYYY" /> : "—"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* DANH SÁCH NGƯỜI DUYỆT (Fix lỗi 2: Bỏ loading của Card, đẩy xuống Table) */}
                        <Card className="pc-card pc-card-ocean"
                            title={<Space><UsergroupAddOutlined className="pc-text-ocean" style={{ fontSize: '20px' }} /><Text strong className="pc-text-ocean" style={{ fontSize: '18px' }}>Danh sách người duyệt (Kiểm soát)</Text></Space>}
                        >
                            <Table 
                                dataSource={configApprovers} 
                                rowKey={(r) => `${r.DepartmentId || r.departmentId}-${r.ApproverId || r.approverId}`} 
                                pagination={false}
                                loading={approverFetching || deptFetching} // Chuyển loading vào đây
                                columns={[
                                    { 
                                        title: "Phòng/Đơn vị", 
                                        render: (_, item: any) => {
                                            const val = item.DepartmentId || item.departmentId;
                                            const name = item.DepartmentName || item.departmentName || item.Department?.Name || item.department?.name || deptData?.data?.find((d: any) => d.Id === val || d.id === val)?.Name || val;
                                            return <Tag color="blue">{name}</Tag>;
                                        } 
                                    },
                                    { 
                                        title: "Tài khoản kiểm soát", 
                                        render: (_, item: any) => {
                                            const val = item.ApproverId || item.approverId;
                                            const name = item.ApproverName || item.approverName || item.User?.UserName || item.user?.userName || approverData?.data?.find((u: any) => u.Id === val || u.id === val)?.UserName || val;
                                            return <Text strong>{name}</Text>;
                                        } 
                                    },
                                    { 
                                        title: "Vai trò luồng", 
                                        render: (_, item: any) => {
                                            const val = item.Role || item.role;
                                            return val ? <Text type="secondary">{val}</Text> : <Text type="secondary">Kiểm soát viên</Text>;
                                        }
                                    }
                                ]}
                            />
                        </Card>

                    </Space>
                </Col>

                {/* CỘT PHẢI: DANH SÁCH DANH MỤC ÁP DỤNG (Fix lỗi 2: Bỏ loading của Card, đẩy xuống Table) */}
                <Col xs={24} lg={10}>
                    <Card className="pc-card pc-card-ocean pc-sticky-sidebar"
                        title={<Space><UnorderedListOutlined className="pc-text-ocean" style={{ fontSize: '20px' }} /><Text strong className="pc-text-ocean" style={{ fontSize: '18px' }}>Danh mục & Định mức</Text></Space>}
                    >
                        <Table 
                            dataSource={configCategories} 
                            rowKey={(r) => `${r.CategoryId || r.categoryId}-${r.DepartmentId || r.departmentId}`}
                            pagination={false}
                            loading={catFetching || deptFetching} // Chuyển loading vào đây
                            columns={[
                                { 
                                    title: "Danh mục áp dụng", 
                                    render: (_, item: any) => {
                                        const val = item.CategoryId || item.categoryId;
                                        const name = item.CategoryName || item.categoryName || item.Category?.Name || item.category?.name || categoryData?.data?.find((c: any) => c.Id === val || c.id === val)?.Name || val;
                                        return <Text strong className="pc-text-ocean">{name}</Text>;
                                    } 
                                },
                                { 
                                    title: "Phòng/Đơn vị", 
                                    render: (_, item: any) => {
                                        const val = item.DepartmentId || item.departmentId;
                                        const name = item.DepartmentName || item.departmentName || item.Department?.Name || item.department?.name || deptData?.data?.find((d: any) => d.Id === val || d.id === val)?.Name || val;
                                        return <Text type="secondary">{name}</Text>;
                                    } 
                                },
                                { 
                                    title: "Hạn mức (Quota)", 
                                    align: "right" as const, 
                                    render: (_, item: any) => {
                                        const val = item.AllowedQuota || item.allowedQuota;
                                        return <Text strong style={{ color: '#0d9488', fontSize: '15px' }}>{(val || 0).toLocaleString("vi-VN")} ₫</Text> 
                                    }
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </Show>
    );
};