import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Form, Input, Switch, Typography, Row, Col, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { IDepartment, IUser } from "./types";
import { DepartmentForm } from "./form";

const { Title } = Typography;

export const EditDepartment = () => {
  const { formProps, saveButtonProps } = useForm<IDepartment>({ redirect: "list" });

  const { selectProps: userSelectProps } = useSelect<IUser>({
    resource: "users",
    optionLabel: "UserName",
    optionValue: "Id",
    pagination: { mode: "off" },
  });

  return (
    <Edit 
      title={<Title level={3} style={{ margin: 0, color: '#476481' }}>Chỉnh Sửa Đơn Vị/Phòng Ban</Title>}
      saveButtonProps={{ ...saveButtonProps, children: "Cập nhật", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <Form 
        {...formProps} 
        layout="vertical"
        onValuesChange={(changedValues) => {
          if (changedValues.ManagerId === "") formProps.form?.setFieldValue("ManagerId", null);
        }}
      >
        <DepartmentForm>
          <Form.Item name="Id" hidden><Input /></Form.Item>
          
          <div className="dept-card">
            <div className="dept-card-header">
              <div className="dept-card-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}><EditOutlined /></div>
              <h3>Cập nhật thông tin</h3>
            </div>
            <div className="dept-card-body">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Mã đơn vị"
                    name="Code"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã đơn vị!" },
                      { max: 50, message: "Mã không được vượt quá 50 ký tự!" },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tên đơn vị / Phòng ban"
                    name="Name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên đơn vị!" },
                      { max: 200, message: "Tên không được vượt quá 200 ký tự!" },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Trưởng đơn vị (Quản lý)" name="ManagerId">
                    <Select 
                      {...userSelectProps} 
                      size="large"
                      allowClear 
                      showSearch 
                      placeholder="Chọn trưởng đơn vị..."
                      filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Trạng thái hoạt động" name="IsActive" valuePropName="checked">
                    <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
        </DepartmentForm>
      </Form>
    </Edit>
  );
};