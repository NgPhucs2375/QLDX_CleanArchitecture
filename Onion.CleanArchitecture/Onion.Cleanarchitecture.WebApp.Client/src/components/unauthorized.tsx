import React from "react";
import { useGo } from "@refinedev/core";
import { Button, Result } from "antd";

export const Unauthorized: React.FC = () => {
  const go = useGo();
  
  const handleBackHome = () => {
    go({
      to: {
        resource: "dashboard",
        action: "list",
      },
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)' }}>
      <Result
        status="403"
        title={<span style={{ color: '#476481', fontSize: 48, fontWeight: 700 }}>403</span>}
        subTitle={<span style={{ color: '#6b7c93', fontSize: 16 }}>Xin lỗi, bạn không có quyền truy cập vào trang này.</span>}
        extra={
          <Button onClick={handleBackHome} type="primary" size="large" style={{ background: '#7a9dc1', borderColor: '#7a9dc1', fontWeight: 600, borderRadius: 6 }}>
            Về Trang Chủ
          </Button>
        }
      />
    </div>
  );
};