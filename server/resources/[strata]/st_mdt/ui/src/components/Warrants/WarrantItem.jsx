import React from 'react';
import { makeStyles } from '@mui/styles';
import Moment from 'react-moment';
import Truncate from '@nosferatu500/react-truncate';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles(() => ({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        textDecoration: 'none',
        transition: 'background 0.12s ease',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { background: 'rgba(255,255,255,0.03)' },
    },
    icon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        background: 'rgba(255,68,68,0.08)',
        border: '1px solid rgba(255,68,68,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        color: '#ff4444',
        flexShrink: 0,
    },
    body: {
        flex: 1,
        minWidth: 0,
    },
    label: {
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
}));

export default ({ warrant }) => {
    const classes = useStyles();

    return (
        <Link className={classes.row} to={`/warrants?warrant=${warrant.id}`}>
            <div className={classes.icon}>
                <FontAwesomeIcon icon={['fas', 'file-circle-exclamation']} />
            </div>
            <div className={classes.body}>
                <div className={classes.label}>
                    <Truncate lines={1}>{warrant.title}</Truncate>
                </div>
                <div className={classes.sub}>
                    Expires <Moment date={warrant.expires} fromNow withTitle titleFormat="LLLL" interval={60000} />
                </div>
            </div>
        </Link>
    );
};
