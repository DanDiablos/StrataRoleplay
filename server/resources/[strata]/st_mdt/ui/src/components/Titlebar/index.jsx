import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useBranding, useCitySeal } from '../../hooks';
import Nui from '../../util/Nui';
import Account from './Account';

const useStyles = makeStyles(() => ({
    shell: {
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,10,10,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        userSelect: 'none',
    },

    // ── Top row ───────────────────────────────────────────────────────────────
    topBar: {
        height: 52,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'stretch',
        padding: '0 1rem',
        boxSizing: 'border-box',
    },

    left: {
        display: 'flex',
        alignItems: 'center',
        paddingRight: '1.25rem',
        borderRight: '1px solid rgba(255,255,255,0.07)',
    },
    wordmark: {
        display: 'flex',
        alignItems: 'center',
    },
    brand: {
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 900,
        fontSize: '1.05rem',
        background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    slash: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.12)',
        margin: '0 0.28rem',
    },
    sub: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.68rem',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.02em',
    },

    // Spacer (hover zone)
    middle: {
        flex: 1,
    },

    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingLeft: '1.25rem',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
    },
    account: {
        marginRight: 8,
    },
    sep: {
        width: 1,
        height: 18,
        background: 'rgba(255,255,255,0.07)',
        flexShrink: 0,
        marginRight: 2,
    },
    navBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
        transition: 'all 0.15s ease',
        '&:hover': {
            background: 'rgba(255,255,255,0.07)',
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.15)',
        },
    },
    closeBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid rgba(255,92,58,0.2)',
        background: 'rgba(255,92,58,0.06)',
        color: 'rgba(255,92,58,0.7)',
        fontSize: 12,
        transition: 'all 0.15s ease',
        '&:hover': {
            background: 'rgba(255,92,58,0.15)',
            color: '#FF5C3A',
            borderColor: 'rgba(255,92,58,0.4)',
        },
    },

    // ── Tabs row (children) ───────────────────────────────────────────────────
    tabsRow: {
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
}));

export default ({ children }) => {
    const classes  = useStyles();
    const history  = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const job      = useSelector((state) => state.app.govJob);
    const attorney = useSelector((state) => state.app.attorney);
    const hidden   = useSelector((state) => state.app.hidden);

    const branding = useBranding(job, attorney);

    const onClose = () => Nui.send('Close');

    const hoverChange = (state) => {
        if (!hidden && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/system')) {
            dispatch({ type: 'SET_OPACITY_MODE', payload: { state } });
        }
    };

    return (
        <div className={classes.shell}>
            <div className={classes.topBar}>
                <div className={classes.left}>
                    <div className={classes.wordmark}>
                        <span className={classes.brand}>STRATA</span>
                        <span className={classes.slash}>/</span>
                        <span className={classes.sub}>mdt</span>
                    </div>
                </div>

                <div
                    className={classes.middle}
                    onMouseEnter={() => hoverChange(true)}
                    onMouseLeave={() => hoverChange(false)}
                />

                <div className={classes.right}>
                    <div className={classes.account}>
                        <Account />
                    </div>
                    <div className={classes.sep} />
                    <IconButton className={classes.navBtn} size="small" onClick={() => history(-1)}>
                        <FontAwesomeIcon icon={['fas', 'arrow-left']} />
                    </IconButton>
                    <IconButton className={classes.navBtn} size="small" onClick={() => history(1)}>
                        <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                    </IconButton>
                    <IconButton className={classes.closeBtn} size="small" onClick={onClose}>
                        <FontAwesomeIcon icon={['fas', 'xmark']} />
                    </IconButton>
                </div>
            </div>

            {/* Tabs row below */}
            <div className={classes.tabsRow}>
                {children}
            </div>
        </div>
    );
};
