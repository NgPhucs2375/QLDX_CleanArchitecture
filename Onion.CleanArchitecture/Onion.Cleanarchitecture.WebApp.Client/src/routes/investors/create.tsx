import { UploadOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import { Create, useForm } from "@refinedev/antd";
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Upload, UploadFile, UploadProps, message, Typography } from "antd";
import { useEffect, useState } from "react";
import { IInvestor } from "./types";
import { categoryDummy, delayDummy } from "./dummy";
import { InvestorForm } from "./form";

const { Title: AntTitle } = Typography;
const urlUpload = "https://webvietbank-api.k8s-prod.vietbank.com.vn/api/files/congbothongtin";

export const CreateInvestor = () => {
  const [height, setHeight] = useState(window.innerHeight);
  const [urlFile, setUrlFile] = useState<string>("");
  const { formProps, saveButtonProps } = useForm<IInvestor>({ redirect: "list" });

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
          setUrlFile(urlResponse);
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
            message.success(`${nameFile} đã xóa thành công`);
            setUrlFile("");
            formProps.form?.setFieldsValue({ FileUrl: "" });
          })
          .catch((error) => {
            message.error(`Xóa file ${nameFile} thất bại.`);
            console.error("Error:", error);
          });
        return true;
      }
      return false;
    },
  };

  return (
    <Create
      resource="investors"
      title={<AntTitle level={3} style={{ margin: 0, color: '#476481' }}>Thêm Mới Tài Liệu Nhà Đầu Tư</AntTitle>}
      saveButtonProps={{ ...saveButtonProps, children: "Lưu Tài Liệu", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <InvestorForm>
        <Row gutter={24}>
          <Col span={12}>
            <Form {...formProps} layout="vertical">
              <div className="inv-card">
                <div className="inv-card-header">
                  <div className="inv-card-icon"><FileTextOutlined /></div>
                  <h3>Thông tin công bố</h3>
                </div>
                <div className="inv-card-body">
                  <Form.Item name="Title" label="Tiêu đề tài liệu" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}>
                    <Input.TextArea rows={3} placeholder="Nhập tiêu đề công bố thông tin..." size="large" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="Category" label="Danh mục" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}>
                        <Select options={categoryDummy} size="large" placeholder="Chọn danh mục..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="Delay" label="Thời gian chờ (giây)" rules={[{ required: true, message: "Vui lòng chọn độ trễ!" }]}>
                        <Radio.Group options={delayDummy} optionType="button" buttonStyle="solid" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Year" label="Năm" rules={[{ required: true, message: "Nhập năm!" }]}>
                        <InputNumber size="large" style={{ width: '100%' }} placeholder="VD: 2026" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Quarter" label="Quý">
                        <InputNumber size="large" style={{ width: '100%' }} placeholder="1-4" min={1} max={4} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Month" label="Tháng" rules={[{ required: true, message: "Nhập tháng!" }]}>
                        <InputNumber size="large" style={{ width: '100%' }} placeholder="1-12" min={1} max={12} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item label="Tệp đính kèm (PDF, DOCX...)">
                    <Upload {...props} maxCount={1}>
                      <Button icon={<UploadOutlined />} size="large" style={{ width: '100%' }}>Tải Lên Máy Chủ</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item name="FileUrl" label="Đường dẫn tĩnh (File URL)" rules={[{ required: true, message: "Đường dẫn file không được trống!" }]}>
                    <Input.TextArea rows={2} value={urlFile} readOnly style={{ background: '#f4f7fa', color: '#6b7c93' }} />
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
                    {urlFile ? (
                      <iframe src={urlFile} width="100%" height="100%" style={{ border: 'none' }} title="Preview"></iframe>
                    ) : (
                      <Typography.Text type="secondary">Chưa có tài liệu nào được tải lên</Typography.Text>
                    )}
                  </div>
                </div>
             </div>
          </Col>
        </Row>
      </InvestorForm>
    </Create>
  );
};