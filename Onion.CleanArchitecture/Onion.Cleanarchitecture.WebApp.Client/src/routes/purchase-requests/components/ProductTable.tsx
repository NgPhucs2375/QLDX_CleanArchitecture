import { Button, Input, InputNumber, Select, Table, Tooltip, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ICascadeProduct, IFormItem } from "../types";

const { Text } = Typography;
const fmtVnd = (n: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

interface ProductTableProps {
  products: ICascadeProduct[];
  items: IFormItem[];
  onProductChange: (rowId: string, productId: number) => void;
  onQuantityChange: (rowId: string, qty: number | null) => void;
  onNoteChange: (rowId: string, note: string) => void;
  onRemove: (rowId: string) => void;
  onAddItem: () => void;
}

export const ProductTable = ({
  products, items, onProductChange, onQuantityChange, onNoteChange, onRemove, onAddItem,
}: ProductTableProps) => {
  const selectedProductIds = items.map((i) => i.productId).filter(Boolean);

  return (
    <>
      <Table
        dataSource={items}
        rowKey="rowId"
        pagination={false}
        size="small"
        columns={[
          {
            title: "Sản phẩm",
            dataIndex: "productId",
            width: 320,
            render: (val: number, item: IFormItem) => (
              <Select
                value={val || null}
                onChange={(v) => onProductChange(item.rowId, v)}
                options={products.map((p) => ({
                  label: p.name,
                  value: p.id,
                  disabled: selectedProductIds.includes(p.id) && p.id !== val,
                }))}
                style={{ width: "100%" }}
                placeholder="Chọn sản phẩm..."
                showSearch
                filterOption={(input, option) =>
                  ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            ),
          },
          {
            title: "SL",
            dataIndex: "proposedQuantity",
            width: 100,
            align: "center",
            render: (val: number, item: IFormItem) => (
              <InputNumber
                min={1}
                value={val}
                onChange={(v) => onQuantityChange(item.rowId, v ?? 1)}
                style={{ width: "100%" }}
              />
            ),
          },
          {
            title: "Đơn giá (₫)",
            align: "right",
            width: 120,
            render: (_: unknown, item: IFormItem) => (
              <Text>{item.productId ? fmtVnd(item.unitPrice) : "—"}</Text>
            ),
          },
          {
            title: "Thành tiền (₫)",
            align: "right",
            width: 140,
            render: (_: unknown, item: IFormItem) => (
              <Text strong className="pr-text-teal" style={{ fontSize: 15 }}>
                {item.productId ? fmtVnd(item.unitPrice * item.proposedQuantity) : "—"}
              </Text>
            ),
          },
          {
            title: "Ghi chú",
            width: 130,
            render: (_: unknown, item: IFormItem) => (
              <Input
                size="small"
                value={item.note}
                onChange={(e) => onNoteChange(item.rowId, e.target.value)}
                placeholder="Ghi chú..."
              />
            ),
          },
          {
            title: "",
            align: "center",
            width: 50,
            render: (_: unknown, item: IFormItem) => (
              <Tooltip title="Xóa dòng này">
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => onRemove(item.rowId)} />
              </Tooltip>
            ),
          },
        ]}
      />
      <Button type="dashed" block icon={<PlusOutlined />} onClick={onAddItem}>
        Bổ sung sản phẩm
      </Button>
    </>
  );
};
