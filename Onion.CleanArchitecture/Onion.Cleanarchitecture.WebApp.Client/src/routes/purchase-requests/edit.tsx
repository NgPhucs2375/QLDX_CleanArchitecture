import { useForm, Edit, useSelect } from "@refinedev/antd";
import { useGetIdentity, HttpError } from "@refinedev/core";
import { Form, Input, Select, InputNumber, Typography, App, Row, Col, Button, Tooltip, Card, Space, Table, Tag, Alert, Divider } from "antd";
import { useState, useRef, useEffect } from "react";
import { TeamOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, AppstoreOutlined, DownOutlined, InfoCircleOutlined, EnvironmentOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import type { IPurchaseRequest, ICascadeProduct, ICascadeCreateData, ISelectedCategory } from "./types";
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

interface IExtendedItem { id?: number; productId: number; code: string; productName: string; unitPrice: number; unit: string; proposedQuantity: number; note: string; rowId: string; }

export const EditPurchaseRequest = () => {
    const { formProps, saveButtonProps, queryResult } = useForm<IPurchaseRequest, HttpError, any>({ redirect: "show" });
    console.log("1. Trạng thái gọi API:", queryResult?.isLoading, queryResult?.isFetching);
    console.log("2. Dữ liệu thô từ Refine:", queryResult?.data);

    const initialData = queryResult?.data?.data as any;
    const { message } = App.useApp();
    const { data: identity } = useGetIdentity<{ userId: number; departmentId: number; name: string }>();

    const selectedDepartmentId = Form.useWatch("DepartmentId", formProps.form);

    const [cascadeData, setCascadeData] = useState<ICascadeCreateData>({ categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" });
    const [selectedApproverId, setSelectedApproverId] = useState<string | number | undefined>(undefined);
    const [loadingCascade, setLoadingCascade] = useState(false);
    
    const [selectedCategories, setSelectedCategories] = useState<(Omit<ISelectedCategory, 'items'> & { items: IExtendedItem[] })[]>([]);
    
    const [productsCache, setProductsCache] = useState<Record<number, ICascadeProduct[]>>({});
    const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});
    
    const selectedRef = useRef(selectedCategories);
    const hasLoadedInitialData = useRef(false);

    useEffect(() => { selectedRef.current = selectedCategories; }, [selectedCategories]);
    
    useEffect(() => {
        if (initialData && (initialData.Id || initialData.id) && !hasLoadedInitialData.current) {
            console.log("✅ Đã nhận data thật:", initialData);
            const formValues = {
                Code: initialData.Code || initialData.code,
                DepartmentId: initialData.DepartmentId || initialData.departmentId,
                ProposalConfigId: initialData.ProposalConfigId || initialData.proposalConfigId,
                Reason: initialData.Reason || initialData.reason,
                ContactName: initialData.ContactName || initialData.contactName,
                ContactPhone: initialData.ContactPhone || initialData.contactPhone,
                ShippingAddress: initialData.ShippingAddress || initialData.shippingAddress,
            };
            formProps.form?.setFieldsValue(formValues);

            const deptId = formValues.DepartmentId;
            const configId = formValues.ProposalConfigId;

            if (deptId && configId) {
                setLoadingCascade(true);
                dataProvider.custom({ url: `/api/purchase-requests/cascade-create?ProposalConfigId=${configId}&DepartmentId=${deptId}`, method: "get" })
                .then(result => {
                    const data = mapPascalToCamel(result.data ?? { categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" }) as ICascadeCreateData;
                    // FIX: Lọc bỏ danh mục trùng lặp từ API để Select không bị trùng key
                    if (data.categories) {
                        data.categories = data.categories.filter((cat, index, self) => index === self.findIndex((c) => c.categoryId === cat.categoryId));
                    }
                    setCascadeData(data);
                    
                    const savedApproverId = initialData.ApproverId || initialData.approverId; 
                    setSelectedApproverId(savedApproverId || data.departmentManagerId || (data.departmentHeads?.[0]?.approverId ?? undefined));
                })
                .catch(() => message.error("Không thể tải cấu hình phê duyệt hiện tại"))
                .finally(() => setLoadingCascade(false));
            }

            const existingCats = initialData.Categories || initialData.categories || initialData.RequestCategories || initialData.requestCategories || [];
            const mappedCats = existingCats.map((cat: any) => {
                const catId = cat.CategoryId || cat.categoryId || cat.Id || cat.id;
                loadProducts(catId);
                return {
                    categoryId: catId,
                    categoryName: cat.Category?.Name || cat.category?.name || cat.Name || cat.name || "Danh mục",
                    allowedQuota: cat.Category?.AllowedQuota || cat.category?.allowedQuota || cat.AllowedQuota || cat.allowedQuota || 0,
                    items: (cat.RequestItems || cat.requestItems || []).map((item: any) => ({
                        id: item.Id || item.id,
                        productId: item.ProductId || item.productId,
                        code: item.Product?.Code || item.product?.code || "",
                        productName: item.Product?.Name || item.product?.name || "",
                        unitPrice: item.UnitPrice || item.unitPrice || 0,
                        unit: item.Product?.Unit || item.product?.unit || "",
                        proposedQuantity: item.ProposedQuantity || item.proposedQuantity || 1,
                        note: item.Note || item.note || "",
                        rowId: generateRowId()
                    }))
                };
            });
            setSelectedCategories(mappedCats);
            hasLoadedInitialData.current = true;
        }
    }, [initialData, formProps.form]);

    const { selectProps: configSelectProps } = useSelect({ resource: "proposal-configs", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" } });
    const { selectProps: deptSelectProps } = useSelect({ resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" } });
    const { selectProps: userSelectProps } = useSelect({ resource: "users", optionLabel: "UserName", optionValue: "Id", pagination: { mode: "off" } });

    const handleConfigChange = async () => {
        const configId = formProps.form?.getFieldValue("ProposalConfigId");
        const deptId = formProps.form?.getFieldValue("DepartmentId");
        if (!configId || !deptId) return;

        setLoadingCascade(true);
        try {
            const result = await dataProvider.custom({ url: `/api/purchase-requests/cascade-create?ProposalConfigId=${configId}&DepartmentId=${deptId}`, method: "get" });
            const data = mapPascalToCamel(result.data ?? { categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" }) as ICascadeCreateData;
            // FIX: Lọc bỏ danh mục trùng lặp từ API để Select không bị trùng key
            if (data.categories) {
                data.categories = data.categories.filter((cat, index, self) => index === self.findIndex((c) => c.categoryId === cat.categoryId));
            }
            setCascadeData(data);
            setSelectedApproverId(data.departmentManagerId || (data.departmentHeads?.[0]?.approverId ?? ""));
            message.info("Đã cập nhật lại luồng phê duyệt theo cấu hình mới!");
        } catch (error) { 
            message.error((error as HttpError)?.message || "Không thể tải cấu hình mới"); 
        } finally { 
            setLoadingCascade(false); 
        }
    };

    const loadProducts = async (catId: number): Promise<ICascadeProduct[]> => {
        if (productsCache[catId]) return productsCache[catId];
        try {
            const result = await dataProvider.custom({ url: `/api/purchase-requests/cascade-products?CategoryId=${catId}`, method: "get" });
            const list = (mapPascalToCamel(result.data ?? []) as ICascadeProduct[]) ?? [];
            // FIX: Lọc bỏ sản phẩm trùng lặp từ API
            const uniqueList = list.filter((prod, index, self) => index === self.findIndex((p) => p.id === prod.id));
            setProductsCache((prev) => ({ ...prev, [catId]: uniqueList }));
            return uniqueList;
        } catch { return []; }
    };

    const addCategory = async (catId: number) => {
        if (loadingCategories[catId]) return;
        const cat = cascadeData.categories.find((c) => c.categoryId === catId);
        if (!cat) return;
        if (selectedRef.current.some((s) => s.categoryId === catId)) return;

        setLoadingCategories((prev) => ({ ...prev, [catId]: true }));
        setSelectedCategories((prev) => [...prev, { categoryId: cat!.categoryId, categoryName: cat!.categoryName, allowedQuota: cat!.allowedQuota, items: [] }]);
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
            const values = await formProps.form?.validateFields();
            if (!values) return;

            const validCategories = selectedCategories.filter((c) => c.items && c.items.length > 0);
            if (validCategories.length === 0) {
                return message.error("Vui lòng thêm ít nhất 1 danh mục có sản phẩm!");
            }

            const uniqueCategories = validCategories.filter(
                (cat: any, index: number, self: any[]) => 
                    index === self.findIndex((c) => c.categoryId === cat.categoryId)
            );

            const payload = { 
                Id: initialData?.Id,
                ...values,
                approverId: selectedApproverId,
                categories: uniqueCategories.map((c) => {
                    const uniqueItems = c.items.filter(
                        (item: any, index: number, self: any[]) =>
                            index === self.findIndex(
                                (i) => i.productId === item.productId || (i.id !== 0 && i.id === item.id)
                            )
                    );

                    return {
                        categoryId: c.categoryId, 
                        items: uniqueItems.map((i: any) => ({ 
                            id: i.id || 0,
                            productId: i.productId, 
                            proposedQuantity: i.proposedQuantity,
                            note: i.note
                        }))
                    };
                }) 
            };
            
            const allCategoryIds = payload.categories.map((c: any) => c.categoryId);
            const allProductIds = payload.categories.flatMap((c: any) => c.items.map((i: any) => i.productId));
            const allItemIds = payload.categories.flatMap((c: any) => c.items.map((i: any) => i.id)).filter((id: number) => id !== 0);

            const findDuplicate = (arr: any[]) => arr.filter((item, index) => arr.indexOf(item) !== index);

            const dupCategories = findDuplicate(allCategoryIds);
            const dupProducts = findDuplicate(allProductIds);
            const dupItems = findDuplicate(allItemIds);

            if (dupCategories.length > 0) {
                return message.error(`Lỗi frontend: Danh mục có ID ${dupCategories.join(', ')} bị trùng lặp!`);
            }
            if (dupProducts.length > 0) {
                return message.error(`Lỗi frontend: Sản phẩm có ID ${dupProducts.join(', ')} xuất hiện ở nhiều nơi! Vui lòng gộp chung lại.`);
            }
            if (dupItems.length > 0) {
                return message.error(`Lỗi frontend: Chi tiết (Items) có ID ${dupItems.join(', ')} bị trùng lặp!`);
            }

            console.log("Payload gửi lên API:\n", JSON.stringify(payload, null, 2));
            formProps.onFinish?.(payload);

        } catch { 
            message.warning("Vui lòng kiểm tra lại các trường thông tin bắt buộc!"); 
        }
    };

    const cascadeAvailable = cascadeData.categories.length > 0;
    const totalProposed = selectedCategories.reduce((s, c) => s + c.items.reduce((s2, i) => s2 + i.unitPrice * i.proposedQuantity, 0), 0);
    const totalItems = selectedCategories.reduce((s, c) => s + c.items.length, 0);

    return (
        <Edit
            isLoading={queryResult?.isLoading}
            title={<Title level={3} className="pr-m-0 pr-text-emerald">Cập nhật Phiếu Đề Xuất</Title>}
            footerButtons={
                <Button type="primary" onClick={handleSubmit} loading={saveButtonProps.loading}
                    size="large" className="pr-bg-emerald-light pr-text-emerald pr-border-emerald"
                    style={{ minWidth: 200, height: 44, fontSize: 16 }}>
                    <SaveOutlined /> Lưu thay đổi
                </Button>
            }
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
                            <Col xs={24} md={12}>
                                <Text strong className="pr-text-emerald" style={{ display: 'block', marginBottom: 8 }}>
                                    <Tag color="blue">Bước 1</Tag> Trưởng đơn vị
                                </Text>
                                <Select
                                    value={selectedApproverId || undefined}
                                    onChange={(val) => setSelectedApproverId(val)}
                                    options={userSelectProps.options}
                                    showSearch
                                    className="pr-w-100"
                                    placeholder="Chọn Trưởng đơn vị..."
                                    style={{ maxWidth: 400 }}
                                />
                            </Col>
                            {cascadeData.approvers.filter((a) => a.role !== "Trưởng đơn vị").map((a, idx) => (
                                <Col xs={24} md={12} key={idx}>
                                    <Text strong className="pr-text-emerald" style={{ display: 'block', marginBottom: 8 }}>
                                        <Tag color="purple">Bước {idx + 2}</Tag> {a.role}
                                    </Text>
                                    <Tag color="geekblue" style={{ padding: '4px 12px', fontSize: 14 }}>
                                        {a.approverName || a.approverId}
                                    </Tag>
                                </Col>
                            ))}
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
                            placeholder="Nhấn vào đây để chọn thêm danh mục..."
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
                            {selectedCategories.map((cat, index) => {
                                const prods = productsCache[cat.categoryId] ?? [];
                                const subtotal = cat.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0);
                                const quotaDiff = cat.allowedQuota > 0 ? cat.allowedQuota - subtotal : 0;

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
                                                label: `${p.name} — ${fmtVnd(p.unitPrice)}${p.unit ? ` / ${p.unit}` : ""}`,
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
                                    { title: "Đơn giá", align: "right" as const, width: 120, render: (_: any, item: IExtendedItem) => (
                                        <Text>{item.productId ? fmtVnd(item.unitPrice) : "—"}</Text>
                                    )},
                                    { title: "Thành tiền", align: "right" as const, width: 140, render: (_: IExtendedItem) => (
                                        <Text className="pr-text-emerald" strong>{_.productId ? fmtVnd(_.unitPrice * _.proposedQuantity) : "—"}</Text>
                                    )},
                                    { title: "Ghi chú", width: 130, render: (_: any, item: IExtendedItem) => (
                                        <Space.Compact style={{ width: '100%' }}>
                                            <Input size="small" value={item.note} onChange={(e) => updateItemField(cat.categoryId, item.rowId, 'note', e.target.value)}
                                                placeholder="Ghi chú..." style={{ width: '100%' }} />
                                            {item.note ? <Tooltip title={item.note}>
                                                <InfoCircleOutlined className="pr-text-emerald" style={{ padding: '0 6px', lineHeight: '22px', fontSize: 14 }} />
                                            </Tooltip> : null}
                                        </Space.Compact>
                                    )},
                                    { title: "", align: "center" as const, width: 50, render: (_: IExtendedItem) => (
                                        <Tooltip title="Xóa dòng này">
                                            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeItem(cat.categoryId, _.rowId)} />
                                        </Tooltip>
                                    )}
                                ];

                                return (
                                    <Card key={`${cat.categoryId}-${index}`} className="pr-card" size="small"
                                        title={<Text strong className="pr-text-emerald">{cat.categoryName}</Text>}
                                        extra={<Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeCategory(cat.categoryId)} />}>
                                        <Table dataSource={cat.items} columns={tableColumns} rowKey="rowId" pagination={false} size="small" />
                                        <Button type="dashed" block icon={<PlusOutlined />} className="pr-mt-12" onClick={() => {
                                            setSelectedCategories((prev) => prev.map((c) => c.categoryId !== cat.categoryId ? c : { ...c, items: [...c.items, { id: 0, productId: 0, code: "", productName: "", unitPrice: 0, unit: "", proposedQuantity: 1, note: "", rowId: generateRowId() }] }));
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
        </Edit>
    );
};