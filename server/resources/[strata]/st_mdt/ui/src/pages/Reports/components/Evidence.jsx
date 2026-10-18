import React from 'react';
import { makeStyles } from '@mui/styles';
import { EvidenceTypes } from './EvidenceForm';
import EvidenceItem from './EvidenceItem';

const useStyles = makeStyles(() => ({
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
        gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    accent: {
        width: 2,
        height: 12,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #FF5C3A 0%, #FF8C42 100%)',
        flexShrink: 0,
    },
    label: {
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 700,
        fontSize: '0.60rem',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.38)',
    },
    body: {
        padding: '8px 10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
    },
}));

export default ({ evidence, onClick, onDelete }) => {
    const classes = useStyles();

    if (!evidence || evidence.length === 0) return null;

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <div className={classes.accent} />
                <span className={classes.label}>Evidence</span>
            </div>
            <div className={classes.body}>
                {evidence.map((item, k) => (
                    <EvidenceItem
                        key={`evidence-${k}`}
                        item={item}
                        onView={() => onClick(k)}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};
