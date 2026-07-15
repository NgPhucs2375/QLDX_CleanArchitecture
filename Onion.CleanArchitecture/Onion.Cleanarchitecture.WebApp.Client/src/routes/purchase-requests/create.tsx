import { useForm, Create, useSelect } from "@refinedev/antd";
import { useCreate, useGetIdentity, HttpError } from "@refinedev/core";
import { Form, Input, Select, InputNumber, Typography, App, Spin } from "antd";
import { useState, useRef, useEffect } from "react";
import type {
    IPurchaseRequest,
    ICascadeProduct,
    ICascadeCreateData,
    ISelectedCategory,
    ICreatePayload,
} from "./types";
import { dataProvider } from "../../providers/data-provider";

const { Text } = Typography;

let rowIdCounter = 0;
const generateRowId = () => {
    rowIdCounter += 1;
    return `r_${Date.now()}_${rowIdCounter}`;
};

const vnd = (n: number) => n.toLocaleString("vi-VN") + " VND";

const STYLES = `
  :root {
    --primary: #1677ff;
    --primary-light: #e6f4ff;
    --success: #52c41a;
    --warning: #faad14;
    --error: #ff4d4f;
    --text: rgba(0,0,0,0.88);
    --text-secondary: rgba(0,0,0,0.45);
    --text-tertiary: rgba(0,0,0,0.25);
    --border: #d9d9d9;
    --border-light: #f0f0f0;
    --bg-layout: #f5f5f5;
    --bg-container: #ffffff;
    --radius: 6px;
  }
  .pr-app { max-width: 1080px; margin: 0 auto; padding: 20px; }
  .pr-topbar {
    background: var(--bg-container);
    border: 1px solid var(--border-light);
    border-radius: var(--radius);
    padding: 12px 20px;
    display: flex; flex-wrap: wrap; align-items: center; gap: 28px;
    margin-bottom: 16px;
  }
  .pr-topbar-item { display: flex; flex-direction: column; gap: 2px; }
  .pr-topbar-label { font-size: 12px; color: var(--text-tertiary); }
  .pr-topbar-value { font-size: 13px; color: var(--text-secondary); }
  .pr-badge {
    padding: 1px 10px; border-radius: 10px; font-size: 12px;
    background: #fffbe6; color: var(--warning); border: 1px solid #ffe58f;
    width: fit-content;
  }
  .pr-layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 16px; align-items: start; }
  @media (max-width: 760px) { .pr-layout { grid-template-columns: minmax(0,1fr); } }
  .pr-card {
    background: var(--bg-container);
    border: 1px solid var(--border-light);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
  }
  .pr-step-label { font-size: 12px; color: var(--primary); font-weight: 500; margin-bottom: 2px; }
  .pr-card h3, .pr-card h4 { font-weight: 500; margin: 0 0 16px; }
  .pr-card h3 { font-size: 15px; }
  .pr-field-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .pr-field { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 6px; }
  .pr-field label { font-size: 13px; color: var(--text); }
  .pr-select, .pr-input-number {
    height: 34px; border: 1px solid var(--border); border-radius: var(--radius);
    padding: 0 11px; font-size: 14px; color: var(--text); background: var(--bg-container); font-family: inherit; width: 100%;
  }
  .pr-select:focus, .pr-input-number:focus, .pr-input-number-focused {
    outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light);
  }
  .pr-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .pr-chip {
    padding: 6px 14px; border: 1px solid var(--border); border-radius: 16px; font-size: 13px;
    cursor: pointer; background: var(--bg-container); color: var(--text-secondary); user-select: none;
  }
  .pr-chip.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
  .pr-empty-hint {
    padding: 32px 20px; text-align: center; color: var(--text-tertiary); font-size: 13px;
    border: 1px dashed var(--border); border-radius: var(--radius); background: var(--bg-container);
  }
  .pr-category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .pr-category-header h4 { font-size: 14px; }
  .pr-category-subtotal { font-size: 14px; font-weight: 500; }
  .pr-product-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .pr-product-table th {
    text-align: left; font-size: 12px; font-weight: 400; color: var(--text-tertiary);
    padding: 0 8px 8px; border-bottom: 1px solid var(--border-light);
  }
  .pr-product-table td { padding: 6px 8px; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
  .pr-qty-input { text-align: right; }
  .pr-unit-price, .pr-line-total { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .pr-line-total { font-weight: 500; }
  .pr-remove-row {
    border: none; background: none; color: var(--text-tertiary); font-size: 16px; cursor: pointer; padding: 0 4px;
  }
  .pr-remove-row:hover { color: var(--error); }
  .pr-add-row-btn {
    margin-top: 10px; border: 1px dashed var(--border); background: none; color: var(--text-secondary);
    border-radius: var(--radius); padding: 6px 12px; font-size: 13px; cursor: pointer; width: 100%;
  }
  .pr-add-row-btn:hover { border-color: var(--primary); color: var(--primary); }
  .pr-sidebar-card h3 { font-size: 14px; margin: 0 0 14px; }
  .pr-budget-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; color: var(--text-secondary); }
  .pr-budget-row strong { color: var(--text); font-weight: 500; font-variant-numeric: tabular-nums; }
  .pr-budget-row.diff strong { font-size: 16px; }
  .pr-progress-track { height: 8px; background: var(--border-light); border-radius: 4px; margin: 8px 0 4px; overflow: hidden; }
  .pr-progress-fill { height: 100%; border-radius: 4px; background: var(--success); width: 0%; transition: width 0.3s, background 0.3s; }
  .pr-cat-total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; color: var(--text-secondary); }
  .pr-cat-total-row span:last-child { color: var(--text); font-variant-numeric: tabular-nums; }
`;

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

    useEffect(() => {
        if (identity?.departmentId) {
            formProps.form?.setFieldValue("DepartmentId", identity.departmentId);
        }
    }, [identity, formProps.form]);

    const { selectProps: configSelectProps } = useSelect({
        resource: "proposal-configs", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
    });
    const { selectProps: deptSelectProps } = useSelect({
        resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
    });



