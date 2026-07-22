import { useForm, Create, useSelect } from "@refinedev/antd";
import { useCreate, useGetIdentity, useNavigation, HttpError } from "@refinedev/core";
import { Form, Input, Select, InputNumber, Typography, App, Row, Col, Button, Tooltip, Card, Space, Table, Tag, Alert, Divider } from "antd";
import { useState, useRef, useEffect } from "react";
import { TeamOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, AppstoreOutlined, DownOutlined, InfoCircleOutlined, EnvironmentOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import type { IPurchaseRequest, ICascadeProduct, ICascadeCreateData, ICreatePayload, ISelectedCategory } from "./types";
import { dataProvider } from "../../providers/data-provider";
import "../../assets/purchase-request.css";

const { Text, Title } = Typography;
const { TextArea } = Input;

let rowIdCounter = 0;
const generateRowId = () => `r_${Date.now()}_${++rowIdCounter}`;
const fmtVnd = (n: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

function mapPascalToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(mapPascalToCamel);
  if (obj !== null && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const camel = key.charAt(0).toLowerCase() + key.slice(1);
      out[camel] = mapPascalToCamel(val);
    }
    return out;
  }
  return obj;
}

interface IExtendedItem { productId: number; code: string; productName: string; unitPrice: number; unit: string; proposedQuantity: number; note: string; rowId: string; }

