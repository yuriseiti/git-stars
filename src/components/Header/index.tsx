import React from 'react';
import { HeaderContainer } from './styles';

import GitStars from '../../assets/git-stars-high-resolution-logo-transparent.svg';

const Header: React.FC = () => {
    return (
        <HeaderContainer>
            <img src={GitStars} alt="GitStars" style={{ height: "24px"}}/>
        </HeaderContainer>
    );
};

export default Header;