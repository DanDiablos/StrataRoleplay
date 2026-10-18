import React from "react";
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = makeStyles(() => ({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { background: 'rgba(255,255,255,0.03)' },
    },
    icon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        background: 'rgba(255,92,58,0.08)',
        border: '1px solid rgba(255,92,58,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        color: '#FF5C3A',
        flexShrink: 0,
    },
    body: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: '0.82rem',
        color: 'rgba(255,255,255,0.72)',
        lineHeight: 1.3,
    },
    sub: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        color: 'rgba(255,255,255,0.28)',
        marginTop: 1,
    },
    badge: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        color: 'rgba(255,255,255,0.28)',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 4,
        padding: '1px 5px',
        flexShrink: 0,
    },
}));

export default ({ data }) => {
    const classes = useStyles();

    return (
        <div className={classes.row}>
            <div className={classes.icon}>
                <FontAwesomeIcon icon={['fas', 'scale-balanced']} />
            </div>
            <div className={classes.body}>
                <div className={classes.name}>
                    {data.Grade} {data.First[0]}. {data.Last}
                </div>
                <div className={classes.sub}>
                    SID {data.SID} &mdash; {data.Phone}
                </div>
            </div>
            <span className={classes.badge}>{data.Workplace}</span>
        </div>
    );
};
