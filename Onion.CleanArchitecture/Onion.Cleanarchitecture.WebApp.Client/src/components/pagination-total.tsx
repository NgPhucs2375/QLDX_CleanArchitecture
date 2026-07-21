import { FC } from "react";

type PaginationTotalProps = {
  total: number;
  entityName: string;
};

export const PaginationTotal: FC<PaginationTotalProps> = ({ total }) => {
  return (
    <span style={{ marginLeft: "16px", color: "#6b7c93", fontSize: 14 }}>
      Tổng cộng: <strong style={{ color: "#476481", fontSize: 15 }}>{total}</strong> dòng
    </span>
  );
};