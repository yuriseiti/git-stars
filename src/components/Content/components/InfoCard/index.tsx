import React from 'react';
import { Container } from './styles';

interface InfoCardProps {
    icon: string;
    value: string;
    label: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, value, label }) => {
    return (
        <Container>
            <div className="info-card-icon">{icon}</div>
            <div className="info-card-value">{value}</div>
            <div className="info-card-label">{label}</div>
        </Container>
    );
};

export default InfoCard;