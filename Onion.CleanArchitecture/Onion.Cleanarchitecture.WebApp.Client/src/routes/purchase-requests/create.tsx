import { useForm, Create, useSelect } from "@refinedev/antd";
import { useCreate, useGetIdentity, HttpError } from "@refinedev/core";
import { Form, Input, Select, InputNumber, Typography, App, Spin, Row, Col } from "antd";
import { useState, useRef, useEffect } from "react";
import { FileTextOutlined, AppstoreAddOutlined, TeamOutlined } from "@ant-design/icons";
import type {
    IPurchaseRequest,
    ICascadeProduct,
    ICascadeCreateData,
    ISelectedCategory,
    ICreatePayload,
} from "./types";
import { dataProvider } from "../../providers/data-provider";
import { PurchaseRequestForm } from "./form";

const { Text, Title } = Typography;

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
const generateRowId = () => {
    rowIdCounter += 1;
    return `r_${Date.now()}_${rowIdCounter}`;
};

const vnd = (n: number) => n.toLocaleString("vi-VN") + " VND";

export const CreatePurchaseRequest = () => {
    const { formProps, saveButtonProps } = useForm<IPurchaseRequest, HttpError>({ redirect: "list" });
    const { mutate: createMutate, isLoading: isCreating } = useCreate<IPurchaseRequest, HttpError, ICreatePayload>();
    const { message } = App.useApp();
    const { data: identity } = useGetIdentity<{ userId: number; departmentId: number; name: string }>();

    const [cascadeData, setCascadeData] = useState<ICascadeCreateData>({ categories: [], approvers: [], departmentManagerId: "" });
    const [loadingCascade, setLoadingCascade] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<ISelectedCategory[]>([]);
    const [productsCache, setProductsCache] = useState<Record<number, ICascadeProduct[]>>({});
    const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});
    const selectedRef = useRef(selectedCategories);

    useEffect(() => {
        selectedRef.current = selectedCategories;
    }, [selectedCategories]);

    // Tự động set DepartmentId nếu user có DepartmentId, nhưng vẫn hiển thị trên UI
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
        setProductsCache({});
        try {
            const result = await dataProvider.custom({
                url: `/api/purchase-requests/cascade-create?ProposalConfigId=${configId}&DepartmentId=${deptId}`,
                method: "get"
            });
            setCascadeData((mapPascalToCamel(result.data ?? { categories: [], approvers: [], departmentManagerId: "" })) as unknown as ICascadeCreateData);
        } catch (error) { 
            const err = error as HttpError;
            message.error(err?.message || "Không thể tải danh mục");
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
        } catch {
            return [];
        }
    };

    const extraTopbarInfo = (
        <>
            <div className="pr-topbar-item">
                <span className="pr-topbar-label">Ngày tạo</span>
                {/* Hiển thị ngày hôm nay mặc định */}
                <span className="pr-topbar-value">{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="pr-topbar-item">
                <span className="pr-topbar-label">Người tạo</span>
                {/* Lấy tên từ token đăng nhập hiển thị ra */}
                <span className="pr-topbar-value">{identity?.name || "Đang tải..."}</span>
            </div>
        </>
    );

    const addCategory = async (catId: number) => {
        if (loadingCategories[catId]) return;
        const cat = cascadeData.categories.find((c) => c.categoryId === catId);
        if (!cat) return;
        if (selectedRef.current.some((s) => s.categoryId === catId)) return;

        setLoadingCategories((prev) => ({ ...prev, [catId]: true }));
        setSelectedCategories((prev) => [...prev, {
            categoryId: cat.categoryId,
            categoryName: cat.categoryName,
            allowedQuota: cat.allowedQuota,
            items: [],
        }]);

        await loadProducts(catId);
        setLoadingCategories((prev) => ({ ...prev, [catId]: false }));
    };

    const updateQuantity = (categoryId: number, rowId: string, qty: number) => {
        setSelectedCategories((prev) => prev.map((cat) => {
            if (cat.categoryId !== categoryId) return cat;
            return {
                ...cat,
                items: cat.items.map((item) =>
                    item.rowId === rowId
                        ? { ...item, proposedQuantity: Math.max(1, qty) }
                        : item
                ),
            };
        }));
    };

    const removeItem = (categoryId: number, rowId: string) => {
        setSelectedCategories((prev) => prev.map((cat) => {
            if (cat.categoryId !== categoryId) return cat;
            return {
                ...cat,
                items: cat.items.filter((item) => item.rowId !== rowId),
            };
        }));
    };

    const handleSubmit = async () => {
        try {
            // Validate 3 field bắt buộc theo backend
            const values = await formProps.form?.validateFields() as { Code: string; DepartmentId: number; ProposalConfigId: number };
            
            const validCategories = selectedCategories.filter((c) => c.items.length > 0);
            if (validCategories.length === 0) {
                message.error("Vui lòng thêm ít nhất 1 danh mục có sản phẩm!");
                return;
            }

            const payload: ICreatePayload = {
                code: values.Code,
                departmentId: values.DepartmentId,
                proposalConfigId: values.ProposalConfigId,
                categories: validCategories.map((c) => ({
                    categoryId: c.categoryId,
                    items: c.items.map((i) => ({
                        productId: i.productId,
                        proposedQuantity: i.proposedQuantity,
                    })),
                })),
            };

            createMutate(
                {
                    resource: "purchase-requests",
                    values: payload,
                    successNotification: () => ({ message: "Tạo phiếu thành công", type: "success" }),
                },
                {
                    onError: (error: HttpError) => {
                        message.error(error?.message || "Có lỗi xảy ra");
                    },
                }
            );
        } catch {
            message.warning("Vui lòng điền đầy đủ thông tin bắt buộc (Mã phiếu, Đơn vị, Cấu hình)");
        }
    };

    const cascadeAvailable = cascadeData.categories.length > 0;
    const totalProposed = selectedCategories.reduce(
        (s, c) => s + c.items.reduce((s2, i) => s2 + i.unitPrice * i.proposedQuantity, 0),
        0
    );
    const configQuota = cascadeAvailable
        ? cascadeData.categories.reduce((s, c) => s + c.allowedQuota, 0)
        : 0;
    const quotaDiff = configQuota - totalProposed;
    const quotaPercent = configQuota > 0 ? Math.min(100, (totalProposed / configQuota) * 100) : 0;
    const progressColor = quotaPercent > 100 ? "#ff4d4f" : quotaPercent > 80 ? "#faad14" : "#52c41a";

    const categoryTotals = selectedCategories
        .filter((c) => c.items.length > 0)
        .map((c) => ({
            name: c.categoryName,
            subtotal: c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0),
            quota: c.allowedQuota,
            diff: c.allowedQuota - c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0),
        }));

    return (
        <Create 
            title={<Title level={3} style={{ margin: 0 }}>Tạo Phiếu Đề Xuất Mua Hàng</Title>}
            saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit, loading: isCreating }}
        >
            {/* Sử dụng component Form chuẩn của antd để bọc toàn bộ UI */}
            <Form {...formProps} layout="vertical" className="pr-form">
                <PurchaseRequestForm
                    initialData={undefined}
                    extraTopbar={extraTopbarInfo}
                    codeItem={
                        <Form.Item name="Code" rules={[{ required: true, message: "Vui lòng nhập mã phiếu!" }, { max: 50 }]} style={{ margin: 0 }}>
                            <Input placeholder="VD: DX-2024-001" style={{ width: 220 }} />
                        </Form.Item>
                    }
                >
                    <div className="pr-layout">
                        <div className="pr-main">
                            
                            {/* Card 1: Chứa ĐẦY ĐỦ 3 Field Bắt Buộc theo C# Backend */}
                            <div className="pr-card">
                                <div className="pr-card-header">
                                    <div className="pr-card-icon blue"><FileTextOutlined /></div>
                                    <h3>Thông tin khởi tạo</h3>
                                </div>
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <div className="pr-field">
                                            <label>Đơn vị áp dụng</label>
                                            <Form.Item name="DepartmentId" rules={[{ required: true, message: "Bắt buộc chọn đơn vị áp dụng!" }]}>
                                                <Select
                                                    options={deptSelectProps.options}
                                                    loading={deptSelectProps.loading}
                                                    showSearch
                                                    placeholder="Chọn đơn vị áp dụng..."
                                                    onChange={() => {
                                                        // Khi đổi đơn vị, cần load lại cascade nếu đã chọn config
                                                        handleConfigChange();
                                                    }}
                                                    filterOption={(input, option) =>
                                                        (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <div className="pr-field">
                                            <label>Cấu hình đề xuất</label>
                                            <Form.Item name="ProposalConfigId" rules={[{ required: true, message: "Bắt buộc chọn cấu hình đề xuất!" }]}>
                                                <Select
                                                    options={configSelectProps.options}
                                                    loading={configSelectProps.loading}
                                                    showSearch
                                                    placeholder="Chọn cấu hình đề xuất..."
                                                    onChange={() => {
                                                        // Khi đổi config, cần load lại cascade
                                                        handleConfigChange();
                                                    }}
                                                    filterOption={(input, option) =>
                                                        (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* ... (Giữ nguyên phần render Loading và Danh mục (Category/Product) bên dưới) ... */}
                            
                            {loadingCascade ? (
                                <div className="pr-card" style={{ textAlign: "center", padding: 40 }}>
                                    <Spin />
                                </div>
                            ) : cascadeAvailable && (
                                <div className="pr-card" id="categoryPickerCard">
                                    <div className="pr-card-header">
                                        <div className="pr-card-icon green"><AppstoreAddOutlined /></div>
                                        <h3>Chọn danh mục đề xuất</h3>
                                    </div>
                                    <Spin spinning={Object.values(loadingCategories).some(Boolean)}>
                                        <div className="pr-chips">
                                            {cascadeData.categories
                                                .filter((c) => !selectedCategories.some((s) => s.categoryId === c.categoryId))
                                                .map((c) => (
                                                    <div
                                                        key={c.categoryId}
                                                        className="pr-chip"
                                                        onClick={() => addCategory(c.categoryId)}
                                                    >
                                                        {c.categoryName} ({vnd(c.allowedQuota)})
                                                    </div>
                                                ))}
                                        </div>
                                    </Spin>
                                    {selectedCategories.length === 0 && (
                                        <div className="pr-empty-hint" style={{ marginTop: 16 }}>
                                            Chọn ít nhất một danh mục ở trên để bắt đầu thêm sản phẩm
                                        </div>
                                    )}
                                </div>
                            )}

                            <div id="categoryCardsContainer">
                                {selectedCategories.map((cat) => {
                                    const prods = productsCache[cat.categoryId] ?? [];
                                    const subtotal = cat.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0);
                                    return (
                                        <div key={cat.categoryId} className="pr-card" data-cat={cat.categoryId}>
                                            <div className="pr-category-header">
                                                <h4>{cat.categoryName}</h4>
                                                <span className="pr-category-subtotal">{vnd(subtotal)}</span>
                                            </div>
                                            <table className="pr-product-table">
                                                <colgroup><col /><col style={{ width: 100 }} /><col style={{ width: 130 }} /><col style={{ width: 140 }} /><col style={{ width: 36 }} /></colgroup>
                                                <thead>
                                                    <tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th><th></th></tr>
                                                </thead>
                                                <tbody>
                                                    {cat.items.map((item) => {
                                                        const currentRowId = item.rowId;
                                                        return (
                                                            <tr key={item.rowId} data-row={item.rowId}>
                                                                <td>
                                                                    <Select
                                                                        value={item.productId}
                                                                        onChange={(val: number) => {
                                                                            const product = prods.find((p) => p.id === val);
                                                                            if (!product) return;
                                                                            setSelectedCategories((prev) => prev.map((c) => {
                                                                                if (c.categoryId !== cat.categoryId) return c;
                                                                                return {
                                                                                    ...c,
                                                                                    items: c.items.map((i) =>
                                                                                        i.rowId === currentRowId
                                                                                            ? { ...i, productId: product.id, productName: product.name, unitPrice: product.unitPrice, unit: product.unit }
                                                                                            : i
                                                                                    ),
                                                                                };
                                                                            }));
                                                                        }}
                                                                        options={prods.map((p) => ({ label: p.name, value: p.id }))}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Chọn sản phẩm"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <InputNumber
                                                                        min={1} step={1} value={item.proposedQuantity}
                                                                        onChange={(val) => updateQuantity(cat.categoryId, item.rowId, val ?? 1)}
                                                                        style={{ width: 80 }}
                                                                    />
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{vnd(item.unitPrice)}</td>
                                                                <td style={{ textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{vnd(item.unitPrice * item.proposedQuantity)}</td>
                                                                <td>
                                                                    <button className="pr-remove-row" onClick={() => removeItem(cat.categoryId, item.rowId)} aria-label="Xóa dòng">×</button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <button
                                                className="pr-add-row-btn"
                                                type="button" // Ngăn chặn trigger submit form
                                                onClick={() => {
                                                    const firstProd = prods[0];
                                                    if (firstProd) {
                                                        setSelectedCategories((prev) => prev.map((c) => {
                                                            if (c.categoryId !== cat.categoryId) return c;
                                                            return {
                                                                ...c,
                                                                items: [...c.items, {
                                                                    productId: firstProd.id,
                                                                    productName: firstProd.name,
                                                                    unitPrice: firstProd.unitPrice,
                                                                    unit: firstProd.unit,
                                                                    proposedQuantity: 1,
                                                                    rowId: generateRowId(),
                                                                }],
                                                            };
                                                        }));
                                                    }
                                                }}
                                            >
                                                + Thêm sản phẩm
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedCategories.some((c) => c.items.length > 0) && (
                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "12px 0", gap: 16 }}>
                                    <span style={{ fontSize: 15, color: 'rgba(0,0,0,0.65)' }}>Tổng tiền toàn phiếu:</span>
                                    <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{vnd(totalProposed)}</Text>
                                </div>
                            )}

                            {cascadeAvailable && cascadeData.approvers.length > 0 && (
                                <div className="pr-card">
                                    <div className="pr-card-header">
                                        <div className="pr-card-icon purple"><TeamOutlined /></div>
                                        <h3>Luồng phê duyệt</h3>
                                    </div>
                                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                                        {cascadeData.departmentManagerId && (
                                            <div className="pr-approver-step">
                                                <div className="pr-approver-step-order">1</div>
                                                <div>
                                                    <div className="pr-approver-step-label">Trưởng đơn vị</div>
                                                    <div className="pr-approver-step-name">(Manager ID: {cascadeData.departmentManagerId})</div>
                                                </div>
                                                <div className="pr-approver-arrow">→</div>
                                            </div>
                                        )}
                                        {cascadeData.approvers.map((a, idx) => (
                                            <div key={idx} className="pr-approver-step">
                                                <div className="pr-approver-step-order">{idx + (cascadeData.departmentManagerId ? 2 : 1)}</div>
                                                <div>
                                                    <div className="pr-approver-step-label">{a.role}</div>
                                                    <div className="pr-approver-step-name">{a.approverId}</div>
                                                </div>
                                                {idx < cascadeData.approvers.length - 1 && <div className="pr-approver-arrow">→</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="pr-sidebar">
                            {/* ... (Giữ nguyên Sidebar bên phải) ... */}
                            {cascadeAvailable && (
                                <div className="pr-card pr-sidebar-card">
                                    <div className="pr-card-header" style={{ marginBottom: 14, paddingBottom: 10 }}>
                                        <div className="pr-card-icon purple" style={{ width: 28, height: 28, fontSize: 14 }}><FileTextOutlined /></div>
                                        <h3 style={{ fontSize: 15 }}>Kiểm tra định mức</h3>
                                    </div>
                                    <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>
                                        <div className="pr-budget-row">
                                            <span>Định mức</span>
                                            <strong>{configQuota ? vnd(configQuota) : "-"}</strong>
                                        </div>
                                        <div className="pr-budget-row">
                                            <span>Đã dùng</span>
                                            <strong>{vnd(totalProposed)}</strong>
                                        </div>
                                        <div className="pr-progress-track">
                                            <div className="pr-progress-fill" style={{ width: `${quotaPercent}%`, background: progressColor }}></div>
                                        </div>
                                        <div className="pr-budget-row diff">
                                            <span>Chênh lệch</span>
                                            <strong style={{ color: quotaDiff < 0 ? "#ff4d4f" : "#52c41a" }}>{vnd(quotaDiff)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {categoryTotals.length > 0 && (
                                <div className="pr-card pr-sidebar-card">
                                    <div className="pr-card-header" style={{ marginBottom: 14, paddingBottom: 10 }}>
                                        <div className="pr-card-icon orange" style={{ width: 28, height: 28, fontSize: 14 }}><AppstoreAddOutlined /></div>
                                        <h3 style={{ fontSize: 15 }}>Tổng theo danh mục</h3>
                                    </div>
                                    {categoryTotals.map((c) => (
                                        <div key={c.name} className="pr-budget-row">
                                            <span>{c.name}</span>
                                            <strong>{vnd(c.subtotal)}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                    </div>
                </PurchaseRequestForm>
            </Form>
        </Create>
    );
};

export default CreatePurchaseRequest;