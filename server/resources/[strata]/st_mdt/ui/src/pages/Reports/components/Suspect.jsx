import React, { useState, useEffect } from 'react';
import { Chip, Grid, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { CurrencyFormat } from '../../../util/Parser';
import { PleaTypes } from './SuspectForm';
import Truncate from '@nosferatu500/react-truncate';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
        width: '100%',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
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
    name: {
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.84rem',
        color: 'rgba(255,255,255,0.82)',
    },
    plea: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        color: theme.palette.primary.main,
        marginLeft: 6,
    },
    actions: {
        display: 'flex',
        gap: 4,
    },
    actionBtn: {
        width: 26,
        height: 26,
        borderRadius: 5,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.65rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover:not(:disabled)': {
            background: 'rgba(255,255,255,0.08)',
            color: '#ffffff',
        },
        '&:disabled': {
            opacity: 0.3,
            cursor: 'default',
        },
    },
    body: {
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    charge: {
        fontSize: '0.72rem',
        '&.type-1': { backgroundColor: theme.palette.info.main },
        '&.type-2': { backgroundColor: theme.palette.warning.main },
        '&.type-3': { backgroundColor: theme.palette.error.main },
    },
    stats: {
        padding: '8px 12px',
        display: 'flex',
        gap: 16,
        position: 'relative',
    },
    stat: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.38)',
        '& span': {
            fontFamily: "'Fira Mono', monospace",
            color: 'rgba(255,255,255,0.65)',
            marginLeft: 4,
        },
    },
    flags: {
        display: 'flex',
        gap: 4,
        marginLeft: 'auto',
    },
    flag: {
        fontSize: '0.75rem',
        color: theme.palette.error.light,
    },
}));

export default ({ data, onEdit, onDelete }) => {
    const classes = useStyles();
    const charges = useSelector((state) => state.data.data.charges);

    const [susCharges, setSusCharges] = useState(Array());

    useEffect(() => {
        if (data.charges) {
            setSusCharges(
                data.charges
                    .filter((c) => charges.find(ch => ch.id === c.id))
                    .map(c => ({
                        ...charges.find(ch => ch.id == c.id),
                        id: c.id,
                        count: c.count,
                    }))
            );
        }
    }, [data]);

    const months  = susCharges.filter((c) => c.jail).reduce((a, b) => +a + +b.jail, 0);
    const fine    = susCharges.filter((c) => c.fine).reduce((a, b) => +a + +b.fine * b.count, 0);
    const points  = susCharges.filter((c) => c.points).reduce((a, b) => +a + +b.points * b.count, 0);
    const isFelony = susCharges.filter((c) => c.type > 2).length > 0;

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <div className={classes.headerLeft}>
                    <div className={classes.accent} />
                    <span className={classes.name}>{data.First} {data.Last}</span>
                    <span className={classes.plea}>{PleaTypes.find((p) => p.value == data.plea)?.label}</span>
                </div>
                <div className={classes.actions}>
                    <IconButton
                        className={classes.actionBtn}
                        size="small"
                        onClick={onEdit}
                        disabled={data.sentenced}
                    >
                        <FontAwesomeIcon icon={['fas', 'pen-to-square']} />
                    </IconButton>
                    <IconButton
                        className={classes.actionBtn}
                        size="small"
                        onClick={onDelete}
                        disabled={data.sentenced}
                    >
                        <FontAwesomeIcon icon={['fas', 'trash-can-xmark']} />
                    </IconButton>
                </div>
            </div>
            <div className={classes.body}>
                {susCharges
                    .sort((a, b) => b.jail + b.fine - (a.jail - a.fine))
                    .map((c, k) => (
                        <Chip
                            key={`charge-${k}`}
                            size="small"
                            className={`${classes.charge} type-${c.type}`}
                            label={<Truncate lines={1}>{`${c.title} x${c.count}`}</Truncate>}
                        />
                    ))}
            </div>
            <div className={classes.stats}>
                <span className={classes.stat}>Months<span>{data.sentenced ? data.jail : months}</span></span>
                <span className={classes.stat}>Fine<span>{data.sentenced ? CurrencyFormat.format(data.fine) : CurrencyFormat.format(fine)}</span></span>
                <span className={classes.stat}>Points<span>{data.sentenced ? data.points : points}</span></span>
                {!data.sentenced && (
                    <div className={classes.flags}>
                        {isFelony && !data.Licenses?.Weapons?.Suspended && (
                            <Tooltip title="This will result in this person's weapons permit being revoked">
                                <IconButton size="small" className={classes.flag}>
                                    <FontAwesomeIcon icon={['fas', 'dagger']} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {(!data.Licenses?.Drivers?.Suspended && data.Licenses?.Drivers?.Points + points >= 12) && (
                            <Tooltip title="This will result in this person's drivers license being revoked">
                                <IconButton size="small" className={classes.flag}>
                                    <FontAwesomeIcon icon={['fas', 'id-badge']} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
