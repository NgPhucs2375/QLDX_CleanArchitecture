import { Edit, useForm } from "@refinedev/antd";
import { IInvestor } from "./types";
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Upload, UploadFile, UploadProps, message, Typography } from "antd";
import { UploadOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { categoryDummy, delayDummy } from "./dummy";
import { InvestorForm } from "./form";

const { Title: AntTitle } = Typography;
const urlUpload = "https://webvietbank-api.k8s-prod.vietbank.com.vn/api/files/congbothongtin";

export const EditInvestor = () => {
  const [height, setHeight] = useState(window.innerHeight);
  const { formProps, saveButtonProps, queryResult } = useForm<IInvestor>({ redirect: "list" });
  
  // Lấy giá trị URL từ initialData để hiển thị ngay khi vừa load form
  const initialFileUrl = formProps.form?.getFieldValue("FileUrl") || queryResult?.data?.data?.FileUrl;

  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const props: UploadProps = {
    name: "file",
    action: urlUpload,
    onChange(info) {
      if (info.file.status === "done") {
        if (info.file.response?.files?.[0]) {
          let urlResponse = info.file.response.files[0].url;
          formProps.form?.setFieldsValue({ FileUrl: urlResponse });
        }
        message.success(`${info.file.name} tải lên thành công`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
    onRemove: (file: UploadFile) => {
      var fileDelete = file.response?.files?.[0];
      if (fileDelete) {
        let nameFile = fileDelete.name;
        fetch(`${urlUpload}/${nameFile}`, { method: "DELETE" })
          .then(() => {
            message.success(`Đã xóa ${nameFile}`);
            formProps.form?.setFieldsValue({ FileUrl: "" });
          })
          .catch((error) => console.error("Error:", error));
        return true;
      }
      return false;
    },
  };

  return (
    <Edit
      resource="investors"
      title={<AntTitle level={3} style={{ margin: 0, color: '#476481' }}>Cập Nhật Tài Liệu Nhá Đầu Tư</AntTitle>}
      saveButtonProps={{ ...saveButtonProps, children: "Lưu Thay Đổi", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <InvestorForm>
        <Row gutter={24}>
          <Col span={12}>
            <Form {...formProps} layout="vertical">
              <Form.Item hidden name="Id"><InputNumber /></Form.Item>
              
              <div className="inv-card">
                <div className="inv-card-header">
                  <div className="inv-card-icon" style={{ background: '#f4f7fa', color: '#476481' }}><EditOutlined /></div>
                  <h3>Cập nhật thông tin</h3>
                </div>
                <div className="inv-card-body">
                  <Form.Item name="Title" label="Tiêu đề tài liệu" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}>
                    <Input.TextArea rows={3} size="large" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="Category" label="Danh mục" rules={[{ required: true }]}>
                        <Select options={categoryDummy} size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="Delay" label="Thời gian chờ (s)" rules={[{ required: true }]}>
                        <Radio.Group options={delayDummy} optionType="button" buttonStyle="solid" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Year" label="Năm" rules={[{ required: true }]}><InputNumber size="large" style={{ width: '100%' }} /></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Quarter" label="Quý"><InputNumber size="large" style={{ width: '100%' }} min={1} max={4}/></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Month" label="Tháng" rules={[{ required: true }]}><InputNumber size="large" style={{ width: '100%' }} min={1} max={12}/></Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item label="Cập nhật tệp mới (Thay thế tệp cũ)">
                    <Upload {...props} maxCount={1}>
                      <Button icon={<UploadOutlined />} size="large" style={{ width: '100%' }}>Tải Lên Máy Chủ</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item name="FileUrl" label="Đường dẫn tĩnh (File URL)" rules={[{ required: true }]}>
                    <Input.TextArea rows={2} readOnly style={{ background: '#f4f7fa', color: '#6b7c93' }} />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </Col>
          <Col span={12}>
             <div className="inv-card">
                <div className="inv-card-header">
                  <div className="inv-card-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}><EyeOutlined /></div>
                  <h3>Trình xem trước tài liệu</h3>
                </div>
                <div className="inv-card-body" style={{ paddingBottom: 24 }}>
                  <div className="inv-iframe-container" style={{ height: height - 320 }}>
                    {initialFileUrl ? (
                      <iframe src={initialFileUrl} width="100%" height="100%" style={{ border: 'none' }} title="Preview"></iframe>
                    ) : (
                      <Typography.Text type="secondary">Chưa có tài liệu nào được tải lên</Typography.Text>
                    )}
                  </div>
                </div>
             </div>
          </Col>
        </Row>
      </InvestorForm>
    </Edit>
  );
};