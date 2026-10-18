import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import qs from 'qs';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Lightbox from 'react-image-lightbox';

import Nui from '../../util/Nui';
import { Loader, OfficerSearch, PersonSearch, Editor2, Modal } from '../../components';
import { ReportTypes, GetOfficerNameFromReportType, GetOfficerJobFromReportType } from '../../data';
import { useGovJob, usePermissions, useQualifications } from '../../hooks';

import SuspectForm from './components/SuspectForm';
import Suspect from './components/Suspect';
import SuspectView from './components/SuspectView';
import EvidenceForm from './components/EvidenceForm';
import Evidence from './components/Evidence';

import { initialState as susState } from './components/SuspectForm';

const useStyles = makeStyles((theme) => ({
    nWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 14,
        padding: 24,
    },
    nCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '28px 36px',
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
    },
    wrapper: {
        padding: '10px 8px',
        height: '100%',
        overflow: 'hidden',
    },
    nWrapperIcon: {
        fontSize: 52,
        color: 'rgba(255,92,58,0.35)',
        marginBottom: 4,
    },
    nWrapperText: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.84rem',
        color: 'rgba(255,255,255,0.28)',
    },
    editorField: {
        marginBottom: 10,
    },
    // header bar
    headerBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
        marginBottom: 8,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: 12,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 0,
        flex: 1,
    },
    accent: {
        width: 2,
        height: 16,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #FF5C3A 0%, #FF8C42 100%)',
        flexShrink: 0,
    },
    title: {
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.88rem',
        color: 'rgba(255,255,255,0.75)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    titleId: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.72rem',
        color: '#FF5C3A',
        marginRight: 6,
    },
    headerBtns: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
    },
    // action buttons
    btnBase: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 6,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        border: '1px solid',
        whiteSpace: 'nowrap',
    },
    btnOrange: {
        borderColor: 'rgba(255,92,58,0.35)',
        background: 'rgba(255,92,58,0.08)',
        color: '#FF5C3A',
        '&:hover': { background: 'rgba(255,92,58,0.18)', borderColor: 'rgba(255,92,58,0.6)' },
        '&:disabled': { opacity: 0.35, cursor: 'default' },
    },
    btnGreen: {
        borderColor: 'rgba(82,152,74,0.4)',
        background: 'rgba(82,152,74,0.08)',
        color: '#52984a',
        '&:hover': { background: 'rgba(82,152,74,0.18)', borderColor: 'rgba(82,152,74,0.7)' },
    },
    btnBlue: {
        borderColor: 'rgba(74,158,255,0.35)',
        background: 'rgba(74,158,255,0.06)',
        color: '#4a9eff',
        '&:hover': { background: 'rgba(74,158,255,0.14)', borderColor: 'rgba(74,158,255,0.6)' },
    },
    btnWarning: {
        borderColor: 'rgba(255,140,66,0.35)',
        background: 'rgba(255,140,66,0.08)',
        color: '#FF8C42',
        '&:hover': { background: 'rgba(255,140,66,0.18)', borderColor: 'rgba(255,140,66,0.6)' },
    },
    btnRed: {
        borderColor: 'rgba(231, 76, 60, 0.45)',
        background: 'rgba(231, 76, 60, 0.10)',
        color: '#e74c3c',
        '&:hover': { background: 'rgba(231, 76, 60, 0.20)', borderColor: 'rgba(231, 76, 60, 0.65)' },
    },
    btnNeutral: {
        borderColor: 'rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.55)',
        '&:hover': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
        '&:disabled': { opacity: 0.35, cursor: 'default' },
    },
    // right column card
    fieldCard: {
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
    },
    fieldCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    fieldCardAccent: {
        width: 2,
        height: 12,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #FF5C3A 0%, #FF8C42 100%)',
        flexShrink: 0,
    },
    fieldCardTitle: {
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 700,
        fontSize: '0.60rem',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.38)',
    },
    fieldCardBody: {
        padding: '10px 12px',
    },
    suspectEmpty: {
        padding: '16px 12px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
    },
    col: {
        padding: 5,
    },
    // kept for compat
    option: {
        transition: 'background ease-in 0.15s',
        border: `1px solid ${theme.palette.border.divider}`,
        '&:hover': { background: theme.palette.secondary.main, cursor: 'pointer' },
        '&.selected': { color: theme.palette.primary.main },
    },
    calculator: { height: '100%' },
    popup: { maxHeight: '750px !important' },
    draftItem: { borderBottom: `1px solid ${theme.palette.border.divider}` },
    draftBtn: { '&:first-of-type': { marginRight: 10 } },
}));

