import { useShow } from "@refinedev/core";
import { IInvestor } from "./types";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tag, Card, Row, Col, Divider, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { categoryDummy } from "./dummy";

const { Title, Text } = Typography;

export const ShowInvestor = () => {
  const { queryResult: { isLoading, data } } = useShow<IInvestor>();
  const record = data?.data;

  const getCategoryLabel = (val?: number) => {
    if (!val) return "—";
    let found = categoryDummy.find((item) => item.value === val);
    if (found) return found.label;
    for (let item of categoryDummy) {
      if (item.options) {
        found = item.options.find((opt) => opt.value === val);
        if (found) return found.label;
      }
    }
    return "Khác";
  };

  return (
    <Show 
      isLoading={isLoading}
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Chi Tiết Công Bố Thông Tin</Title>}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Card bordered={false} style={{ background: '#ffffff', border: '1px solid #e1e7ee', borderRadius: 8, boxShadow: '0 2px 10px rgba(122, 157, 193, 0.05)', height: '100%' }}>
            <div style={{ background: 'linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)', padding: '16px 24px', margin: '-24px -24px 24px -24px', borderBottom: '1px solid #e1e7ee', borderRadius: '8px 8px 0 0' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#476481' }}>Thuộc tính tài liệu</h3>
            </div>
            
            <Row gutter={[32, 24]} style={{ padding: '0 8px' }}>
              <Col span={24}>
                <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Tiêu đề</Title>
                <Text strong style={{ fontSize: 18, color: '#2c3e50' }}>{record?.Title}</Text>
              </Col>
              
              <Col span={24}>
                <Divider style={{ margin: '4px 0', borderColor: '#e1e7ee' }} />
              </Col>
              
              <Col span={12}>
                <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Danh mục</Title>
                <Tag color="geekblue" style={{ fontSize: 14, padding: '4px 10px' }}>{getCategoryLabel(record?.Category)}</Tag>
              </Col>
              <Col span={12}>
                <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Kỳ báo cáo (Năm / Tháng / Quý)</Title>
                <Text strong>{record?.Year} / Tháng {record?.Month} {record?.Quarter ? `/ Quý ${record?.Quarter}` : ''}</Text>
              </Col>
              
              <Col span={12}>
                <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Người tải lên</Title>
                <Text>{record?.CreatedBy}</Text>
              </Col>
              <Col span={12}>
                <Title level={5} style={{ marginTop: 0, color: '#6b7c93', fontSize: 14 }}>Thời gian tạo</Title>
                <DateField value={record?.Created} format="DD/MM/YYYY HH:mm" style={{ fontWeight: 600, color: '#7a9dc1' }} />
              </Col>

              <Col span={24} style={{ marginTop: 16 }}>
                <a href={record?.FileUrl} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#7a9dc1' }}>
                    Tải File Trực Tiếp
                  </Button>
                </a>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
           <Card bordered={false} style={{ background: '#ffffff', border: '1px solid #e1e7ee', borderRadius: 8, boxShadow: '0 2px 10px rgba(122, 157, 193, 0.05)', padding: 0, height: 'calc(100vh - 200px)' }} bodyStyle={{ padding: 0, height: '100%' }}>
              <div style={{ background: '#f0fdfa', padding: '16px 24px', borderBottom: '1px solid #e1e7ee', borderRadius: '8px 8px 0 0' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0d9488' }}>Trình xem trước (Preview)</h3>
              </div>
              <div style={{ height: 'calc(100% - 56px)' }}>
                {record?.FileUrl ? (
                  <iframe src={record.FileUrl} width="100%" height="100%" style={{ border: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} title="Document Viewer"></iframe>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Text type="secondary">Tài liệu không khả dụng</Text>
                  </div>
                )}
              </div>
           </Card>
        </Col>
      </Row>
    </Show>
  );
};