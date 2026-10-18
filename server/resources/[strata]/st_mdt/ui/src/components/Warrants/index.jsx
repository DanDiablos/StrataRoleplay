import React from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Item from './WarrantItem';

const useStyles = makeStyles(() => ({
    container: {
        padding: 8,
    },
    card: {
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    accent: {
        width: 2,
        height: 14,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #FF5C3A 0%, #FF8C42 100%)',
        flexShrink: 0,
    },
    title: {
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 700,
        fontSize: '0.62rem',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.38)',
    },
    viewBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 5,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.68rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textDecoration: 'none',
        '&:hover': {
            background: 'rgba(255,255,255,0.08)',
            color: '#ffffff',
        },
    },
    empty: {
        padding: '20px 14px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
    },
}));

export default () => {
    const classes  = useStyles();
    const warrants = useSelector((state) => state.data.data.warrants);
    const active   = warrants.filter(w => w.state === 'active');

    return (
        <Grid item xs={6} className={classes.container}>
            <div className={classes.card}>
                <div className={classes.header}>
                    <div className={classes.headerLeft}>
                        <div className={classes.accent} />
                        <span className={classes.title}>Active Warrants</span>
                    </div>
                    <Link to="/warrants" className={classes.viewBtn}>
                        <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                    </Link>
                </div>
                <div>
                    {active.length > 0 ? (
                        active
                            .sort((a, b) => a.expires - b.expires)
                            .map((warrant, k) => <Item key={`warrant-${k}`} warrant={warrant} />)
                    ) : (
                        <div className={classes.empty}>No active warrants</div>
                    )}
                </div>
            </div>
        </Grid>
    );
};