// returns [added, removed]
const getPeopleChangesWow = (type, orig, newest) => {
    return [
        newest.filter(p => !orig.find(p2 => p2.SID === p.SID)).map(p => ({
            type,
            mode: "add",
            data: p,
        })),
        orig.filter(p => !newest.find(p2 => p2.SID === p.SID)).map(p => ({
            type,
            mode: "delete",
            data: p,
        })),
    ];
}

const ReportSaveButton = ({ type, onClick, canEdit, classes }) => {
    switch (type) {
        case 'view':
            return (
                <button className={`${classes.btnBase} ${classes.btnNeutral}`} onClick={onClick} disabled={!canEdit}>
                    <FontAwesomeIcon icon={['fas', 'pen-to-square']} /> Edit
                </button>
            );
        case 'edit':
            return (
                <button className={`${classes.btnBase} ${classes.btnWarning}`} onClick={onClick}>
                    <FontAwesomeIcon icon={['fas', 'floppy-disk']} /> Save
                </button>
            );
        case 'create':
            return (
                <button className={`${classes.btnBase} ${classes.btnGreen}`} onClick={onClick}>
                    <FontAwesomeIcon icon={['fas', 'floppy-disk']} /> Save Report
                </button>
            );
        default:
            return null;
    }
}

export default (props) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useNavigate();
    const hasJob = useGovJob();
    const hasPermission = usePermissions();
    const hasQualification = useQualifications();
    const myJob = useSelector((state) => state.app.govJob);

    const [editor, setEditor] = useState(null);
    const [initialEditorState, setInitialEditorState] = useState('');

    let qry = qs.parse(location.search.slice(1));
    const reportId = qry.report;
    const reportMode = qry.mode;
    const preSuspectQry = qry.addSuspect;

    const createReport = () => {
        let s = qs.parse(location.search.slice(1));
        delete s.report
        history({
            path: location.pathname,
            search: qs.stringify(s),
        });

        setTimeout(() => {
            s.mode = "create";

            history({
                path: location.pathname,
                search: qs.stringify(s),
            });
        }, 250);
    };

    const user = useSelector((state) => state.app.user);
    const me = {
        _id: user.ID,
        SID: user.SID,
        User: user.User,
        First: user.First,
        Last: user.Last,
        Gender: user.Gender,
        Origin: user.Origin,
        Job: user.Job,
        DOB: user.DOB,
        Callsign: user.Callsign,
        Phone: user.Phone,
        Licenses: user.Licenses,
    };


    const initialState = {
        type: ReportTypes.filter((r) => hasPermission(r.requiredCreatePermission, false))?.[0]?.value,
        title: '',
        notes: '',
        primariesInput: '',
        primaries: [me],
        suspects: Array(),
        suspectsOverturned: Array(),
        // suspects: [
        //     { sentenced: true, SID: 1, First: "Bob", Last: "Bobson", Licenses: { Drivers: { Points: 0 } }, charges: [], plea: "unknown" },
        // ],
        // suspectsOverturned: [
        //     { sentenced: true, SID: 1, First: "Bob", Last: "Bobson", Licenses: { Drivers: { Points: 0 } }, charges: [], plea: "unknown" },
        // ],
        peopleInput: '',
        people: Array(),
        evidence: Array(),
        evidenceCounter: 0,
        allowAttorney: false,
    };

    const [evidence, setEvidence] = useState(false);
    const [editEvidence, setEditEvidence] = useState(null);

    const [pOpen, setPOpen] = useState(false);
    const [pIndex, setPIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const [state, setState] = useState({ ...initialState });
    const [original, setOriginal] = useState(null);
    const [changes, setChanges] = useState(Array());
    const [form, setForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [officers, setOfficers] = useState(Array());
    const [people, setPeople] = useState(Array());

    const [preSuspect, setPreSuspect] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const addChange = (mode, type, data) => {
        setChanges([
            ...changes,
            {
                mode,
                type,
                data,
            }
        ]);
    }

    const fetch = async (id) => {
        setLoading(true);
        try {
            let res = await (
                await Nui.send('View', {
                    type: 'report',
                    id,
                })
            ).json();
            if (res) {
                setState(res);
                setInitialEditorState(res.notes);
                setOriginal(res);
                setChanges(Array());
            }
        } catch (err) {
            console.log(err);
            toast.error('Unable to Load Report');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (reportId && reportMode !== "create") {
            fetch(reportId);
        } else {
            setState({
                type: ReportTypes.filter((r) => hasPermission(r.requiredCreatePermission, false))?.[0]?.value,
                title: '',
                notes: '',
                primariesInput: '',
                primaries: [me],
                suspects: Array(),
                peopleInput: '',
                people: Array(),
                evidence: Array(),
                evidenceCounter: 0,
                allowAttorney: false,
            });
            setInitialEditorState('');
        };
    }, [reportId]);

    useEffect(() => {
        if (reportMode == "create" && preSuspectQry) {
            let s = qs.parse(location.search.slice(1));
            setPreSuspect(s.addSuspect);
            setForm(true);
            delete s.addSuspect

            history({
                path: location.pathname,
                search: qs.stringify(s),
            });
        }
    }, [preSuspectQry]);

    const onSuspectCancel = () => {
        setForm(false);
        setEditing(null);
        setPreSuspect(null);
    };

    const onSuspectEdit = (suspect) => {
        setEditing(suspect);
    };

    const onSuspectDelete = (suspect) => {
        setState({
            ...state,
            suspects: state.suspects.filter((s) => s.SID != suspect.SID),
        });
        addChange("delete", "suspect", suspect);
    };

    const onEditSuspect = (sState) => {
        setState({
            ...state,
            suspects: state.suspects.map((s) => {
                if (s.SID == sState.SID) return sState;
                else return s;
            }),
        });
        onSuspectCancel();
        addChange("update", "suspect", sState);
    };

    const onAddSuspect = (sState) => {
        let exists = state.suspects.filter((s) => s.SID == sState.SID).length > 0;

        if (!exists) {
            setState({
                ...state,
                suspects: [...state.suspects, sState],
            });
            addChange("add", "suspect", sState);
        } else {
            toast.error('Suspect Already Added To Report');
        }
        onSuspectCancel();
    };

    const onAddEvidence = (evidence) => {
        setState({
            ...state,
            evidence: [
                ...state.evidence,
                {
                    ...evidence,
                    id: `local-${Date.now()}`,
                },
            ],
        });
        setEvidence(false);
        addChange("add", "evidence", evidence);
    };

    const onRemoveEvidence = (evidence) => {
        setState({
            ...state,
            evidence: state.evidence.filter((e) => e.id != evidence.id),
        });

        addChange("delete", "evidence", evidence);
    };

    const onEvidenceOpen = (index) => {
        setPIndex(index);
        setPOpen(true);
    };

    const onEvidenceLocker = async () => {
        if (reportMode == "view") {
            try {
                let res = await (await Nui.send('EvidenceLocker', state?.id)).json();
                if (res) Nui.send('Close');
                else toast.error('Unable to Open Evidence Locker');
            } catch (err) {
                console.log(err);
                toast.error('Unable to Open Evidence Locker');
            }
        }
    };

    const onDeleteReport = async () => {
        if (!state?.id) return;

        setLoading(true);
        try {
            let res = await (
                await Nui.send('Delete', {
                    type: 'report',
                    id: state.id,
                })
            ).json();

            if (res) {
                toast.success('Report Deleted');

                let s = qs.parse(location.search.slice(1));
                delete s.report;
                delete s.mode;
                history({
                    path: location.pathname,
                    search: qs.stringify(s),
                });

                setDeleteOpen(false);
                setState({ ...initialState });
            } else {
                toast.error('Unable to Delete Report');
            }
        } catch (err) {
            console.log(err);
            toast.error('Unable to Delete Report');
        }

        setLoading(false);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!editor) return;

        const rawValue = editor.getData();
        const reg = /src=\"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/g
        const value = rawValue.replace(reg, "src=\"https://i.ibb.co/x1vt3YY/ph.webp\"");

        if (reportMode === "create" || reportMode === "edit") {
            if (state.type == 0 && state.suspects.length == 0) {
                toast.error('Must Select Suspect');
                return;
            } else if (state.title == '') {
                toast.error('Must Add Report Title');
                return;
            } else if (value == '') {
                toast.error('Must Add Report Notes');
                return;
            }
        }

        if (reportMode === "create") { // Creating New Report
            try {
                let res = await (
                    await Nui.send('Create', {
                        type: 'report',
                        doc: {
                            type: state.type,
                            title: state.title,
                            notes: value,
                            time: Date.now(),
                            evidence: state.evidence,
                            suspects: state.suspects,
                            primaries: state.primaries,
                            people: state.people,
                            allowAttorney: state.allowAttorney,
                        },
                    })
                ).json();

                if (res) {
                    let s = qs.parse(location.search.slice(1));
                    s.report = res;
                    s.mode = "view"
                    history({
                        path: location.pathname,
                        search: qs.stringify(s),
                    });

                    toast.success('Report Created');
                } else toast.error('Unable to Create Report');
            } catch (e) {
                toast.error('Unable to Create Report');
            }
        } else if (reportMode === "view") { // Begin Editing a Report
            // TODO: Check Permissions 1st
            let s = qs.parse(location.search.slice(1));
            s.mode = "edit"
            history({
                path: location.pathname,
                search: qs.stringify(s),
            });
        } else if (reportMode === "edit") {
            try {
                const [addedPeople, removedPeople] = getPeopleChangesWow("person", original.people, state.people);
                const [addedPrimary, removedPrimary] = getPeopleChangesWow("primary", original.primaries, state.primaries);

                const c = [
                    ...changes,
                    ...addedPeople,
                    ...removedPeople,
                    ...addedPrimary,
                    ...removedPrimary,
                ];

                let res = await (
                    await Nui.send('Update', {
                        type: 'report',
                        id: state.id,
                        report: {
                            type: state.type,
                            title: state.title,
                            notes: value,
                            time: state.time,
                            allowAttorney: state.allowAttorney,
                            changes: c,
                        },
                    })
                ).json();

                if (res) {
                    let s = qs.parse(location.search.slice(1));
                    s.mode = "view"
                    history({
                        path: location.pathname,
                        search: qs.stringify(s),
                    });

                    toast.success('Report Edited');
                    setChanges(Array());
                    fetch(state.id);
                } else toast.error('Unable to Edit Report');
            } catch (e) {
                toast.error('Unable to Edit Report');
            }
        };
    };

    const reportOfficerName = GetOfficerNameFromReportType(state.type);
    const reportOfficerType = GetOfficerJobFromReportType(state.type);

    const reportTypeData = ReportTypes.find(r => r.value === state.type);
    const canEdit = hasPermission(reportTypeData?.requiredCreatePermission);
    const canDeleteReport = hasPermission('MDT_REPORT_DELETE');

    if ((!reportId && reportMode !== "create") || loading) {
        return (
            <div className={classes.nWrapper}>
                {loading ? (
                    <Loader text="Loading" />
                ) : (
                    <div className={classes.nCard}>
                        <FontAwesomeIcon className={classes.nWrapperIcon} icon={['fas', 'file-lines']} />
                        <div className={classes.nWrapperText}>Select a report to view it,<br />or create a new one</div>
                        {myJob && (
                            <button
                                className={`${classes.btnBase} ${classes.btnOrange}`}
                                onClick={createReport}
                                style={{ marginTop: 4 }}
                            >
                                <FontAwesomeIcon icon={['fas', 'plus']} /> Create New Report
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const getReportTypeHasEvidence = (reportType) => {
        return ReportTypes.find((r) => r.value == reportType)?.hasEvidence;
    };

    return (
        <div className={classes.wrapper}>
            <Grid container style={{ height: '100%', paddingBottom: 10 }} spacing={2} justifyContent="center" alignContent="flex-start">

                {/* ── Header bar ── */}
                <Grid item xs={12}>
                    <div className={classes.headerBar}>
                        <div className={classes.headerLeft}>
                            <div className={classes.accent} />
                            <span className={classes.title}>
                                {reportMode !== "create" && (
                                    <span className={classes.titleId}>#{state?.id ?? 1}</span>
                                )}
                                {state.title || (reportMode === "create" ? "New Report" : "Untitled")}
                            </span>
                        </div>
                        <div className={classes.headerBtns}>
                            {reportMode === "view" && myJob?.Id === "police" && getReportTypeHasEvidence(state?.type) && (
                                <button className={`${classes.btnBase} ${classes.btnBlue}`} onClick={onEvidenceLocker}>
                                    <FontAwesomeIcon icon={['fas', 'box-archive']} /> Evidence Locker
                                </button>
                            )}
                            {reportMode !== "view" && (
                                <button className={`${classes.btnBase} ${classes.btnBlue}`} onClick={() => setEvidence(true)}>
                                    <FontAwesomeIcon icon={['fas', 'camera']} /> Add Evidence
                                </button>
                            )}
                            {state.type === 0 && reportMode !== "view" && (
                                <button className={`${classes.btnBase} ${classes.btnOrange}`} onClick={() => setForm(true)}>
                                    <FontAwesomeIcon icon={['fas', 'user-plus']} /> Add Suspect
                                </button>
                            )}
                            {reportMode === "view" && state?.id && canDeleteReport && (
                                <button className={`${classes.btnBase} ${classes.btnRed}`} onClick={() => setDeleteOpen(true)}>
                                    <FontAwesomeIcon icon={['fas', 'trash']} /> Delete Report
                                </button>
                            )}
                            <ReportSaveButton type={reportMode} onClick={onSubmit} canEdit={canEdit} classes={classes} />
                        </div>
                    </div>
                </Grid>

                {/* ── Left: editor ── */}
                <Grid item xs={6} className={classes.col} sx={{ minHeight: '100%' }}>
                    <div style={{ display: 'flex', height: '95%' }}>
                        <Editor2
                            allowMedia
                            name="notes"
                            title="Report Notes"
                            placeholder="Enter Report Notes"
                            disabled={reportMode === "view"}
                            editor={editor}
                            setEditor={setEditor}
                            initialEditorState={initialEditorState}
                        />
                    </div>
                </Grid>

                {/* ── Right: fields ── */}
                <Grid item xs={6} className={classes.col} sx={{ maxHeight: '95%', overflowY: 'auto' }}>
                    <Evidence
                        evidence={state.evidence}
                        onClick={(index) => onEvidenceOpen(index)}
                        onDelete={reportMode !== "view" ? onRemoveEvidence : null}
                    />

                    {/* Report details card */}
                    <div className={classes.fieldCard}>
                        <div className={classes.fieldCardHeader}>
                            <div className={classes.fieldCardAccent} />
                            <span className={classes.fieldCardTitle}>Report Details</span>
                        </div>
                        <div className={classes.fieldCardBody}>
                            <TextField
                                select fullWidth variant="standard" label="Report Type"
                                disabled={reportMode !== "create"} name="type"
                                className={classes.editorField}
                                value={state.type}
                                onChange={(e) => setState({ ...state, type: e.target.value })}
                            >
                                {ReportTypes.filter((r) => hasPermission(r.requiredCreatePermission, false)).map((option) => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth variant="standard" label="Report Title"
                                disabled={reportMode === "view"} placeholder="Report Title"
                                className={classes.editorField}
                                value={state.title}
                                onChange={(e) => setState({ ...state, title: e.target.value })}
                            />
                            {reportTypeData.allowAttorney && (
                                <TextField
                                    select fullWidth variant="standard" label="Attorney Access"
                                    disabled={reportMode === "view"} name="type"
                                    className={classes.editorField}
                                    value={state.allowAttorney}
                                    onChange={(e) => setState({ ...state, allowAttorney: e.target.value })}
                                >
                                    <MenuItem key="do-not-allow" value={false}>Don't Allow Attorney Viewing</MenuItem>
                                    <MenuItem key="allow" value={true}>Allow Attorney Viewing</MenuItem>
                                </TextField>
                            )}
                        </div>
                    </div>

                    {/* Officers / people card */}
                    <div className={classes.fieldCard}>
                        <div className={classes.fieldCardHeader}>
                            <div className={classes.fieldCardAccent} />
                            <span className={classes.fieldCardTitle}>Personnel</span>
                        </div>
                        <div className={classes.fieldCardBody}>
                            <OfficerSearch
                                disableSelf
                                job={reportOfficerType}
                                label={`${reportOfficerName} Involved`}
                                disabled={reportMode === "view"}
                                value={state.primaries}
                                inputValue={state.primariesInput}
                                options={officers}
                                setOptions={setOfficers}
                                onChange={(e, nv) => {
                                    setState({
                                        ...state,
                                        primaries: nv.length === 0 ? [user] : nv,
                                        primariesInput: '',
                                    });
                                }}
                                onInputChange={(e, nv) => setState({ ...state, primariesInput: nv })}
                            />
                            {state.type !== 0 && (
                                <PersonSearch
                                    label="People Involved"
                                    placeholder="John Doe, Jane Doe etc..."
                                    value={state.people}
                                    inputValue={state.peopleInput}
                                    options={people}
                                    disabled={reportMode === "view"}
                                    setOptions={setPeople}
                                    onChange={(e, nv) => {
                                        setState({
                                            ...state,
                                            people: nv.length === 0 ? [] : nv,
                                            peopleInput: '',
                                        });
                                    }}
                                    onInputChange={(e, nv) => setState({ ...state, peopleInput: nv })}
                                />
                            )}
                        </div>
                    </div>

                    {/* Suspects */}
                    {state.suspects.length > 0
                        ? state.suspects.map((suspect, k) =>
                            reportMode === "view" ? (
                                <SuspectView
                                    key={`suspect-${k}`}
                                    data={suspect}
                                    report={state}
                                    paroleData={state?.paroleData?.find(p => p.SID == suspect.SID)}
                                    refresh={() => fetch(state.id)}
                                />
                            ) : (
                                <Suspect
                                    key={`suspect-${k}`}
                                    data={suspect}
                                    onEdit={() => onSuspectEdit(suspect)}
                                    onDelete={() => onSuspectDelete(suspect)}
                                />
                            )
                        )
                        : state.type === 0 && (
                            <div className={classes.fieldCard}>
                                <div className={classes.suspectEmpty}>
                                    No suspects added — use Add Suspect above
                                </div>
                            </div>
                        )}
                    {state.suspectsOverturned?.length > 0 &&
                        state.suspectsOverturned.map((suspect, k) => (
                            <SuspectView
                                key={`suspect-overturned-${k}`}
                                overturned
                                data={suspect}
                                report={state}
                            />
                        ))}
                </Grid>
            </Grid>
            <SuspectForm
                open={form || Boolean(editing)}
                suspect={editing}
                onSubmit={onAddSuspect}
                onCancel={onSuspectCancel}
                onEdit={onEditSuspect}
                preSuspect={preSuspect}
            />

            <EvidenceForm
                open={evidence}
                existing={editEvidence}
                onSubmit={onAddEvidence}
                onClose={() => setEvidence(false)}
            />
            <Modal
                open={deleteOpen}
                title="Delete Report"
                closeLang="Cancel"
                acceptLang="Delete"
                onClose={() => setDeleteOpen(false)}
                onAccept={onDeleteReport}
            >
                This will permanently delete the report and remove all report charges tied to this report from charged persons.
            </Modal>
            {
                state.evidence.length > 0 && pOpen && (
                    <Lightbox
                        mainSrc={state.evidence[pIndex].value}
                        nextSrc={state.evidence[(pIndex + 1) % state.evidence.length].value}
                        prevSrc={state.evidence[(pIndex + state.evidence.length - 1) % state.evidence.length].value}
                        onCloseRequest={() => setPOpen(false)}
                        onMovePrevRequest={() => setPIndex((pIndex + state.evidence.length - 1) % state.evidence.length)}
                        onMoveNextRequest={() => setPIndex((pIndex + 1) % state.evidence.length)}
                    />
                )
            }
        </div >
    );
};
