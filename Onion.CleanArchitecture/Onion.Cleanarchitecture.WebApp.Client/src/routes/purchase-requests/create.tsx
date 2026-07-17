import { useForm, Create, useSelect } from "@refinedev/antd";
import { useCreate, useGetIdentity, useNavigation, HttpError } from "@refinedev/core";
import { Form, Input, Select, InputNumber, Typography, App, Spin, Row, Col, Button, Tooltip, Upload } from "antd";
import { useState, useRef, useEffect } from "react";
import {  TeamOutlined, DeleteOutlined, CheckCircleFilled, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import type {
    IPurchaseRequest,
    ICascadeProduct,
    ICascadeCreateData,
    ICreatePayload,
} from "./types";
import { dataProvider } from "../../providers/data-provider";
import { PurchaseRequestForm } from "./form";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface ISelectedItem {
    productId: number;
    code: string;
    productName: string;
    unitPrice: number;
    unit: string;
    proposedQuantity: number;
    note: string;
    rowId: string;
}

interface ISelectedCategory {
    categoryId: number;
    categoryName: string;
    allowedQuota: number;
    items: ISelectedItem[];
}

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

let rowIdCounter = 0;
const generateRowId = () => `r_${Date.now()}_${++rowIdCounter}`;

const fmtNum = (n: number) => n.toLocaleString("vi-VN");
const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

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
    const [selectedCategories, setSelectedCategories] = useState<ISelectedCategory[]>([]);
    const [productsCache, setProductsCache] = useState<Record<number, ICascadeProduct[]>>({});
    const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});
    const selectedRef = useRef(selectedCategories);

    useEffect(() => {
        selectedRef.current = selectedCategories;
    }, [selectedCategories]);

    useEffect(() => {
        if (identity?.departmentId && !formProps.form?.getFieldValue("DepartmentId")) {
            formProps.form?.setFieldValue("DepartmentId", identity.departmentId);
        }
    }, [identity, formProps.form]);

    const { selectProps: configSelectProps } = useSelect({
        resource: "proposal-configs", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
    });
    const { selectProps: deptSelectProps } = useSelect({
        resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
    });

    const handleConfigChange = async () => {
        const configId = formProps.form?.getFieldValue("ProposalConfigId");
        const deptId = formProps.form?.getFieldValue("DepartmentId");
        if (!configId || !deptId) return;

        setLoadingCascade(true);
        setSelectedCategories([]);
        try {
            const result = await dataProvider.custom({
                url: `/api/purchase-requests/cascade-create?ProposalConfigId=${configId}&DepartmentId=${deptId}`,
                method: "get"
            });
            const data = (mapPascalToCamel(result.data ?? { categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" })) as unknown as ICascadeCreateData;
            setCascadeData(data);
            setSelectedApproverId(data.departmentManagerId || (data.departmentHeads?.[0]?.approverId ?? ""));
        } catch (error) { 
            message.error((error as HttpError)?.message || "Không thể tải danh mục");
        } finally {
            setLoadingCascade(false);
        }
    };

    const loadProducts = async (catId: number): Promise<ICascadeProduct[]> => {
        if (productsCache[catId]) return productsCache[catId];
        try {
            const result = await dataProvider.custom({
                url: `/api/purchase-requests/cascade-products?CategoryId=${catId}`,
                method: "get"
            });
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
        setSelectedCategories((prev) => [...prev, {
            categoryId: cat.categoryId, categoryName: cat.categoryName, allowedQuota: cat.allowedQuota, items: [],
        }]);
        await loadProducts(catId);
        setLoadingCategories((prev) => ({ ...prev, [catId]: false }));
    };

    const removeCategory = (catId: number) => {
        setSelectedCategories(prev => prev.filter(c => c.categoryId !== catId));
    };

    const updateItemField = (categoryId: number, rowId: string, field: keyof ISelectedItem, val: string | number | null) => {
        setSelectedCategories((prev) => prev.map((cat) => {
            if (cat.categoryId !== categoryId) return cat;
            return {
                ...cat,
                items: cat.items.map((item) =>
                    item.rowId === rowId ? { ...item, [field]: val } : item
                ),
            };
        }));
    };

    const removeItem = (categoryId: number, rowId: string) => {
        setSelectedCategories((prev) => prev.map((cat) => {
            if (cat.categoryId !== categoryId) return cat;
            return { ...cat, items: cat.items.filter((item) => item.rowId !== rowId) };
        }));
    };

    const handleSubmit = async () => {
        try {
const values = await formProps.form?.validateFields() as { Code: string; DepartmentId: number; ProposalConfigId: number };            const validCategories = selectedCategories.filter((c) => c.items.length > 0);
            if (validCategories.length === 0) {
                message.error("Vui lòng thêm ít nhất 1 danh mục có sản phẩm!");
                return;
            }

            const overQuotaCategories = validCategories.filter((c) => {
                const subtotal = c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0);
                return subtotal > c.allowedQuota;
            });

            if(overQuotaCategories.length > 0){
                message.error(`Các danh mục vượt định mức: ${overQuotaCategories.map(c => c.categoryName).join(", ")}`);
                return; 
            }

            const payload: ICreatePayload = {
                code: values.Code,
                departmentId: values.DepartmentId,
                proposalConfigId: values.ProposalConfigId,
                approverId: selectedApproverId,
                categories: validCategories.map((c) => ({
                    categoryId: c.categoryId,
                    items: c.items.map((i) => ({
                        productId: i.productId,
                        proposedQuantity: i.proposedQuantity,
                    })),
                })),
            };

            createMutate(
                { resource: "purchase-requests", values: payload, successNotification: () => ({ message: "Tạo phiếu thành công", type: "success" }) },
                { onSuccess: () => list("purchase-requests"), onError: (error: HttpError) => message.error(error?.message || "Có lỗi xảy ra") }
            );
        } catch {
            message.warning("Vui lòng kiểm tra lại các trường thông tin bắt buộc!");
        }
    };

    const cascadeAvailable = cascadeData.categories.length > 0;
    const totalProposed = selectedCategories.reduce((s, c) => s + c.items.reduce((s2, i) => s2 + i.unitPrice * i.proposedQuantity, 0), 0);

    return (
        <Create 
            title={<Title level={3} style={{ margin: 0, color: '#2c3e50', fontWeight: 750 }}>Tạo phiếu đề xuất</Title>}
            footerButtons={({ saveButtonProps }) => (
                <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    {...saveButtonProps} 
                    onClick={handleSubmit} 
                    loading={isCreating}
                    style={{ background: '#7a9dc1', borderColor: '#5d82a6', padding: '0 24px', height: 40, fontSize: 15, borderRadius: 6, fontWeight: 600 }}
                >
                    Lưu phiếu đề xuất
                </Button>
            )}
        >
            <Form {...formProps} layout="vertical" className="pr-form">
                <PurchaseRequestForm>
                    <div className="pr-layout">
                        
                        {/* BỐ CỤC 2 CỘT */}
                        <Row gutter={24}>
                            {/* Cột 1: Thông tin đề xuất */}
                            <Col xs={24} lg={12}>
                                <div className="pr-card">
                                    <div className="pr-card-header">
                                        <h3>Thông tin đề xuất</h3>
                                    </div>
                                    <div className="pr-card-body">
                                        <Form.Item name="Code" label="Tên/Mã đề xuất" rules={[{ required: true, message: "Vui lòng nhập tên/mã đề xuất!" }, { max: 100 }]}>
                                            <Input placeholder="Văn phòng phẩm..." />
                                        </Form.Item>
                                        <Form.Item name="DepartmentId" label="Phòng/Đơn vị áp dụng" rules={[{ required: true, message: "Bắt buộc chọn đơn vị!" }]}>
                                            <Select options={deptSelectProps.options} showSearch placeholder="Chọn phòng ban..." onChange={handleConfigChange} filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                                        </Form.Item>
                                        <Form.Item name="ProposalConfigId" label="Cấu hình định mức (Tự động hóa)" rules={[{ required: true, message: "Bắt buộc chọn cấu hình!" }]}>
                                            <Select options={configSelectProps.options} showSearch placeholder={selectedDepartmentId ? "Chọn cấu hình áp dụng..." : "Vui lòng chọn Phòng ban trước"} disabled={!selectedDepartmentId} onChange={handleConfigChange} filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                                        </Form.Item>
                                        <Form.Item name="Reason" label="Lý do">
                                            <TextArea rows={3} placeholder="Nhập lý do thực hiện đề xuất..." />
                                        </Form.Item>
                                        <Form.Item name="Files" style={{ margin: 0 }}>
                                            <Upload action="/api/upload" listType="text" multiple>
                                                <Button icon={<UploadOutlined />} style={{ width: '100%', background: '#7a9dc1', color: '#fff', border: 'none', fontWeight: 600 }}>
                                                    Upload File Đính Kèm
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                    </div>
                                </div>
                            </Col>

                            {/* Cột 2: Thông tin nhận hàng */}
                            <Col xs={24} lg={12}>
                                <div className="pr-card">
                                    <div className="pr-card-header">
                                        <h3>Thông tin nhận hàng</h3>
                                    </div>
                                    <div className="pr-card-body">
                                        <Form.Item name="ContactName" label={<span style={{ color: '#e0534a' }}>* Người liên hệ</span>} rules={[{ required: true, message: "Vui lòng nhập người liên hệ!" }]}>
                                            <Input placeholder="Họ và tên..." />
                                        </Form.Item>
                                        <Form.Item name="ContactPhone" label={<span style={{ color: '#e0534a' }}>* Số điện thoại</span>} rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                                            <Input placeholder="09xxxxxxxxx" />
                                        </Form.Item>
                                        <Form.Item name="ShippingAddress" label={<span style={{ color: '#e0534a' }}>* Địa chỉ nhận hàng</span>} rules={[{ required: true, message: "Vui lòng nhập địa chỉ nhận hàng!" }]}>
                                            <TextArea rows={3} placeholder="Nhập chi tiết địa chỉ giao hàng..." />
                                        </Form.Item>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* DANH MỤC HÀNG HÓA */}
                        {loadingCascade ? (
                            <div className="pr-card" style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
                        ) : cascadeAvailable && (
                            <div className="pr-card">
                                <div className="pr-card-header">
                                    <h3>Danh mục hàng hóa</h3>
                                </div>
                                <div className="pr-card-body">
                                    <Spin spinning={Object.values(loadingCategories).some(Boolean)}>
                                        <div className="pr-chips">
                                            {cascadeData.categories.map((c) => {
                                                const isSelected = selectedCategories.some((s) => s.categoryId === c.categoryId);
                                                return (
                                                    <div 
                                                        key={c.categoryId} 
                                                        className={`pr-chip ${isSelected ? 'readonly' : ''}`}
                                                        onClick={() => !isSelected && addCategory(c.categoryId)}
                                                    >
                                                        {c.categoryName} ({fmtVnd(c.allowedQuota)})
                                                        {isSelected && <CheckCircleFilled />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Spin>
                                </div>
                            </div>
                        )}

                        {/* BẢNG SẢN PHẨM */}
                        <div id="categoryCardsContainer">
                            {selectedCategories.map((cat) => {
                                const prods = productsCache[cat.categoryId] ?? [];
                                const subtotal = cat.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0);
                                const quotaDiff = cat.allowedQuota - subtotal;

                                return (
                                    <div key={cat.categoryId} className="pr-card pr-category-block">
                                        <div className="pr-category-header">
                                            <h4>{cat.categoryName}</h4>
                                            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeCategory(cat.categoryId)}>
                                            </Button>
                                        </div>
                                        
                                        <div className="pr-table-container">
                                            <table className="pr-product-table">
                                                <colgroup>
                                                    <col style={{ width: 130 }} />
                                                    <col style={{ minWidth: 260 }} />
                                                    <col style={{ width: 100 }} />
                                                    <col style={{ width: 120 }} />
                                                    <col style={{ width: 150 }} />
                                                    <col style={{ width: 170 }} />
                                                    <col style={{ minWidth: 200 }} />
                                                    <col style={{ width: 60 }} /> 
                                                </colgroup>
                                                <thead>
                                                    <tr>
                                                        <th>Mã Sản Phẩm</th>
                                                        <th>Tên Sản Phẩm</th>
                                                        <th>ĐVT</th>
                                                        <th>Số Lượng</th>
                                                        <th style={{ textAlign: 'right' }}>Đơn Giá (VNĐ)</th>
                                                        <th style={{ textAlign: 'right' }}>Thành tiền</th>
                                                        <th>Ghi chú</th>
                                                        <th style={{ textAlign: 'center' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cat.items.map((item) => (
                                                        <tr key={item.rowId}>
                                                            <td><span className="pr-nowrap-text" style={{ color: '#8c98a5' }}>{item.code || "—"}</span></td>
                                                            <td>
                                                                <Select
                                                                    value={item.productId || null}
                                                                    onChange={(val: number) => {
                                                                        const product = prods.find((p) => p.id === val);
                                                                        if (!product) return;
                                                                        setSelectedCategories((prev) => prev.map((c) => {
                                                                            if (c.categoryId !== cat.categoryId) return c;
                                                                            return {
                                                                                ...c,
                                                                                items: c.items.map((i) =>
                                                                                    i.rowId === item.rowId
                                                                                        ? { ...i, productId: product.id, code: product.code, productName: product.name, unitPrice: product.unitPrice, unit: product.unit }
                                                                                        : i
                                                                                ),
                                                                            };
                                                                        }));
                                                                    }}
                                                                    options={prods.map((p) => ({ 
                                                                        label: p.name, 
                                                                        value: p.id,
                                                                        disabled: cat.items.some(i => i.productId === p.id && i.rowId !== item.rowId) 
                                                                    }))}
                                                                    style={{ width: '100%' }}
                                                                    placeholder="Chọn sản phẩm..."
                                                                    showSearch
                                                                    filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                                                                />
                                                            </td>
                                                            <td><span className="pr-nowrap-text" style={{ color: '#5c6c7e' }}>{item.unit || "—"}</span></td>
                                                            <td>
                                                                <InputNumber min={1} step={1} value={item.proposedQuantity} onChange={(val) => updateItemField(cat.categoryId, item.rowId, 'proposedQuantity', val ?? 1)} style={{ width: '100%' }} />
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}><span className="pr-amount-text">{item.unitPrice ? fmtNum(item.unitPrice) : "0"}</span></td>
                                                            <td style={{ textAlign: 'right', color: '#7a9dc1' }}><span className="pr-amount-text">{item.unitPrice ? fmtNum(item.unitPrice * item.proposedQuantity) : "0"}</span></td>
                                                            <td>
                                                                <Input placeholder="Ghi chú..." value={item.note} onChange={(e) => updateItemField(cat.categoryId, item.rowId, 'note', e.target.value)} />
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <Tooltip title="Xóa dòng này">
                                                                    <button className="pr-remove-btn" type="button" onClick={() => removeItem(cat.categoryId, item.rowId)}><DeleteOutlined /></button>
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <button className="pr-add-row-btn" type="button" onClick={() => {
                                            setSelectedCategories((prev) => prev.map((c) => {
                                                if (c.categoryId !== cat.categoryId) return c;
                                                return {
                                                    ...c,
                                                    items: [...c.items, { productId: 0, code: "", productName: "", unitPrice: 0, unit: "", proposedQuantity: 1, note: "", rowId: generateRowId() }],
                                                };
                                            }));
                                        }}>
                                            + Bổ sung sản phẩm
                                        </button>

                                        <div className="pr-category-footer">
                                            <div className="pr-quota-item">Định mức cho phép: <strong>{fmtNum(cat.allowedQuota)}</strong></div>
                                            <div className="pr-quota-item">Tổng tiền: <strong style={{ color: '#7a9dc1' }}>{fmtNum(subtotal)}</strong></div>
                                            <div className="pr-quota-item">Chênh lệch định mức: 
                                                <strong style={{ color: quotaDiff < 0 ? '#e0534a' : '#52c41a' }}>
                                                    {quotaDiff > 0 ? "+" : ""}{fmtNum(quotaDiff)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedCategories.some((c) => c.items.length > 0) && (
                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "16px 24px", background: '#fff', borderRadius: 8, border: '2px solid #7a9dc1', marginBottom: 24, boxShadow: '0 2px 8px rgba(122,157,193,0.1)' }}>
                                <span style={{ fontSize: 16, color: '#476481', marginRight: 16, fontWeight: 700 }}>Tổng cộng:</span>
                                <Text strong style={{ fontSize: 24, color: '#476481', fontVariantNumeric: 'tabular-nums' }}>{fmtVnd(totalProposed)}</Text>
                            </div>
                        )}

                        {/* QUY TRÌNH DUYỆT */}
                        {cascadeAvailable && (
                            <div className="pr-card">
                                <div className="pr-card-header">
                                    <div className="pr-card-icon purple" style={{ background: '#f4f7fa', color: '#476481', width: 32, height: 32, fontSize: 16 }}><TeamOutlined /></div>
                                    <h3 style={{ color: '#476481', fontSize: 16 }}>Quy trình duyệt</h3>
                                </div>
                                <div className="pr-card-body">
                                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", padding: "8px 0" }}>
                                        <div className="pr-approver-step">
                                            <div className="pr-approver-step-order">1</div>
                                            <div>
                                                <div className="pr-approver-step-label">Trưởng đơn vị</div>
                                                <Select
                                                    value={selectedApproverId || undefined}
                                                    onChange={(val) => setSelectedApproverId(val)}
                                                    options={[
                                                        ...(cascadeData.departmentHeads ?? []).map((h) => ({
                                                            label: h.approverName || `Người duyệt: ${h.approverId}`,
                                                            value: h.approverId,
                                                        })),
                                                        ...(cascadeData.departmentManagerId
                                                            ? cascadeData.departmentHeads?.some(h => h.approverId === cascadeData.departmentManagerId)
                                                                ? []
                                                                : [{ label: `Người duyệt: ${cascadeData.departmentManagerId}`, value: cascadeData.departmentManagerId }]
                                                            : []),
                                                    ]}
                                                    style={{ minWidth: 220 }}
                                                    placeholder="Chọn Trưởng đơn vị..."
                                                />
                                            </div>
                                        </div>
                                        {cascadeData.approvers
                                            .filter((a) => a.role !== "Trưởng đơn vị")
                                            .map((a, idx) => (
                                            <div key={idx} className="pr-approver-step">
                                                <div style={{ color: '#c0d1e1', fontSize: 18, margin: '0 2px' }}>❯</div>
                                                <div className="pr-approver-step-order">{idx + 2}</div>
                                                <div>
                                                    <div className="pr-approver-step-label">{a.role}</div>
                                                    <div style={{ color: '#6b7c93', fontSize: 13 }}>Người duyệt: {a.approverId}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </PurchaseRequestForm>
            </Form>
        </Create>
    );
};

export default CreatePurchaseRequest;