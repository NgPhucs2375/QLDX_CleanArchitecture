import { List, ShowButton, DateField } from "@refinedev/antd";
import { CanAccess } from "@refinedev/core";
import { Table, Space, Button, Typography, Avatar } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { usePurchaseRequestList } from "./hooks";
import { StatusTag } from "./components";
import { PaginationTotal } from "@components/pagination-total";
import "../../assets/purchase-request.css";

const { Title, Text } = Typography;

export const ListPurchaseRequest = () => {
  const { tableProps, selectedRowKeys, setSelectedRowKeys, handleDelete, usersData, navigateToCreate } = usePurchaseRequestList();

  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) };

  return (
    <List
      title={<Title level={3} className="pr-m-0 pr-text-emerald">Danh sách Đề Xuất</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="purchase-requests" action="delete">
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={handleDelete}>
              Xóa ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="purchase-requests" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={navigateToCreate} className="pr-bg-emerald">Tạo mới</Button>
          </CanAccess>
        </Space>
      }
    >
      <Table {...tableProps} rowKey="Id" rowSelection={rowSelection}
        pagination={{ ...tableProps.pagination, showTotal: (t) => <PaginationTotal total={t} entityName="đề xuất" /> }}
      >
        <Table.Column dataIndex="Code" title="Mã phiếu" sorter render={(val) => <Text strong>{val}</Text>} />
        <Table.Column dataIndex="CreatedBy" title="Người tạo"
          render={(val: string) => {
            const user = usersData?.find((u) => u.Id === val || u.id === val);
            const name = (user?.UserName ?? user?.Name ?? val) as string;
            return <Space><Avatar size="small" icon={<UserOutlined />} /><Text>{name || "Hệ thống"}</Text></Space>;
          }}
        />
        <Table.Column dataIndex="Status" title="Trạng thái" sorter
          render={(val: number) => <StatusTag status={val} />}
        />
        <Table.Column dataIndex="Created" title="Ngày tạo" sorter
          render={(value) => <DateField format="DD/MM/YYYY HH:mm" value={value} />}
        />
        <Table.Column title="Hành động" align="center"
          render={(_, record) => (
            <Space><ShowButton hideText size="small" recordItemId={(record as any).Id} /></Space>
          )}
        />
      </Table>
    </List>
  );
};
