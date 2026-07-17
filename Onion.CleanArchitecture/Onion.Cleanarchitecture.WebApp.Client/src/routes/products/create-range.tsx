import React, { useState } from "react";
import { ImportButton, useImport, Create, Breadcrumb } from "@refinedev/antd";
import { Space, Table, Tag, Typography } from "antd";
import type { TableProps } from "antd";
import { HttpError } from "@refinedev/core";
import { IProduct } from "./types";

const STYLES = `
  .pearl-table-wrapper { margin-top: 20px; overflow-x: auto; background: #fff; border-radius: 8px; border: 1px solid #e1e7ee; }
  .pearl-table-wrapper .ant-table { font-size: 15px; }
  .pearl-table-wrapper .ant-table-thead > tr > th { background: #7a9dc1 !important; color: #ffffff !important; font-weight: 600; border-bottom: 2px solid #5d82a6 !important; }
`;

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
    { title: "Trạng thái", dataIndex: "Success", key: "Success", render: (value) => value ? <Tag color="cyan">Thành công</Tag> : <Tag color="red">Lỗi</Tag> },
    { title: "Mã SP", dataIndex: "Code", key: "Code" },
    { title: "Tên SP", dataIndex: "Name", key: "Name" },
    { title: "Thông báo", dataIndex: "Message", key: "Message" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <Create
        title={<Typography.Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Import Sản phẩm hàng loạt</Typography.Title>}
        breadcrumb={<Breadcrumb breadcrumbProps={{ items: [{ title: "Products", href: "/products" }, { title: "Create range" }] }} />}
      >
        <Space style={{ marginBottom: 16 }}>
          <ImportButton {...importProps} accept=".csv" style={{ background: '#7a9dc1', borderColor: '#7a9dc1', color: '#fff', borderRadius: 6, fontWeight: 600 }} />
          <span style={{ fontSize: 16, color: '#6b7c93', fontWeight: 500 }}>
            Đã xử lý: {importProgress.processed} / {importProgress.total} dòng
          </span>
        </Space>
        <div className="pearl-table-wrapper">
          <Table columns={columns} dataSource={responses} pagination={{ pageSize: 20 }} />
        </div>
      </Create>
    </>
  );
};