export const CreatePurchaseRequest = () => {
    const { formProps } = useForm<IPurchaseRequest, HttpError>({ redirect: "list" });
    const { mutate: createMutate, isLoading: isCreating } = useCreate<IPurchaseRequest, HttpError, ICreatePayload>();
    const { message } = App.useApp();
    const { data: identity } = useGetIdentity<{ userId: number; departmentId: number; name: string }>();
    const { list } = useNavigation();

    const selectedDepartmentId = Form.useWatch("DepartmentId", formProps.form);

    const [cascadeData, setCascadeData] = useState<ICascadeCreateData>({ categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" });
    const [selectedApproverId, setSelectedApproverId] = useState<string>("");
    const [loadingCascade, setLoadingCascade] = useState(false);
    
    const [selectedCategories, setSelectedCategories] = useState<(Omit<ISelectedCategory, 'items'> & { items: IExtendedItem[] })[]>([]);
    
    const [productsCache, setProductsCache] = useState<Record<number, ICascadeProduct[]>>({});
    const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});
    const selectedRef = useRef(selectedCategories);

    useEffect(() => { selectedRef.current = selectedCategories; }, [selectedCategories]);
    useEffect(() => { if (identity?.departmentId && !formProps.form?.getFieldValue("DepartmentId")) { formProps.form?.setFieldValue("DepartmentId", identity.departmentId); } }, [identity, formProps.form]);

    const { selectProps: configSelectProps } = useSelect({ resource: "proposal-configs", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" } });
    const { selectProps: deptSelectProps } = useSelect({ resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" } });
    const { selectProps: userSelectProps } = useSelect({ resource: "users", optionLabel: "UserName", optionValue: "Id", pagination: { mode: "off" } });

    const handleConfigChange = async () => {
        const configId = formProps.form?.getFieldValue("ProposalConfigId");
        const deptId = formProps.form?.getFieldValue("DepartmentId");
        if (!configId || !deptId) return;

        setLoadingCascade(true);
        setSelectedCategories([]);
        try {
            const result = await dataProvider.custom({ url: `/api/purchase-requests/cascade-create?ProposalConfigId=${configId}&DepartmentId=${deptId}`, method: "get" });
            const data = mapPascalToCamel(result.data ?? { categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" }) as ICascadeCreateData;
            setCascadeData(data);
            setSelectedApproverId(data.departmentManagerId || (data.departmentHeads?.[0]?.approverId ?? ""));
        } catch (error) { message.error((error as HttpError)?.message || "Không thể tải danh mục"); } finally { setLoadingCascade(false); }
    };

    const loadProducts = async (catId: number): Promise<ICascadeProduct[]> => {
        if (productsCache[catId]) return productsCache[catId];
        try {
            const result = await dataProvider.custom({ url: `/api/purchase-requests/cascade-products?CategoryId=${catId}`, method: "get" });
            const list = (mapPascalToCamel(result.data ?? []) as ICascadeProduct[]) ?? [];
            setProductsCache((prev) => ({ ...prev, [catId]: list }));
            return list;
        } catch { return []; }
    };

    const addCategory = async (catId: number) => {
        if (loadingCategories[catId]) return;
        const cat = cascadeData.categories.find((c) => c.categoryId === catId);
        if (!cat || selectedRef.current.some((s) => s.categoryId === catId)) return;

        setLoadingCategories((prev) => ({ ...prev, [catId]: true }));
        setSelectedCategories((prev) => [...prev, { categoryId: cat.categoryId, categoryName: cat.categoryName, allowedQuota: cat.allowedQuota, items: [] }]);
        await loadProducts(catId);
        setLoadingCategories((prev) => ({ ...prev, [catId]: false }));
    };

    const removeCategory = (catId: number) => setSelectedCategories(prev => prev.filter(c => c.categoryId !== catId));

    const updateItemField = (categoryId: number, rowId: string, field: keyof IExtendedItem, val: string | number | null) => {
        setSelectedCategories((prev) => prev.map((cat) => { if (cat.categoryId !== categoryId) return cat; return { ...cat, items: cat.items.map((item) => item.rowId === rowId ? { ...item, [field]: val } : item ) }; }));
    };

    const removeItem = (categoryId: number, rowId: string) => {
        setSelectedCategories((prev) => prev.map((cat) => { if (cat.categoryId !== categoryId) return cat; return { ...cat, items: cat.items.filter((item) => item.rowId !== rowId) }; }));
    };

    const handleSubmit = async () => {
        try {
            const values = await formProps.form?.validateFields() as IPurchaseRequest | undefined;
            if (!values) return;
            const validCategories = selectedCategories.filter((c) => c.items.length > 0);
            if (validCategories.length === 0) return message.error("Vui lòng thêm ít nhất 1 danh mục có sản phẩm!");

            const overQuotaCategories = validCategories.filter((c) => c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0) > c.allowedQuota);
            if(overQuotaCategories.length > 0) return message.error(`Các danh mục vượt định mức: ${overQuotaCategories.map(c => c.categoryName).join(", ")}`);

            const payload: ICreatePayload = { code: values.Code, departmentId: values.DepartmentId, proposalConfigId: values.ProposalConfigId, approverId: selectedApproverId, categories: validCategories.map((c) => ({ categoryId: c.categoryId, items: c.items.map((i) => ({ productId: i.productId, proposedQuantity: i.proposedQuantity })) })), };
            createMutate({ resource: "purchase-requests", values: payload, successNotification: () => ({ message: "Tạo phiếu thành công", type: "success" }) }, { onSuccess: () => list("purchase-requests"), onError: (error: HttpError) => message.error(error?.message || "Có lỗi xảy ra") });
        } catch { message.warning("Vui lòng kiểm tra lại các trường thông tin bắt buộc!"); }
    };

    const cascadeAvailable = cascadeData.categories.length > 0;
    const totalProposed = selectedCategories.reduce((s, c) => s + c.items.reduce((s2, i) => s2 + i.unitPrice * i.proposedQuantity, 0), 0);
    const totalItems = selectedCategories.reduce((s, c) => s + c.items.length, 0);

    return (
        <Create
            title={<Title level={3} className="pr-m-0 pr-text-emerald">Tạo Phiếu Đề Xuất</Title>}
            footerButtons={({ saveButtonProps }) => (
                <Button type="primary" {...saveButtonProps} onClick={handleSubmit} loading={isCreating}
                    size="large" className="pr-bg-emerald-light pr-text-emerald pr-border-emerald"
                    style={{ minWidth: 200, height: 44, fontSize: 16 }}>
                    <SaveOutlined /> Lưu phiếu đề xuất
                </Button>
            )}
        >
            <Form {...formProps} layout="vertical" className="pr-container">
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Card title={<Space><InfoCircleOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Thông tin đề xuất</Text></Space>} className="pr-card pr-card-emerald">
                            <Form.Item name="Code" label="Tên/Mã đề xuất" rules={[{ required: true, message: "Vui lòng nhập tên/mã đề xuất!" }]}>
                                <Input placeholder="Văn phòng phẩm..." />
                            </Form.Item>
                            <Form.Item name="DepartmentId" label="Phòng/Đơn vị áp dụng" rules={[{ required: true, message: "Bắt buộc chọn đơn vị!" }]}>
                                <Select options={deptSelectProps.options} showSearch placeholder="Chọn phòng ban..." onChange={handleConfigChange} />
                            </Form.Item>
                            <Form.Item name="ProposalConfigId" label="Cấu hình định mức" rules={[{ required: true, message: "Bắt buộc chọn cấu hình!" }]}>
                                <Select options={configSelectProps.options} showSearch placeholder={selectedDepartmentId ? "Chọn cấu hình áp dụng..." : "Vui lòng chọn Phòng ban trước"} disabled={!selectedDepartmentId} onChange={handleConfigChange} />
                            </Form.Item>
                            <Form.Item name="Reason" label="Lý do">
                                <TextArea rows={3} placeholder="Nhập lý do thực hiện đề xuất..." />
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title={<Space><EnvironmentOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Thông tin nhận hàng</Text></Space>} className="pr-card pr-card-emerald">
                            <Form.Item name="ContactName" label={<Space><Text className="pr-text-danger">*</Text><Text>Người liên hệ</Text></Space>} rules={[{ required: true }]}>
                                <Input placeholder="Họ và tên..." />
                            </Form.Item>
                            <Form.Item name="ContactPhone" label={<Space><Text className="pr-text-danger">*</Text><Text>Số điện thoại</Text></Space>} rules={[{ required: true }]}>
                                <Input placeholder="09xxxxxxxxx" />
                            </Form.Item>
                            <Form.Item name="ShippingAddress" label={<Space><Text className="pr-text-danger">*</Text><Text>Địa chỉ nhận hàng</Text></Space>} rules={[{ required: true }]}>
                                <TextArea rows={3} placeholder="Nhập chi tiết địa chỉ giao hàng..." />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                {cascadeAvailable && (
                    <Card className="pr-card pr-card-emerald"
                        title={<Space><TeamOutlined className="pr-text-emerald" /><Text strong className="pr-text-emerald">Quy trình duyệt</Text></Space>}>
                        <Row gutter={24}>
                            <Col xs={24} md={8}>
                                <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Tag color="blue">Bước 1</Tag>
                                        <Text strong>Trưởng đơn vị</Text>
                                    </div>
                                    <Select
                                        value={selectedApproverId || undefined}
                                        onChange={(val) => setSelectedApproverId(val)}
                                        options={userSelectProps.options}
                                        showSearch
                                        placeholder="Chọn Trưởng đơn vị..."
                                        style={{ width: '100%' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Tag color="purple">Bước 2</Tag>
                                        <Text strong>Kiểm soát</Text>
                                    </div>
                                    <Space wrap>
                                        {cascadeData.approvers.filter((a) => a.role !== "Trưởng đơn vị").map((a, idx) => (
                                            <Tag key={idx} color="geekblue" style={{ padding: '4px 12px', fontSize: 14 }}>
                                                {a.approverName || a.approverId}
                                            </Tag>
                                        ))}
                                    </Space>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Tag color="green">Bước 3</Tag>
                                        <Text strong>Người tạo</Text>
                                    </div>
                                    <Tag color="green" style={{ padding: '4px 12px', fontSize: 14 }}>
                                        {identity?.name || identity?.userId || "Bạn"}
                                    </Tag>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                )}

                {cascadeAvailable && (
                    <Card loading={loadingCascade}
                        title={<Space><AppstoreOutlined className="pr-text-emerald" /><Text strong className="pr-text-emerald">Danh mục hàng hóa</Text></Space>}
                        extra={totalItems > 0 ? <Text strong className="pr-text-emerald">Tổng đề xuất: {fmtVnd(totalProposed)}</Text> : null}
                        className="pr-card pr-card-emerald">
                        <Select
                            mode="multiple"
                            className="pr-w-100"
                            placeholder="Nhấn vào đây để chọn danh mục cần mua..."
                            value={selectedCategories.map(c => c.categoryId)}
                            onChange={async (newSelectedIds: number[]) => {
                                const removedIds = selectedCategories.map(c => c.categoryId).filter(id => !newSelectedIds.includes(id));
                                removedIds.forEach(id => removeCategory(id));
                                const addedIds = newSelectedIds.filter(id => !selectedCategories.some(c => c.categoryId === id));
                                for (const id of addedIds) { await addCategory(id); }
                            }}
                            prefix={<AppstoreOutlined className="pr-text-secondary pr-mr-8" />}
                            suffixIcon={<DownOutlined />}
                            maxTagCount="responsive"
                            options={cascadeData.categories.map((c) => ({ label: `${c.categoryName} (Định mức: ${fmtVnd(c.allowedQuota)})`, value: c.categoryId }))}
                            filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                        />

                        {totalItems > 0 && (
                            <Alert
                                type="info"
                                showIcon
                                icon={<ShoppingCartOutlined />}
                                message={
                                    <Space size="large" wrap>
                                        <Text>Số danh mục: <Text strong>{selectedCategories.filter(c => c.items.length > 0).length}</Text></Text>
                                        <Text>Số sản phẩm: <Text strong>{totalItems}</Text></Text>
                                        <Text>Tổng tiền: <Text strong className="pr-text-emerald" style={{ fontSize: 16 }}>{fmtVnd(totalProposed)}</Text></Text>
                                    </Space>
                                }
                                style={{ marginTop: 16, marginBottom: 16 }}
                            />
                        )}

                        <Space direction="vertical" size="large" className="pr-w-100">
                            {selectedCategories.map((cat) => {
                                const prods = productsCache[cat.categoryId] ?? [];
                                const subtotal = cat.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0);
                                const quotaDiff = cat.allowedQuota - subtotal;

                                const tableColumns = [
                                    { title: "Sản phẩm", dataIndex: "productId", width: 320, render: (_: number, item: IExtendedItem) => (
                                        <Select
                                            value={item.productId || null}
                                            onChange={(val: number) => {
                                                const product = prods.find((p) => p.id === val);
                                                if (!product) return;
                                                setSelectedCategories((prev) => prev.map((c) => c.categoryId !== cat.categoryId ? c : { ...c, items: c.items.map((i) => i.rowId === item.rowId ? { ...i, productId: product.id, code: product.code, productName: product.name, unitPrice: product.unitPrice, unit: product.unit } : i ) }));
                                            }}
                                            options={prods.map((p) => ({
                                                label: p.name,
                                                value: p.id,
                                                disabled: cat.items.some(i => i.productId === p.id && i.rowId !== item.rowId)
                                            }))}
                                            className="pr-w-100"
                                            placeholder="Chọn sản phẩm..."
                                            showSearch
                                            filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                                        />
                                    )},
                                    { title: "SL", dataIndex: "proposedQuantity", width: 100, align: "center" as const, render: (val: number, item: IExtendedItem) => (
                                        <InputNumber min={1} value={val} onChange={(v) => updateItemField(cat.categoryId, item.rowId, 'proposedQuantity', v ?? 1)} style={{ width: '100%' }} />
                                    )},
                                    { title: "Đơn giá (₫)", align: "right" as const, width: 120, render: (_: any, item: IExtendedItem) => (
                                        <Text>{item.productId ? (item.unitPrice || 0).toLocaleString("vi-VN") : "—"}</Text>
                                    )},
                                    { title: "Thành tiền (₫)", align: "right" as const, width: 140, render: (_: IExtendedItem) => (
                                        <Text className="ppr-text-teal" strong style={{fontSize: '15px'}}>{_.productId ? ((_.unitPrice * _.proposedQuantity) || 0).toLocaleString("vi-VN") : "—"}</Text>
                                    )},
                                    { title: "Ghi chú", width: 130, render: (_: any, item: IExtendedItem) => (
                                        <Input size="small" value={item.note} onChange={(e) => updateItemField(cat.categoryId, item.rowId, 'note', e.target.value)} placeholder="Ghi chú..." />
                                    )},
                                    { title: "", align: "center" as const, width: 50, render: (_: IExtendedItem) => (
                                        <Tooltip title="Xóa dòng này">
                                            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeItem(cat.categoryId, _.rowId)} />
                                        </Tooltip>
                                    )}
                                ];

                                return (
                                    <Card key={cat.categoryId} className="pr-card" size="small"
                                        title={<Text strong className="pr-text-emerald">{cat.categoryName}</Text>}
                                        extra={<Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeCategory(cat.categoryId)} />}>
                                        <Table dataSource={cat.items} columns={tableColumns} rowKey="rowId" pagination={false} size="small" />
                                        <Button type="dashed" block icon={<PlusOutlined />} className="pr-mt-12" onClick={() => {
                                            setSelectedCategories((prev) => prev.map((c) => c.categoryId !== cat.categoryId ? c : { ...c, items: [...c.items, { productId: 0, code: "", productName: "", unitPrice: 0, unit: "", proposedQuantity: 1, note: "", rowId: generateRowId() }] }));
                                        }}>
                                            Bổ sung sản phẩm
                                        </Button>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <Space size="large" className="pr-w-100" style={{ justifyContent: 'flex-end' }}>
                                            <Text className="pr-text-secondary">Định mức: <Text strong>{fmtVnd(cat.allowedQuota)}</Text></Text>
                                            <Text className="pr-text-secondary">Tạm tính: <Text strong className="pr-text-emerald">{fmtVnd(subtotal)}</Text></Text>
                                            <Text className="pr-text-secondary">Chênh lệch: <Text strong className={quotaDiff < 0 ? 'pr-text-danger' : 'pr-text-success'}> {quotaDiff >= 0 ? "+" : ""}{fmtVnd(quotaDiff)}</Text></Text>
                                        </Space>
                                    </Card>
                                );
                            })}
                        </Space>
                    </Card>
                )}
            </Form>
        </Create>
    );
};
