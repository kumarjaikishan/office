import React, { useState } from 'react';
import { Popover, Typography, List, ListItem, ListItemText, Badge } from '@mui/material';
import { CiBullhorn } from "react-icons/ci";

export const NotificationIcon1 = ({ notifications }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Badge badgeContent={notifications.length} color="secondary" onClick={handleClick} className='cursor-pointer'>
                <CiBullhorn size={24} />
            </Badge>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <List sx={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No notifications" />
                        </ListItem>
                    ) : (
                        notifications.map((notif, index) => (
                            <ListItem key={index} button>
                                <ListItemText
                                    primary={notif.message}
                                    secondary={new Date(notif.createdAt).toLocaleString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', hour12: true,
                                    })}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </Popover>
        </>
    );
};
