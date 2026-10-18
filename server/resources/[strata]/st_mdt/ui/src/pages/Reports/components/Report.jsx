import React from 'react';
import { makeStyles } from '@mui/styles';
import { useNavigate, useLocation } from 'react-router';
import { ReportTypes } from '../../../data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import qs from 'qs';
import Moment from 'react-moment';

const useStyles = makeStyles(() => ({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'background 0.12s ease',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { background: 'rgba(255,255,255,0.03)' },
        '&.active': { background: 'rgba(255,92,58,0.06)' },
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
        fontSize: '0.65rem',
        color: '#FF5C3A',
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
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    labelStrong: {
        color: '#FF5C3A',
        fontWeight: 600,
    },
    sub: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        color: 'rgba(255,255,255,0.28)',
        marginTop: 1,
    },
    time: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.62rem',
        color: 'rgba(255,255,255,0.28)',
        flexShrink: 0,
    },
}));

export default ({ report }) => {
    const classes  = useStyles();
    const history  = useNavigate();
    const location = useLocation();

    let qry      = qs.parse(location.search.slice(1));
    const reportId = qry.report;
    const isActive = reportId == report.id;

    const onClick = () => {
        let s = qs.parse(location.search.slice(1));
        s.report = report.id;
        s.mode = 'view';
        history({ path: location.pathname, search: qs.stringify(s) });
    };

    const reportTypeName = ReportTypes.find(r => r.value == report.type)?.short ?? 'Incident';

    return (
        <div className={`${classes.row}${isActive ? ' active' : ''}`} onClick={onClick}>
            <div className={classes.icon}>
                <FontAwesomeIcon icon={['fas', 'file-lines']} />
            </div>
            <div className={classes.body}>
                <div className={classes.label}>
                    <span className={classes.labelStrong}>{reportTypeName} #{report.id ?? 0}</span>
                    {' — '}{report.title}
                </div>
                <div className={classes.sub}>
                    {report.creatorName}
                </div>
            </div>
            <Moment className={classes.time} date={report.created} fromNow />
        </div>
    );
};
