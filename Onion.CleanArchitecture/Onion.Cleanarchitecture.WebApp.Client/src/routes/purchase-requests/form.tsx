import React from "react";
import type { IPurchaseRequest } from "./types";
import { Space } from "antd";
import "../../assets/purchase-request.css";

export const PurchaseRequestForm = ({ 
  children, 
  initialData 
}: { 
  children?: React.ReactNode; 
  initialData?: IPurchaseRequest; 
}) => {
  return (
    <Space direction="vertical" className="pr-w-100 pr-container">
      {children}
    </Space>
  );
};