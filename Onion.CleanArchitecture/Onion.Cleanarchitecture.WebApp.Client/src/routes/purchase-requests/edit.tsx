import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Typography, Form, Input, InputNumber, Select, Row, Col, Card, Space } from "antd";
import { InfoCircleOutlined, DollarOutlined } from "@ant-design/icons";
import type { IPurchaseRequest } from "./types";
import { PurchaseRequestForm } from "./form";
import "../../assets/purchase-request.css";

const { Title, Text } = Typography;

export const EditPurchaseRequest = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IPurchaseRequest>({ redirect: "show" });
  const initialData = queryResult?.data?.data;
  const { selectProps: deptSelectProps } = useSelect({ resource: "departments", optionLabel: "Name", optionValue: "Id" });
  const { selectProps: configSelectProps } = useSelect({ resource: "proposal-configs", optionLabel: "Name", optionValue: "Id" });
  const canEditAmounts = !initialData || initialData.Status < 6;

  return (
    <Edit title={<Title level={3} className="pr-m-0 pr-text-emerald">Cập nhật Đề Xuất</Title>} saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <PurchaseRequestForm>
          <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Card className="pr-card pr-card-emerald" title={<Space><InfoCircleOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Thông tin chung</Text></Space>}>
                    <Form.Item name="Code" label="Mã phiếu"><Input disabled /></Form.Item>
                    <Form.Item name="DepartmentId" label="Đơn vị"><Select {...deptSelectProps} disabled /></Form.Item>
                    <Form.Item name="ProposalConfigId" label="Cấu hình"><Select {...configSelectProps} disabled /></Form.Item>
                    <Form.Item name="Status" label="Trạng thái"><InputNumber className="pr-w-100" disabled/></Form.Item>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card className="pr-card pr-card-emerald" title={<Space><DollarOutlined className="pr-text-emerald"/><Text strong className="pr-text-emerald">Tài chính & Quy chiếu</Text></Space>}>
                    <Form.Item label="Tổng tiền đề xuất" name="TotalProposedAmount">
                        <InputNumber className="pr-w-100" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} disabled={!canEditAmounts} />
                    </Form.Item>
                    <Form.Item label="Tổng tiền thực tế" name="TotalActualAmount">
                        <InputNumber className="pr-w-100" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} disabled={!canEditAmounts} />
                    </Form.Item>
                    {initialData && (
                        <Space direction="vertical" className="pr-mt-16 pr-w-100">
                            <Text type="secondary">Người tạo: <Text strong>{initialData.CreatedBy || "—"}</Text></Text>
                            <Text type="secondary">Cập nhật cuối: <Text strong>{initialData.LastModifiedBy || "—"}</Text></Text>
                        </Space>
                    )}
                </Card>
              </Col>
          </Row>
        </PurchaseRequestForm>
      </Form>
    </Edit>
  );
};