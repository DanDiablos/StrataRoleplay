import React from 'react';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Item from './Item';

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
        gap: 8,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
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
    list: {
        maxHeight: '30vh',
        overflowY: 'auto',
    },
    empty: {
        padding: '20px 14px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
    },
}));

export default ({ govWorkers = {} }) => {
    const classes = useStyles();

    return (
        <Grid item xs={6} className={classes.container}>
            <div className={classes.card}>
                <div className={classes.header}>
                    <div className={classes.accent} />
                    <span className={classes.title}>Available DOJ</span>
                </div>
                <div className={classes.list}>
                    {govWorkers && govWorkers.length > 0 ? (
                        govWorkers
                            .sort((a, b) => a.Workplace.localeCompare(b.Workplace) || a.Last.localeCompare(b.Last))
                            .map((data, k) => <Item key={`govWorkers-${k}`} data={data} />)
                    ) : (
                        <div className={classes.empty}>No DOJ personnel on duty</div>
                    )}
                </div>
            </div>
        </Grid>
    );
};
