import React, { useState } from "react";
import { ImportButton, useImport, Create, Breadcrumb } from "@refinedev/antd";
import { Table, Tag, Typography, Card, Flex } from "antd";
import type { TableProps } from "antd";
import { HttpError } from "@refinedev/core";
import { IProduct } from "./types";
import "../../assets/product.css";

const { Title, Text } = Typography;

interface IProductError extends IProduct {
  Message: string;
  Success: boolean;
}

export const CreateRangeProduct: React.FC = () => {
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0 });
  const [responses, setResponses] = useState<IProductError[]>([]);

  const handleSuccess = (successes: any[]) => {
    successes.forEach((success) => setResponses((prev) => [...prev, ...(success.response as IProductError[])]));
  };

  const handleError = (errors: any[]) => {
    errors.forEach((error) => {
      const errorRequest = error.request as IProduct[];
      const errorResponse = error.response as HttpError[];
      setResponses((prev) => [
        ...prev,
        ...errorRequest.map((req, idx) => ({ ...req, Message: errorResponse[idx].message, Success: false })),
      ]);
    });
  };

  const importProps = useImport<IProductError>({
    resource: "products",
    onFinish: (result) => {
      if (result.succeeded.length > 0) handleSuccess(result.succeeded);
      if (result.errored.length > 0) handleError(result.errored);
    },
    onProgress: (progress) => setImportProgress({ processed: progress.processedAmount, total: progress.totalAmount }),
    paparseOptions: { header: false },
    batchSize: 5,
  });

  const columns: TableProps<IProductError>["columns"] = [
    { title: "Trạng thái", dataIndex: "Success", render: (val) => val ? <Tag color="success">Thành công</Tag> : <Tag color="error">Lỗi</Tag> },
    { title: "Mã sản phẩm", dataIndex: "Code", render: (val) => <Text strong>{val}</Text> },
    { title: "Tên sản phẩm", dataIndex: "Name" },
    { title: "Thông báo", dataIndex: "Message", render: (val, record) => <Text type={record.Success ? "secondary" : "danger"}>{val || "—"}</Text> },
  ];

  return (
    <Create
      title={<Title level={3} className="pd-m-0 pd-text-ocean pd-font-bold">Thêm sản phẩm hàng loạt</Title>}
      breadcrumb={<Breadcrumb breadcrumbProps={{ items: [{ title: "Sản phẩm", href: "/products" }, { title: "Thêm hàng loạt" }] }} />}
    >
      <Card className="pd-card pd-card-ocean">
        <Flex justify="space-between" align="center" className="pd-mb-24">
          <ImportButton {...importProps} accept=".csv" className="pd-btn-primary" />
          <Text type="secondary" style={{ fontSize: 15 }}>
            Đã xử lý: <Text strong className="pd-text-ocean">{importProgress.processed} / {importProgress.total}</Text> dòng
          </Text>
        </Flex>
        
        <Table columns={columns} dataSource={responses} pagination={{ pageSize: 20 }} size="middle" rowKey={(record, idx) => record.Code || String(idx)} bordered />
      </Card>
    </Create>
  );
};