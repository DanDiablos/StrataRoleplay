import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TextField, InputAdornment, IconButton, Pagination, MenuItem, Checkbox } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { throttle } from 'lodash';
import qs from 'qs';
import { useNavigate, useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { usePermissions, useGovJob, usePerPage } from '../../hooks';

import Nui from '../../util/Nui';
import { Loader } from '../../components';
import Item from './components/Report';

import { ReportTypes } from '../../data';

const useStyles = makeStyles(() => ({
    wrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    searchBar: {
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flexShrink: 0,
    },
    searchRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    evidenceToggle: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.38)',
        fontSize: '0.72rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        '&.active': {
            background: 'rgba(255,92,58,0.12)',
            border: '1px solid rgba(255,92,58,0.3)',
            color: '#FF5C3A',
        },
    },
    results: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    noResults: {
        padding: '40px 14px',
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.82rem',
        color: 'rgba(255,255,255,0.25)',
    },
    pagi: {
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 0 10px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
    },
    createBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid rgba(255,92,58,0.3)',
        background: 'rgba(255,92,58,0.08)',
        color: '#FF5C3A',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        '&:hover': {
            background: 'rgba(255,92,58,0.18)',
            borderColor: 'rgba(255,92,58,0.5)',
        },
    },
}));

export default () => {
    const classes       = useStyles();
    const dispatch      = useDispatch();
    const hasPermission = usePermissions();
    const getPerPage    = usePerPage();
    const hasJob        = useGovJob();
    const history       = useNavigate();
    const location      = useLocation();
    const type          = 'report';
    const isAttorney    = useSelector((state) => state.app.attorney) || hasJob('government', 'publicdefenders');
    const searchTerm    = useSelector((state) => state.search.searchTerms[type]);
    const myJob         = useSelector((state) => state.app.govJob);

    let qry = qs.parse(location.search.slice(1));

    const [toggleEvidenceMode, setToggleEvidenceMode] = useState(false);

    const [reportType, setReportType] = useState(
        ReportTypes.find((r) => hasPermission(r.requiredViewPermission))?.value ?? 1,
    );
    const [pages, setPages]     = useState(1);
    const [page, setPage]       = useState(1);
    const [loading, setLoading] = useState(false);
    const [err, setErr]         = useState(false);
    const [results, setResults] = useState(Array());

    useEffect(() => {
        if (qry.search) {
            dispatch({ type: 'UPDATE_SEARCH_TERM', payload: { type, term: qry.search } });
            fetch(qry.search, 0, 1, pages);
        } else {
            const availTypes = ReportTypes.filter(
                (r) => hasPermission(r.requiredViewPermission) || (r.allowAttorney && isAttorney),
            );
            if (availTypes && availTypes.length > 0) {
                fetch('', availTypes[0].value, 1, pages);
            }
        }
    }, []);

    const createReport = () => {
        let s = qs.parse(location.search.slice(1));
        delete s.report;
        history({ path: location.pathname, search: qs.stringify(s) });
        setTimeout(() => {
            s.mode = 'create';
            history({ path: location.pathname, search: qs.stringify(s) });
        }, 250);
    };

    const fetch = useMemo(
        () =>
            throttle(async (value, rType, page, currentPages, evidenceMode) => {
                let s = qs.parse(location.search.slice(1));
                s.search = value;
                history({ path: location.pathname, search: qs.stringify(s) });

                setLoading(true);
                try {
                    let res = await (
                        await Nui.send('Search', {
                            type,
                            term: value,
                            reportType: rType,
                            page: page ?? 1,
                            perPage: getPerPage(),
                            isAttorney,
                            evidence: evidenceMode,
                        })
                    ).json();
                    if (res?.data) {
                        if (res?.pages && res.pages > currentPages) setPages(Math.ceil(res.pages));
                        setResults(res.data);
                    } else throw res;
                    setLoading(false);
                } catch (err) {
                    console.log(err);
                    setErr(true);
                    setResults(Array(getPerPage()).fill({
                        ID: 1,
                        title: 'Fleeing and Evading - Mack Morgan | 05/13/2023',
                        suspects: [],
                        primaries: [],
                    }));
                    setLoading(false);
                }
            }, 1500),
        [],
    );

    const onSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setPages(1);
        fetch(searchTerm, reportType, 1, pages, toggleEvidenceMode);
    };

    const onSearchChange = (e) => {
        dispatch({ type: 'UPDATE_SEARCH_TERM', payload: { type, term: e.target.value } });
    };

    const onClear = () => {
        let s = qs.parse(location.search.slice(1));
        delete s.search;
        delete s.page;
        history({ path: location.pathname, search: qs.stringify(s) });
        dispatch({ type: 'CLEAR_SEARCH', payload: { type } });
        setPage(1);
        setResults(Array());
    };

    const onPagi = (e, p) => {
        setPage(p);
        fetch(searchTerm, reportType, p, pages, toggleEvidenceMode);
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.searchBar}>
                <form onSubmitCapture={onSearch}>
                    <div className={classes.searchRow}>
                        <div
                            className={`${classes.evidenceToggle}${toggleEvidenceMode ? ' active' : ''}`}
                            onClick={() => setToggleEvidenceMode(!toggleEvidenceMode)}
                            title="Toggle Evidence Search"
                        >
                            <FontAwesomeIcon icon={['fas', 'dna']} />
                        </div>
                        <TextField
                            select
                            size="small"
                            variant="outlined"
                            label="Type"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            sx={{ minWidth: 110 }}
                        >
                            {ReportTypes.filter(
                                (r) => hasPermission(r.requiredViewPermission) || (r.allowAttorney && isAttorney),
                            ).map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            name="search"
                            value={searchTerm}
                            onChange={onSearchChange}
                            error={err}
                            placeholder={toggleEvidenceMode ? 'Search by Evidence ID...' : 'Search reports...'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {searchTerm !== '' && (
                                            <IconButton size="small" type="button" onClick={onClear}>
                                                <FontAwesomeIcon icon={['fas', 'xmark']} />
                                            </IconButton>
                                        )}
                                        <IconButton size="small" type="submit" disabled={loading}>
                                            <FontAwesomeIcon icon={['fas', 'magnifying-glass']} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {myJob && (
                            <div className={classes.createBtn} onClick={createReport}>
                                <FontAwesomeIcon icon={['fas', 'plus']} />
                                New
                            </div>
                        )}
                    </div>
                </form>
            </div>

            <div className={classes.results}>
                {loading ? (
                    <Loader text="Loading" />
                ) : results?.length > 0 ? (
                    results.map((result) => <Item key={result._id} report={result} />)
                ) : (
                    <div className={classes.noResults}>No results found</div>
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
                        onChange={onPagi}
                    />
                </div>
            )}
        </div>
    );
};
