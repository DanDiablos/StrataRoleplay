import React, { useEffect, useState } from 'react';
import { Grid, Pagination } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGovJob, usePermissions } from '../../hooks';
import Item from './NBItem';

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
    createBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 5,
        border: '1px solid rgba(255,92,58,0.25)',
        background: 'rgba(255,92,58,0.08)',
        color: '#FF5C3A',
        fontSize: '0.68rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textDecoration: 'none',
        '&:hover': {
            background: 'rgba(255,92,58,0.18)',
            borderColor: 'rgba(255,92,58,0.45)',
        },
    },
    empty: {
        padding: '20px 14px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
    },
    pagi: {
        display: 'flex',
        justifyContent: 'center',
        padding: '10px 0 12px',
    },
}));

export default ({ boardTitle = 'Notice Board', perPage = 3, notices = {} }) => {
    const classes  = useStyles();
    const hasJob   = useGovJob();
    const hasPerm  = usePermissions();
    const PER_PAGE = perPage;
    const [pages, setPages] = useState(1);
    const [page, setPage]   = useState(1);

    const isHighCommand =
        hasPerm('PD_HIGH_COMMAND') || hasPerm('SAFD_HIGH_COMMAND') ||
        hasPerm('DOJ_JUDGE') || hasPerm('GOV_MAYOR') ||
        hasPerm('GOV_DA') || hasPerm('GOV_CPUB') || hasPerm('DOC_HIGH_COMMAND');

    useEffect(() => {
        setPages(Math.ceil(notices.length / PER_PAGE));
        setPage(1);
    }, [notices]);

    return (
        <Grid item xs={12} className={classes.container}>
            <div className={classes.card}>
                <div className={classes.header}>
                    <div className={classes.headerLeft}>
                        <div className={classes.accent} />
                        <span className={classes.title}>{boardTitle}</span>
                    </div>
                    {isHighCommand && (
                        <Link to="create/notice" className={classes.createBtn}>
                            <FontAwesomeIcon icon={['fas', 'plus']} />
                        </Link>
                    )}
                </div>
                <div>
                    {notices && notices.length > 0 ? (
                        notices
                            .sort((a, b) => b.created - a.created)
                            .slice((page - 1) * PER_PAGE, page * PER_PAGE)
                            .map((notice, k) => <Item key={`notices-${k}`} notice={notice} />)
                    ) : (
                        <div className={classes.empty}>No notices posted</div>
                    )}
                </div>
                {pages > 1 && (
                    <div className={classes.pagi}>
                        <Pagination
                            variant="outlined"
                            shape="rounded"
                            color="primary"
                            size="small"
                            page={page}
                            count={pages}
                            onChange={(e, p) => setPage(p)}
                        />
                    </div>
                )}
            </div>
        </Grid>
    );
};
