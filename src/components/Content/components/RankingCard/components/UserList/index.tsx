import React from 'react';
import { ListContainer, UserContainer } from './styles';

interface User {
    avatar: string;
    name: string;
    handle: string;
    value: string;
}

interface UserListProps {
    users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
    return (
        <ListContainer>
            {users.map((user, index) => (
                <UserContainer key={index}>
                    <div className="column">
                        <img src={user.avatar} alt="User Avatar" />
                    </div>
                    <div className="column">
                        <div>{user.name}</div>
                        <div>{user.handle}</div>
                    </div>
                    <div className="column">
                        <div>{user.value}</div>
                    </div>
                </UserContainer>
            ))}
        </ListContainer>
    );
};

export default UserList;