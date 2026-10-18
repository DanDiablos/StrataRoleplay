import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { usePermissions } from '../../hooks';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'stretch',
        height: 44,
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar': { height: 0 },
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '0 0.9rem',
        cursor: 'pointer',
        position: 'relative',
        whiteSpace: 'nowrap',
        flex: 1,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: '0.84rem',
        color: 'rgba(255,255,255,0.38)',
        transition: 'color 0.15s ease',
        border: 'none',
        background: 'none',
        outline: 'none',
        '&:hover': {
            color: 'rgba(255,255,255,0.72)',
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '0.9rem',
            right: '0.9rem',
            height: 2,
            background: '#FF5C3A',
            borderRadius: '2px 2px 0 0',
            opacity: 0,
            transform: 'scaleX(0.4)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
        },
    },
    tabActive: {
        color: 'rgba(255,255,255,0.92)',
        '&::after': {
            opacity: 1,
            transform: 'scaleX(1)',
        },
    },
    tabIcon: {
        fontSize: '0.8rem',
        flexShrink: 0,
    },
}));

export default ({ links }) => {
    const classes  = useStyles();
    const location = useLocation();
    const history  = useNavigate();
    const hasPerm  = usePermissions();
    const user     = useSelector((state) => state.app.user);

    const [active, setActive] = useState('/');

    useEffect(() => {
        const match = links.find(
            (l) => l.path === location.pathname ||
                (l.path !== '/' && location.pathname.startsWith(l.path)),
        );
        setActive(match?.path ?? '/');
    }, [location.pathname, links]);

    const visible = links.filter(
        (l) => !l.restrict || (Boolean(user) && hasPerm(l.restrict.permission)),
    );

    return (
        <div className={classes.root}>
            {visible.map((l) => (
                <button
                    key={l.path}
                    className={`${classes.tab} ${active === l.path ? classes.tabActive : ''}`}
                    onClick={() => history(l.path)}
                >
                    <FontAwesomeIcon className={classes.tabIcon} icon={l.icon} />
                    {l.label}
                </button>
            ))}
        </div>
    );
};
