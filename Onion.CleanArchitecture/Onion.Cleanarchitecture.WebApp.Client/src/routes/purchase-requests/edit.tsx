import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Typography,Form, Input, InputNumber, Select, Row, Col } from "antd";
import { InfoCircleOutlined, DollarOutlined, TeamOutlined } from "@ant-design/icons";
import type { IPurchaseRequest } from "./types";
import { PurchaseRequestForm } from "./form";

const { Title } = Typography;
const statusOptions = [
  { value: 1, label: "Draft" },
  { value: 2, label: "Pending Department" },
  { value: 3, label: "Pending Control" },
  { value: 4, label: "Returned for Edit" },
  { value: 5, label: "Approved" },
  { value: 6, label: "Pending Order Confirm" },
  { value: 7, label: "Completed" },
  { value: 8, label: "Rejected by Dept" },
  { value: 9, label: "Rejected by Control" },
];

export const EditPurchaseRequest = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IPurchaseRequest>({ redirect: "show" });
  const initialData = queryResult?.data?.data;

  const { selectProps: deptSelectProps } = useSelect({
    resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
  });
  const { selectProps: configSelectProps } = useSelect({
    resource: "proposal-configs", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" },
  });

  const canEditAmounts = !initialData || initialData.Status < 5;

  return (
    <Edit
    title={<Title level={3} style={{ margin: 0 }}>Chỉnh Sửa Phiếu Đề Xuất</Title>}
    saveButtonProps={saveButtonProps}>
    

      <Form {...formProps} layout="vertical" className="pr-form">
        <PurchaseRequestForm initialData={initialData}>
          <div className="pr-card">
            <div className="pr-card-header">
              <div className="pr-card-icon blue"><InfoCircleOutlined /></div>
              <h3>Thông tin chung</h3>
            </div>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="Code" label="Mã phiếu" rules={[{ required: true }, { max: 50 }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="DepartmentId" label="Đơn vị">
                  <Select {...deptSelectProps} placeholder="Chọn đơn vị..." disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="ProposalConfigId" label="Cấu hình đề xuất">
                  <Select {...configSelectProps} placeholder="Chọn cấu hình..." disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="Status" label="Trạng thái">
                  <Select options={statusOptions} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="pr-card">
            <div className="pr-card-header">
              <div className="pr-card-icon orange"><DollarOutlined /></div>
              <h3>Thông tin tài chính</h3>
            </div>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item label="Tổng tiền đề xuất" name="TotalProposedAmount">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(val) => Number(val?.replace(/,/g, "") || 0)}
                    disabled={!canEditAmounts}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Tổng tiền thực tế" name="TotalActualAmount">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(val) => Number(val?.replace(/,/g, "") || 0)}
                    disabled={!canEditAmounts}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {initialData && (
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon purple"><TeamOutlined /></div>
                <h3>Thông tin bổ sung</h3>
              </div>
              <Row gutter={24}>
                <Col xs={24} md={6}>
                  <div className="pr-field">
                    <label>Người tạo</label>
                    <div className="pr-topbar-value" style={{ padding: "4px 0" }}>{initialData.CreatedBy || "—"}</div>
                  </div>
                </Col>
                <Col xs={24} md={6}>
                  <div className="pr-field">
                    <label>Ngày tạo</label>
                    <div className="pr-topbar-value" style={{ padding: "4px 0" }}>{new Date(initialData.Created).toLocaleDateString("vi-VN")}</div>
                  </div>
                </Col>
                <Col xs={24} md={6}>
                  <div className="pr-field">
                    <label>Cập nhật lần cuối</label>
                    <div className="pr-topbar-value" style={{ padding: "4px 0" }}>{initialData.LastModified ? new Date(initialData.LastModified).toLocaleDateString("vi-VN") : "—"}</div>
                  </div>
                </Col>
                <Col xs={24} md={6}>
                  <div className="pr-field">
                    <label>Người cập nhật</label>
                    <div className="pr-topbar-value" style={{ padding: "4px 0" }}>{initialData.LastModifiedBy || "—"}</div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </PurchaseRequestForm>
      </Form>
    </Edit>
  );
};