import React from "react";
import { Container } from "./styles";
import { Tooltip } from "@mui/material";

interface InfoCardProps {
  icon: React.ReactNode;
  value?: string;
  label: string;
  date?: Date;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, value, date, label }) => {
  return (
    <Container>
      <div className="info-card-icon">{icon}</div>
      {value ? (
        <div className="info-card-value">{value}</div>
      ) : (
        <>
          <Tooltip title={date!.toLocaleString()} arrow placement="right">
            <div className="info-card-value">{date!.toLocaleDateString()}</div>
          </Tooltip>
        </>
      )}
      <div className="info-card-label">{label}</div>
    </Container>
  );
};

export default InfoCard;
