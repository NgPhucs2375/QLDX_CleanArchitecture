import { Create, useSelect } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { Form, Input, Select, Typography, App, Row, Col, Button, Card, Space, Tag, Divider } from "antd";
import { useEffect } from "react";
import {
  TeamOutlined, SaveOutlined, AppstoreOutlined, InfoCircleOutlined, EnvironmentOutlined, DeleteOutlined,
} from "@ant-design/icons";
import { usePurchaseRequestForm, useCascadeData } from "./hooks";
import { ProductTable, CategorySelector } from "./components";
import "../../assets/purchase-request.css";

const { Text, Title } = Typography;
const { TextArea } = Input;
const fmtVnd = (n: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

export const CreatePurchaseRequest = () => {
  const form = usePurchaseRequestForm("create");
  const cascade = useCascadeData();
  const { message } = App.useApp();
  const { data: identity } = useGetIdentity<{ UserId: string; DepartmentId: number; Name: string }>();
  const { formProps } = form.form;

  const selectedDepartmentId = Form.useWatch("DepartmentId", formProps.form);

  const { selectProps: configSelectProps } = useSelect({
    resource: "proposal-configs", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
  });
  const { selectProps: deptSelectProps } = useSelect({
    resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
  });
  const { selectProps: userSelectProps } = useSelect({
    resource: "users", optionLabel: "UserName", optionValue: "Id", pagination: { mode: "off" },
  });

  useEffect(() => {
    if (identity?.DepartmentId && !formProps.form?.getFieldValue("DepartmentId")) {
      formProps.form?.setFieldValue("DepartmentId", identity.DepartmentId);
    }
  }, [identity, formProps.form]);

  const handleConfigChange = async () => {
    console.log("handleConfigChange fired", {
        configId: formProps.form?.getFieldValue("ProposalConfigId"),
        deptId: formProps.form?.getFieldValue("DepartmentId"),
    });
    const configId = formProps.form?.getFieldValue("ProposalConfigId");
    const deptId = formProps.form?.getFieldValue("DepartmentId");
    if (!configId || !deptId) return;
    form.setSelectedCategories([]);
    try {
      await cascade.loadCascade(configId, deptId);
    } catch {
      message.error("Không thể tải dữ liệu cấu hình. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    form.setCascadeData(cascade.cascadeData);
  }, [cascade.cascadeData]);

  const handleCategoryChange = async (newIds: number[]) => {
    const removedIds = form.selectedCategories
      .map((c) => c.categoryId)
      .filter((id) => !newIds.includes(id));
    removedIds.forEach((id) => form.removeCategory(id));
    const addedIds = newIds.filter(
      (id) => !form.selectedCategories.some((c) => c.categoryId === id)
    );
    for (const id of addedIds) {
      await form.addCategory(id, cascade.loadProducts);
    }
  };

  const cascadeAvailable = cascade.cascadeData.categories.length > 0;

  return (
    <Create
      title={<Title level={3} className="pr-m-0 pr-text-emerald">Tạo Phiếu Đề Xuất</Title>}
      footerButtons={() => (
        <Button
          type="primary" size="large" htmlType="button"
          onClick={() => form.handleSubmit()}
          className="pr-bg-emerald-light pr-text-emerald pr-border-emerald"
          style={{ minWidth: 200, height: 44, fontSize: 16 }}
        >
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
                <Select {...deptSelectProps} showSearch placeholder="Chọn phòng ban..." onChange={handleConfigChange} />
              </Form.Item>
              <Form.Item name="ProposalConfigId" label="Cấu hình định mức" rules={[{ required: true, message: "Bắt buộc chọn cấu hình!" }]}>
                <Select {...configSelectProps} showSearch placeholder={selectedDepartmentId ? "Chọn cấu hình áp dụng..." : "Vui lòng chọn Phòng ban trước"} disabled={!selectedDepartmentId} onChange={handleConfigChange} />
              </Form.Item>
              <Form.Item name="Reason" label="Lý do">
                <TextArea rows={3} placeholder="Nhập lý do thực hiện đề xuất..." />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<Space><EnvironmentOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Thông tin nhận hàng</Text></Space>} className="pr-card pr-card-emerald">
              <Form.Item name="ContactName" label={<Space><Text className="pr-text-danger"></Text><Text>Người liên hệ</Text></Space>} rules={[{ required: true }]}>
                <Input placeholder="Họ và tên..." />
              </Form.Item>
              <Form.Item name="ContactPhone" label={<Space><Text className="pr-text-danger"></Text><Text>Số điện thoại</Text></Space>} rules={[{ required: true }]}>
                <Input placeholder="09xxxxxxxxx" />
              </Form.Item>
              <Form.Item name="ShippingAddress" label={<Space><Text className="pr-text-danger"></Text><Text>Địa chỉ nhận hàng</Text></Space>} rules={[{ required: true }]}>
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
                <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
                  <div style={{ marginBottom: 8 }}><Tag color="blue">Bước 1</Tag><Text strong>Trưởng đơn vị</Text></div>
                  <Select
                    value={form.selectedApproverId || undefined}
                    onChange={(val) => form.setSelectedApproverId(val)}
                    {...userSelectProps}
                    showSearch
                    placeholder="Chọn Trưởng đơn vị..."
                    style={{ width: "100%" }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
                  <div style={{ marginBottom: 8 }}><Tag color="purple">Bước 2</Tag><Text strong>Kiểm soát</Text></div>
                  <Space wrap>
                    {(cascade.cascadeData.approvers ?? []).filter((a) => a.role !== "Trưởng đơn vị").map((a, idx) => (
                      <Tag key={idx} color="geekblue" style={{ padding: "4px 12px", fontSize: 14 }}>{a.approverName || a.approverId}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
                  <div style={{ marginBottom: 8 }}><Tag color="green">Bước 3</Tag><Text strong>Người tạo</Text></div>
                  <Tag color="green" style={{ padding: "4px 12px", fontSize: 14 }}>{identity?.Name || identity?.UserId || "Bạn"}</Tag>
                </Card>
              </Col>
            </Row>
          </Card>
        )}

        {cascadeAvailable && (
          <Card loading={cascade.loadingCascade}
            title={<Space><AppstoreOutlined className="pr-text-emerald" /><Text strong className="pr-text-emerald">Danh mục hàng hóa</Text></Space>}
            extra={form.totalItems > 0 ? <Text strong className="pr-text-emerald">Tổng đề xuất: {fmtVnd(form.totalProposed)}</Text> : null}
            className="pr-card pr-card-emerald"
          >
            <CategorySelector
              categories={cascade.cascadeData.categories}
              selectedIds={form.selectedCategories.map((c) => c.categoryId)}
              onSelectionChange={handleCategoryChange}
              totalCategories={form.selectedCategories.filter((c) => c.items.length > 0).length}
              totalItems={form.totalItems}
              totalAmount={form.totalProposed}
            />

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {form.selectedCategories.map((cat) => {
                const prods = cascade.productsCache[cat.categoryId] ?? [];
                const subtotal = cat.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0);
                const quotaDiff = cat.allowedQuota - subtotal;

                return (
                  <Card key={cat.categoryId} className="pr-card" size="small"
                    title={<Text strong className="pr-text-emerald">{cat.categoryName}</Text>}
                    extra={
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => form.removeCategory(cat.categoryId)} />
                    }
                  >
                    <ProductTable
                      products={prods}
                      items={cat.items}
                      onProductChange={(rowId, productId) => {
                        const product = prods.find((p) => p.id === productId);
                        if (!product) return;
                        form.updateItemField(cat.categoryId, rowId, "productId", product.id);
                        form.updateItemField(cat.categoryId, rowId, "productName", product.name);
                        form.updateItemField(cat.categoryId, rowId, "unitPrice", product.unitPrice);
                        form.updateItemField(cat.categoryId, rowId, "unit", product.unit);
                      }}
                      onQuantityChange={(rowId, qty) => form.updateItemField(cat.categoryId, rowId, "proposedQuantity", qty)}
                      onNoteChange={(rowId, note) => form.updateItemField(cat.categoryId, rowId, "note", note)}
                      onRemove={(rowId) => form.removeItem(cat.categoryId, rowId)}
                      onAddItem={() => form.addItem(cat.categoryId)}
                    />
                    <Divider style={{ margin: "12px 0" }} />
                    <Space size="large" style={{ width: "100%", justifyContent: "flex-end" }}>
                      <Text className="pr-text-secondary">Định mức: <Text strong>{fmtVnd(cat.allowedQuota)}</Text></Text>
                      <Text className="pr-text-secondary">Tạm tính: <Text strong className="pr-text-emerald">{fmtVnd(subtotal)}</Text></Text>
                      <Text className="pr-text-secondary">Chênh lệch: <Text strong className={quotaDiff < 0 ? "pr-text-danger" : "pr-text-success"}>{quotaDiff >= 0 ? "+" : ""}{fmtVnd(quotaDiff)}</Text></Text>
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

