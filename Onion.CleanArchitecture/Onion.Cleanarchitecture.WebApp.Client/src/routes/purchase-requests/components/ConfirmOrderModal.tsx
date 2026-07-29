import { Modal, Card, Space, Table, InputNumber, Input, Descriptions, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import type { ILocalCategory } from "../types";

const { Text } = Typography;
const fmtVnd = (n?: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

interface ConfirmOrderModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  loading?: boolean;
  categories: ILocalCategory[];
  localQty: Record<number, number>;
  onQtyChange: (id: number, val: number | null) => void;
  note: string;
  onNoteChange: (val: string) => void;
  totalProposedAmount?: number;
}

export const ConfirmOrderModal = ({
  open, onOk, onCancel, loading, categories, localQty,
  onQtyChange, note, onNoteChange, totalProposedAmount,
}: ConfirmOrderModalProps) => {
  const totalActual = categories.reduce((sum, cat) => {
    const items = cat.RequestItems ?? [];
    return sum + items.reduce((s, i) => {
      const qty = localQty[i.Id] ?? i.ProposedQuantity;
      return s + qty * i.UnitPrice;
    }, 0);
  }, 0);

  const totalProposed = totalProposedAmount ?? categories.reduce((sum, cat) => {
    const items = cat.RequestItems ?? [];
    return sum + items.reduce((s, i) => s + i.ProposedQuantity * i.UnitPrice, 0);
  }, 0);

  return (
    <Modal
      title={<Space><ShoppingCartOutlined /><Text strong>Xác nhận hoàn tất đơn hàng</Text></Space>}
      open={open}
      width={1000}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Xác nhận hoàn thành"
      cancelText="Hủy"
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {categories.map((cat) => {
          const catItems = cat.RequestItems ?? [];
          const catActualTotal = catItems.reduce((s, i) => {
            const qty = localQty[i.Id] ?? i.ProposedQuantity;
            return s + qty * i.UnitPrice;
          }, 0);
          const catProposedTotal = catItems.reduce((s, i) => s + i.ProposedQuantity * i.UnitPrice, 0);
          const catDiff = catProposedTotal - catActualTotal;
          const catQuota = cat.Category?.AllowedQuota ?? cat.AllowedQuota ?? 0;

          return (
            <Card
              key={cat.Id}
              size="small"
              title={<Text strong>{cat.Name}</Text>}
              extra={
                <Space size="middle">
                  <Text>Hạn mức: <Text strong>{fmtVnd(catQuota)}</Text></Text>
                  <Text>Đề xuất: <Text strong style={{ color: "#10b981" }}>{fmtVnd(catProposedTotal)}</Text></Text>
                  <Text>Thực tế: <Text strong style={{ color: "#14b8a6" }}>{fmtVnd(catActualTotal)}</Text></Text>
                  <Text>Chênh lệch: <Text strong className={catDiff > 0 ? "pr-text-danger" : "pr-text-emerald"}>
                    {catDiff >= 0 ? "-" : "+"}{fmtVnd(Math.abs(catDiff))}
                  </Text></Text>
                </Space>
              }
            >
              <Table
                dataSource={catItems}
                rowKey="Id"
                pagination={false}
                size="small"
                columns={[
                  { title: "Sản phẩm", dataIndex: "ProductName" },
                  { title: "SL Đề xuất", dataIndex: "ProposedQuantity", align: "center" },
                  { title: "Đơn giá", dataIndex: "UnitPrice", align: "right", render: (val: number) => fmtVnd(val) },
                  {
                    title: "SL Thực tế", align: "center", width: 120,
                    render: (_, item) => (
                      <InputNumber
                        min={0}
                        style={{ width: 80 }}
                        value={localQty[item.Id]}
                        onChange={(val) => onQtyChange(item.Id, val)}
                      />
                    ),
                  },
                  {
                    title: "Thành tiền", align: "right",
                    render: (_, item) => {
                      const qty = localQty[item.Id] ?? item.ProposedQuantity;
                      return <Text strong>{fmtVnd(qty * item.UnitPrice)}</Text>;
                    },
                  },
                  {
                    title: "Chênh lệch", align: "right",
                    render: (_, item) => {
                      const proposed = item.ProposedQuantity * item.UnitPrice;
                      const actual = (localQty[item.Id] ?? item.ProposedQuantity) * item.UnitPrice;
                      const diff = proposed - actual;
                      return (
                        <Text type={diff > 0 ? "danger" : diff < 0 ? "success" : undefined}>
                          {diff !== 0 ? fmtVnd(Math.abs(diff)) : "—"}
                        </Text>
                      );
                    },
                  },
                ]}
              />
            </Card>
          );
        })}

        <Descriptions bordered size="small" column={3} labelStyle={{ fontWeight: "bold" }}>
          <Descriptions.Item label="Tổng đề xuất">
            <Text strong style={{ color: "#10b981" }}>{fmtVnd(totalProposed)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng thực tế">
            <Text strong style={{ color: "#14b8a6" }}>{fmtVnd(totalActual)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng chênh lệch">
            <Text strong className="pr-text-danger">{fmtVnd(Math.abs(totalProposed - totalActual))}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Input.TextArea
          rows={2}
          placeholder="Ghi chú (không bắt buộc)..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </Space>
    </Modal>
  );
};
