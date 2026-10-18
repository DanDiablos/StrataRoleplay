import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
    },
    name: {
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 1,
    },
    sub: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.6rem',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.04em',
        lineHeight: 1,
    },
    callsign: {
        color: theme.palette.primary.main,
    },
}));

export default () => {
    const classes = useStyles();
    const cData   = useSelector((state) => state.app.user);
    const job     = useSelector((state) => state.app.govJob);

    if (!cData || !job) return null;

    switch (job?.Id) {
        case 'police':
        case 'prison':
            return (
                <div className={classes.root}>
                    <span className={classes.name}>
                        {cData.First[0]}. {cData.Last}
                    </span>
                    <span className={classes.sub}>
                        {job.Grade?.Name}
                        {Boolean(cData.Callsign) && (
                            <> &mdash; <span className={classes.callsign}>{cData.Callsign}</span></>
                        )}
                    </span>
                </div>
            );
        case 'ems':
            return (
                <div className={classes.root}>
                    <span className={classes.name}>
                        {cData.First[0]}. {cData.Last}
                    </span>
                    <span className={classes.sub}>
                        {job.Grade?.Name}
                        {Boolean(cData.Callsign) && (
                            <> &mdash; <span className={classes.callsign}>{cData.Callsign}</span></>
                        )}
                    </span>
                </div>
            );
        case 'government':
            return (
                <div className={classes.root}>
                    <span className={classes.name}>
                        {cData.First} {cData.Last}
                    </span>
                    <span className={classes.sub}>{job.Grade?.Name}</span>
                </div>
            );
        default:
            return null;
    }
};