const handleConfigChange = async (configId: number) => {
        if (!configId) return;
        setLoadingCascade(true);
        setSelectedCategories([]);
        setProductsCache({});
        try {
            // Đã xóa 'query' và nối tham số trực tiếp vào URL
            const result = await dataProvider.custom({
                url: `/api/purchase-requests/cascade-categories?ProposalConfigId=${configId}&UserGuid=${identity?.userId ?? 0}`,
                method: "get"
            });
            setCascadeData((result.data ?? { categories: [], approvers: [], departmentManagerId: "" }) as unknown as ICascadeCreateData);
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
            // Đã xóa 'query' và nối tham số trực tiếp vào URL
            const result = await dataProvider.custom({
                url: `/api/purchase-requests/cascade-products?CategoryId=${catId}`,
                method: "get"
            });
            const list = (result.data as ICascadeProduct[]) ?? [];
            setProductsCache((prev) => ({ ...prev, [catId]: list }));
            return list;
        } catch {
            return [];
        }
    };

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
            const values = await formProps.form?.validateFields() as { Code: string; DepartmentId: number; ProposalConfigId: number };
            const proposalConfigId = values.ProposalConfigId;

            if (!proposalConfigId) {
                message.error("Vui lòng chọn cấu hình đề xuất!");
                return;
            }

            const validCategories = selectedCategories.filter((c) => c.items.length > 0);
            if (validCategories.length === 0) {
                message.error("Vui lòng thêm ít nhất 1 danh mục có sản phẩm!");
                return;
            }

            const payload: ICreatePayload = {
                code: values.Code,
                departmentId: values.DepartmentId,
                proposalConfigId,
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
            message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
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
    const progressColor = quotaPercent > 100 ? "var(--error)" : quotaPercent > 80 ? "var(--warning)" : "var(--success)";

    const categoryTotals = selectedCategories
        .filter((c) => c.items.length > 0)
        .map((c) => ({
            name: c.categoryName,
            subtotal: c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0),
            quota: c.allowedQuota,
            diff: c.allowedQuota - c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0),
        }));

    return (
        <Create saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit, loading: isCreating }}>
            <style>{STYLES}</style>
            <div className="pr-app">
                <h2 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                    Tạo phiếu đề xuất mua hàng
                </h2>

                <div className="pr-topbar">
                    <div className="pr-topbar-item">
                        <span className="pr-topbar-label">Mã phiếu</span>
                        <Form.Item name="Code" rules={[{ required: true, message: "Vui lòng nhập mã phiếu!" }, { max: 50 }]} style={{ margin: 0 }}>
                            <Input placeholder="VD: DX-2024-001" className="pr-select" />
                        </Form.Item>
                    </div>
                    <div className="pr-topbar-item">
                        <span className="pr-topbar-label">Ngày tạo</span>
                        <span className="pr-topbar-value">{new Date().toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="pr-topbar-item">
                        <span className="pr-topbar-label">Người tạo</span>
                        <span className="pr-topbar-value">{identity?.name || "Current User"}</span>
                    </div>
                    <div className="pr-topbar-item">
                        <span className="pr-topbar-label">Trạng thái</span>
                        <span className="pr-badge">Nháp</span>
                    </div>
                </div>

                <div className="pr-layout">
                    <div className="pr-main">
                        <div className="pr-card">
                            <div className="pr-step-label">Bước 1</div>
                            <h3>Cấu hình đề xuất</h3>
                            <div className="pr-field-row">
                                <div className="pr-field">
    <label>Cấu hình đề xuất</label>
    <Form.Item name="ProposalConfigId" rules={[{ required: true, message: "Bắt buộc chọn cấu hình đề xuất!" }]}>
        <Select
            // Thay thế dòng {...configSelectProps as ...} bằng 3 dòng dưới đây:
            options={configSelectProps.options}
            loading={configSelectProps.loading}
            onSearch={configSelectProps.onSearch}
            
            placeholder="Chọn cấu hình đề xuất..."
            className="pr-select"
            onChange={(val: number) => {
                formProps.form?.setFieldValue("ProposalConfigId", val);
                handleConfigChange(val);
            }}
        />
    </Form.Item>
</div>
                                <div className="pr-field">
                                    <label>Đơn vị áp dụng</label>
                                    <Form.Item name="DepartmentId" rules={[{ required: true, message: "Bắt buộc chọn đơn vị áp dụng!" }]}>
                                        <Select                                            
                                            {...deptSelectProps}
                                            placeholder="Chọn đơn vị áp dụng..."
                                            className="pr-select"
                                            disabled
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        {loadingCascade ? (
                            <div className="pr-card" style={{ textAlign: "center", padding: 40 }}>
                                <Spin />
                            </div>
                        ) : cascadeAvailable && (
                            <div className="pr-card" id="categoryPickerCard">
                                <div className="pr-step-label">Bước 2</div>
                                <h3>Chọn danh mục đề xuất</h3>
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
                                    <div className="pr-empty-hint">Chọn ít nhất một danh mục ở trên để bắt đầu thêm sản phẩm</div>
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
                                            <colgroup><col /><col style={{ width: 90 }} /><col style={{ width: 110 }} /><col style={{ width: 120 }} /><col style={{ width: 32 }} /></colgroup>
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
                                                                    className="pr-select"
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
                                                                />
                                                            </td>
                                                            <td>
                                                                <InputNumber
                                                                    className="pr-input-number pr-qty-input"
                                                                    min={1} step={1} value={item.proposedQuantity}
                                                                    onChange={(val) => updateQuantity(cat.categoryId, item.rowId, val ?? 1)}
                                                                    style={{ width: 80 }}
                                                                />
                                                            </td>
                                                            <td className="pr-unit-price">{vnd(item.unitPrice)}</td>
                                                            <td className="pr-line-total">{vnd(item.unitPrice * item.proposedQuantity)}</td>
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
                            <div className="pr-card" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                                    <span>Tổng tiền toàn phiếu:</span>
                                    <Text strong style={{ fontSize: 18 }}>{vnd(totalProposed)}</Text>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="pr-sidebar">
                        {cascadeAvailable && (
                            <div className="pr-card pr-sidebar-card" style={{ height: "fit-content", position: "sticky", top: 24 }}>
                                <div className="pr-step-label">Bước 3</div>
                                <h3>Kiểm tra định mức</h3>
                                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
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
                                        <strong style={{ color: quotaDiff < 0 ? "var(--error)" : "var(--success)" }}>{vnd(quotaDiff)}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {categoryTotals.length > 0 && (
                            <div className="pr-card pr-sidebar-card" style={{ height: "fit-content", position: "sticky", top: 24 }}>
                                <h3>Tổng theo danh mục</h3>
                                {categoryTotals.map((c) => (
                                    <div key={c.name} className="pr-cat-total-row">
                                        <span>{c.name}</span>
                                        <strong>{vnd(c.subtotal)}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </Create>
    );
};

export default CreatePurchaseRequest;
