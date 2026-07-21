import React, { useState } from "react";
import { ImportButton, useImport, Create, Breadcrumb } from "@refinedev/antd";
import { Space, Table, Tag, Typography, Card } from "antd";
import type { TableProps } from "antd";
import { HttpError } from "@refinedev/core";
import { IProduct } from "./types";

const { Title, Text } = Typography;

interface IProductError extends IProduct {
  Message: string;
  Success: boolean;
}

export const CreateRangeProduct: React.FC = () => {
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0 });
  const [responses, setResponses] = useState<IProductError[]>([]);

  const handleSuccess = (successes: any[]) => {
    successes.forEach((success) => {
      const successData = success.response as IProductError[];
      setResponses((prev: IProductError[]) => [...prev, ...successData]);
    });
  };

  const handleError = (errors: any[]) => {
    errors.forEach((error) => {
      const errorRequest = error.request as IProduct[];
      const errorResponse = error.response as HttpError[];
      setResponses((prev) => [
        ...prev,
        ...errorRequest.map((request, index) => ({
          ...request,
          Message: errorResponse[index].message,
          Success: false,
        })),
      ]);
    });
  };

  const importProps = useImport<IProductError>({
    resource: "products",
    onFinish: (result) => {
      const { succeeded, errored } = result;
      if (succeeded.length > 0) handleSuccess(succeeded);
      if (errored.length > 0) handleError(errored);
    },
    onProgress: (progress) => {
      setImportProgress({ processed: progress.processedAmount, total: progress.totalAmount });
    },
    paparseOptions: { header: false },
    batchSize: 5,
  });

  const columns: TableProps<IProductError>["columns"] = [
    { title: <Text strong style={{ color: '#476481' }}>Trạng thái</Text>, dataIndex: "Success", key: "Success", render: (value) => value ? <Tag color="cyan">Thành công</Tag> : <Tag color="red">Lỗi</Tag> },
    { title: <Text strong style={{ color: '#476481' }}>Mã SP</Text>, dataIndex: "Code", key: "Code" },
    { title: <Text strong style={{ color: '#476481' }}>Tên SP</Text>, dataIndex: "Name", key: "Name" },
    { title: <Text strong style={{ color: '#476481' }}>Thông báo</Text>, dataIndex: "Message", key: "Message" },
  ];

  return (
    <Create
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Import Sản phẩm hàng loạt</Title>}
      breadcrumb={<Breadcrumb breadcrumbProps={{ items: [{ title: "Sản phẩm", href: "/products" }, { title: "Thêm hàng loạt" }] }} />}
    >
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.08)" }} bodyStyle={{ padding: 24 }}>
        <Space style={{ marginBottom: 24 }}>
          <ImportButton {...importProps} accept=".csv" style={{ background: '#7a9dc1', borderColor: '#7a9dc1', color: '#fff', borderRadius: 6, fontWeight: 600 }} />
          <Text style={{ fontSize: 15, color: '#6b7c93' }}>
            Đã xử lý: <strong style={{ color: '#476481' }}>{importProgress.processed} / {importProgress.total}</strong> dòng
          </Text>
        </Space>
        
        <Table columns={columns} dataSource={responses} pagination={{ pageSize: 20 }} size="middle" rowKey={(record, idx) => record.Code || String(idx)} />
      </Card>
    </Create>
  );
};