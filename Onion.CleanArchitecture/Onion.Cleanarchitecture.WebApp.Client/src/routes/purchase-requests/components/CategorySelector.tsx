import { Select, Alert, Space, Typography } from "antd";
import { AppstoreOutlined, DownOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import type { ICascadeCategory } from "../types";

const { Text } = Typography;
const fmtVnd = (n: number) => (n || 0).toLocaleString("vi-VN") + " ₫";

interface CategorySelectorProps {
  categories: ICascadeCategory[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => Promise<void>;
  totalCategories: number;
  totalItems: number;
  totalAmount: number;
}

export const CategorySelector = ({
  categories, selectedIds, onSelectionChange,
  totalCategories, totalItems, totalAmount,
}: CategorySelectorProps) => (
  <>
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Nhấn vào đây để chọn danh mục cần mua..."
      value={selectedIds}
      onChange={onSelectionChange}
      prefix={<AppstoreOutlined className="pr-text-secondary pr-mr-8" />}
      suffixIcon={<DownOutlined />}
      maxTagCount="responsive"
      options={categories.map((c) => ({
        label: `${c.categoryName} (Định mức: ${fmtVnd(c.allowedQuota)})`,
        value: c.categoryId,
      }))}
      filterOption={(input, option) =>
        ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />

    {totalItems > 0 && (
      <Alert
        type="info"
        showIcon
        icon={<ShoppingCartOutlined />}
        message={
          <Space size="large" wrap>
            <Text>Số danh mục: <Text strong>{totalCategories}</Text></Text>
            <Text>Số sản phẩm: <Text strong>{totalItems}</Text></Text>
            <Text>
              Tổng tiền: <Text strong className="pr-text-emerald" style={{ fontSize: 16 }}>{fmtVnd(totalAmount)}</Text>
            </Text>
          </Space>
        }
        style={{ marginTop: 16, marginBottom: 16 }}
      />
    )}
  </>
);
