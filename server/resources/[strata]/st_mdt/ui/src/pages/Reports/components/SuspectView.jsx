import React, { useState, useEffect } from 'react';
import {
    Chip,
    Grid,
    IconButton,
    Tooltip,
    TextField,
    FormControlLabel,
    Switch,
    FormGroup,
    MenuItem,
    Skeleton,
    Alert,
    Button,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import Truncate from '@nosferatu500/react-truncate';

import Nui from '../../../util/Nui';
import { CurrencyFormat } from '../../../util/Parser';
import { Modal } from '../../../components';
import { PleaTypes } from './SuspectForm';
import { usePermissions } from '../../../hooks';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
        marginTop: 10,
        width: '100%',
        display: 'inline-flex',
        flexDirection: 'column',
        '&.overturned': {
            borderColor: theme.palette.error.light,
            filter: 'brightness(60%)',
        },
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        gap: 8,
    },
    accent: {
        width: 2,
        height: 14,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #FF5C3A 0%, #FF8C42 100%)',
        flexShrink: 0,
    },
    titleName: {
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.84rem',
        color: 'rgba(255,255,255,0.82)',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    titlePlea: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        color: theme.palette.primary.main,
        marginLeft: 2,
    },
    titleActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    body: {
        padding: '8px 12px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
    },
    statsRow: {
        padding: '8px 12px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
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
    charge: {
        fontSize: '0.72rem',
        maxWidth: 150,
        '&.type-1': { backgroundColor: theme.palette.info.main },
        '&.type-2': { backgroundColor: theme.palette.warning.main },
        '&.type-3': { backgroundColor: theme.palette.error.main },
    },
    points: {
        position: 'relative',
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
    sentenceFlag: {
        margin: '2px 4px',
    },
    sentenced: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
    },
    overturned: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: theme.palette.error.light,
    },
    editorField: {
        marginBottom: 10,
    },
    link: {
        color: 'rgba(255,255,255,0.82)',
        transition: 'color ease-in 0.15s',
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.primary.main,
            cursor: 'pointer',
        },
    },
    reduction: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.60rem',
        color: 'rgba(255,255,255,0.35)',
        marginLeft: 4,
    },
    popup: {
        maxHeight: `750px !important`,
    },
}));

export const ReductionTypes = [
    {
        label: 'Jail Time',
        value: 'months',
    },
    {
        label: 'Fine',
        value: 'fine',
    },
];

export const ParoleMultiplier = 1.5;

export default ({ data, report, refresh, paroleData, overturned }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const hasPerm = usePermissions();
    const breakpoints = useSelector((state) => state.app.pointBreakpoints);
    const charges = useSelector((state) => state.data.data.charges);

    const [susCharges, setSusCharges] = useState(Array());

    useEffect(() => {
        if (data?.charges) {
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

    const months = susCharges
        .filter((c) => c.jail)
        .reduce((a, b) => +a + +b.jail, 0);
    //.reduce((a, b) => +a + +b.jail * b.count, 0);
    const fine = susCharges
        .filter((c) => c.fine)
        .reduce((a, b) => +a + +b.fine * b.count, 0);
    const points = susCharges
        .filter((c) => c.points)
        .reduce((a, b) => +a + +b.points * b.count, 0);
    const isFelony = susCharges.filter((c) => c.type > 2).length > 0;
    const isInfraction = susCharges.filter((c) => c.type > 1).length <= 0;

    const [warrant, setWarrant] = useState(false);
    const [open, setOpen] = useState(false);
    const [sentence, setSentence] = useState({
        type: false,
        value: 0,
        revoke: {
            weapons: false,
            hunting: false,
            fishing: false,
            drivers:
                data.Licenses?.Drivers?.Points + points >= breakpoints?.license &&
                data.Licenses?.Drivers?.Active,
        },
        doc: false,
        parole: false,
    });

    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        let i = setInterval(() => {
            setTime(Date.now());
        }, 30000);
        return () => {
            clearInterval(i);
        };
    }, []);

    const [parole, setParole] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!data.sentenced) {
            if (paroleData && paroleData.end > Date.now()) {
                setParole({
                    ...paroleData,
                    remaining: Math.ceil(moment.duration(paroleData.end - Date.now(), 'ms').asMinutes()),
                });
            } else {
                setParole(false);
            }
        }
    }, [paroleData]);

    const onChange = (e) => {
        setSentence({
            ...sentence,
            [e.target.name]: e.target.value,
        });
    };

    const onChangeCheck = (e) => {
        setSentence({
            ...sentence,
            [e.target.name]: e.target.checked,
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (Boolean(data.sentenced)) return;
        setLoading(true);
        setOpen(false);

        const jailTime = calculate('jail');
        const fine = calculate('fine');
        const totalParole = calculate('parole');
        const points = calculate('points');

        try {
            let res = await (
                await Nui.send('SentencePlayer', {
                    report: report.id,
                    data,
                    sentence,
                    jail: jailTime,
                    fine: fine,
                    points: points,
                    parole: !isInfraction
                        ? {
                            end: moment(Date.now()).add(totalParole, 'minutes').unix(),
                            total: totalParole,
                            parole: Math.ceil(jailTime * (ParoleMultiplier - 1)),
                            sentence: jailTime,
                            fine: fine,
                        }
                        : null,
                })
            ).json();
            if (res) {
                refresh();
                toast.success('Sentenced Successfully');
                //setLoading(false);
            } else toast.error('Unable to Sentence');
        } catch (err) {
            console.log(err);
            toast.error('Unable to Sentence');
        }

        setLoading(false);
    };

    const calculate = (key) => {
        switch (key) {
            case 'jail':
                return sentence.type == 'months'
                    ? Math.ceil((Boolean(parole) ? parole.parole : 0) + months * (1 - sentence.value / 100))
                    : Math.ceil((Boolean(parole) ? parole.parole : 0) + months);
            case 'fine':
                return sentence.type == 'fine' ? Math.ceil(fine * (1 - sentence.value / 100)) : Math.ceil(fine);
            case 'parole':
                return Math.ceil(calculate('jail') * ParoleMultiplier);
            case 'points':
                return points;
        }
    };

    const onSubmitWarrant = async (e) => {
        e.preventDefault();

        try {
            let res = await (
                await Nui.send('IssueWarrant', {
                    suspect: data,
                    report: report.id,
                    notes: e.target.notes.value,
                })
            ).json();

            if (res) {
                setWarrant(false);
                refresh();
                toast.success('Warrant Created');
            } else toast.error('Unable to Create Warrant');
        } catch (err) {
            console.log(err);
            toast.error('Unable to Create Warrant');
        }
    };

    const [overturn, setOverturn] = useState(false);

    const onOverturn = async (e) => {
        e.preventDefault();

        setOverturn(false);

        try {
            let res = await (
                await Nui.send('OverturnSentence', {
                    SID: data.SID,
                    report: report.id,
                })
            ).json();

            if (res) {
                refresh();
                toast.success('Suspect Charges Overturned');
            } else toast.error('Unable to Overturn');
        } catch (err) {
            console.log(err);
            toast.error('Unable to Overturn');
        }
    }

    if (loading) {
        return <Skeleton animation="wave" height={300} width="100%" />;
    } else {
        return (
            <div className={`${classes.wrapper} ${overturned ? "overturned" : ""}`}>
                {/* Header row */}
                <div className={classes.title}>
                    <div className={classes.accent} />
                    <span className={classes.titleName} style={{ textDecoration: overturned ? 'line-through' : null }}>
                        <Link className={classes.link} to={`/search/people/${data.SID}`}>
                            {data.First} {data.Last}
                        </Link>
                        <span className={classes.titlePlea}> — {PleaTypes.find((p) => p.value == data.plea)?.label}</span>
                    </span>
                    <div className={classes.titleActions}>
                        {!Boolean(data.sentenced) ? (
                            <>
                                {Boolean(data.warrant) ? (
                                    <Tooltip title="View Warrant">
                                        <IconButton size="small" component={Link} to={`/warrants?warrant=${data.warrant}`}>
                                            <FontAwesomeIcon icon={['fas', 'eye']} />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Issue Warrant">
                                        <IconButton size="small" disabled={isInfraction} onClick={() => setWarrant(true)}>
                                            <FontAwesomeIcon icon={['fas', 'file-invoice']} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title={`Charge ${data.First} ${data.Last}`}>
                                    <IconButton size="small" onClick={() => setOpen(true)}>
                                        <FontAwesomeIcon icon={['fas', 'triangle-exclamation']} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                {!overturned && <span className={classes.sentenced}>Sentenced</span>}
                                {overturned && <span className={classes.overturned}>Overturned</span>}
                                {hasPerm("DOJ_OVERTURN_CHARGES") && !overturned && (
                                    <Tooltip title="Overturn Charges">
                                        <IconButton size="small" onClick={() => setOverturn(true)}>
                                            <FontAwesomeIcon icon={['fas', 'broom-wide']} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Charges */}
                <div className={classes.body}>
                    {susCharges
                        .sort((a, b) => b.jail + b.fine - (a.jail - a.fine))
                        .map((c, k) => (
                            <Tooltip key={`charge-${k}`} title={`${c.title} x${c.count}`}>
                                <Chip
                                    size="small"
                                    className={`${classes.charge} type-${c.type}`}
                                    label={<Truncate lines={1}>{`${c.title} x${c.count}`}</Truncate>}
                                />
                            </Tooltip>
                        ))}
                </div>

                {/* Sentence flags */}
                {Boolean(data.sentenced) && (
                    <div className={classes.body}>
                        {data?.doc && (
                            <Tooltip title="Requested DOC Transport">
                                <Chip size="small" color="primary" className={classes.sentenceFlag}
                                    icon={<FontAwesomeIcon icon={['fas', 'bus']} />} label="DOC Transport" />
                            </Tooltip>
                        )}
                        {data?.revoked?.weapons && (
                            <Tooltip title="Weapons Permit Revoked">
                                <Chip size="small" color="primary" className={classes.sentenceFlag}
                                    icon={<FontAwesomeIcon icon={['fas', 'gun']} />} label="Permit Revoked" />
                            </Tooltip>
                        )}
                        {data?.revoked?.drivers && (
                            <Tooltip title="Drivers License Revoked">
                                <Chip size="small" color="primary" className={classes.sentenceFlag}
                                    icon={<FontAwesomeIcon icon={['fas', 'id-card']} />} label="License Revoked" />
                            </Tooltip>
                        )}
                        {Boolean(data?.reduction?.type) && (
                            <Tooltip title={`${data.reduction.value}% Reduction For: ${ReductionTypes.find((r) => r.value == data.reduction.type)?.label}`}>
                                <Chip size="small" color="primary" className={classes.sentenceFlag}
                                    icon={<FontAwesomeIcon icon={['fas', 'percent']} />}
                                    label={`Reduction of ${data.reduction.value}%`} />
                            </Tooltip>
                        )}
                    </div>
                )}

                {/* Stats row */}
                <div className={classes.statsRow}>
                    {Boolean(data.sentenced) ? (
                        <>
                            <span className={classes.stat}>Months<span>
                                {data.jail}
                                {Boolean(data.reduction?.type) && data.reduction.type === 'months' && (
                                    <span className={classes.reduction}>-{data.reduction.value}%</span>
                                )}
                            </span></span>
                            <span className={classes.stat}>Fine<span>
                                {CurrencyFormat.format(data.fine)}
                                {Boolean(data.reduction?.type) && data.reduction.type === 'fine' && (
                                    <span className={classes.reduction}>-{data.reduction.value}%</span>
                                )}
                            </span></span>
                            <span className={classes.stat}>Points<span>{data.points}</span></span>
                        </>
                    ) : (
                        <>
                            <span className={classes.stat}>Months<span>{months}</span></span>
                            <span className={classes.stat}>Fine<span>{CurrencyFormat.format(fine)}</span></span>
                            <span className={classes.stat}>Points<span>{points}</span></span>
                            <div className={classes.flags}>
                                {isFelony && data.Licenses?.Weapons?.Active && (
                                    <Tooltip title="This will result in this person's weapons permit being revoked">
                                        <IconButton size="small" className={classes.flag}>
                                            <FontAwesomeIcon icon={['fas', 'dagger']} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {data.Licenses?.Drivers?.Points + points >= breakpoints?.license && (
                                    <Tooltip title="This will result in this person's drivers license being revoked">
                                        <IconButton size="small" className={classes.flag}>
                                            <FontAwesomeIcon icon={['fas', 'id-badge']} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <Modal
                    open={open}
                    title={`Sentence ${data.First} ${data.Last}`}
                    submitLang="Sentence"
                    onSubmit={onSubmit}
                    onClose={() => setOpen(false)}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {!isInfraction ? (
                                <Grid container style={{ textAlign: 'center' }}>
                                    <Grid item xs={3}>
                                        Months: <small>{calculate('jail')}</small>
                                    </Grid>
                                    <Grid item xs={3}>
                                        Parole: <small>{calculate('parole')}</small>
                                    </Grid>
                                    <Grid item xs={3}>
                                        Fine: <small>{CurrencyFormat.format(calculate('fine'))}</small>
                                    </Grid>
                                    <Grid item xs={3} className={classes.points}>
                                        <div>
                                            Points: <small>{calculate('points')}</small>
                                        </div>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container style={{ textAlign: 'center' }}>
                                    <Grid item xs={6}>
                                        Fine: <small>{CurrencyFormat.format(calculate('fine'))}</small>
                                    </Grid>
                                    <Grid item xs={6} className={classes.points}>
                                        <div>
                                            Points: <small>{calculate('points')}</small>
                                        </div>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                        {!isInfraction && Boolean(parole) && (
                            <Grid item xs={12}>
                                <Alert variant="filled" severity="info">
                                    {data.First} {data.Last} currently has {parole.remaining} months of
                                    parole remaining, {parole.parole} months has been added to their jail time
                                </Alert>
                            </Grid>
                        )}
                        {!isInfraction && (
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    fullWidth
                                    variant="standard"
                                    label="Reduction Type"
                                    name="type"
                                    className={classes.editorField}
                                    value={sentence.type}
                                    onChange={onChange}
                                >
                                    <MenuItem key={'none'} value={false}>
                                        No Reduction
                                    </MenuItem>
                                    {ReductionTypes.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    label="Reduction Percent"
                                    name="value"
                                    helperText={`Max: ${breakpoints?.reduction}%`}
                                    type="number"
                                    disabled={sentence.type == ''}
                                    className={classes.editorField}
                                    value={sentence.value}
                                    onChange={(e) => {
                                        if (e.target.value > breakpoints?.reduction)
                                            e.target.value = breakpoints?.reduction;
                                        else if (e.target.value < 0) e.target.value = 0;
                                        onChange(e);
                                    }}
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: breakpoints?.reduction,
                                            pattern: '0-9',
                                        },
                                    }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={6}>
                            <FormGroup className={classes.editorField}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            value={sentence.revoke.drivers}
                                            onChange={(e) => {
                                                setSentence({
                                                    ...sentence,
                                                    revoke: {
                                                        ...sentence.revoke,
                                                        drivers: e.target.checked,
                                                    },
                                                });
                                            }}
                                            color="primary"
                                            name="drivers"
                                            disabled={
                                                data.Licenses?.Drivers?.Points + points <
                                                breakpoints?.license || !data.Licenses?.Drivers?.Active
                                            }
                                        />
                                    }
                                    label="Revoke Driver's License?"
                                />
                            </FormGroup>
                            {!isInfraction && (
                                <FormGroup className={classes.editorField}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                value={sentence.revoke.weapons}
                                                onChange={(e) => {
                                                    setSentence({
                                                        ...sentence,
                                                        revoke: {
                                                            ...sentence.revoke,
                                                            weapons: e.target.checked,
                                                        },
                                                    });
                                                }}
                                                color="primary"
                                                name="weapons"
                                                disabled={data.Licenses?.Weapons?.Suspended || !isFelony}
                                            //defaultChecked={isFelony && data.Licenses?.Weapons?.Active}
                                            />
                                        }
                                        label="Revoke Weapons Permit?"
                                    />
                                </FormGroup>
                            )}
                            <FormGroup className={classes.editorField}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            value={sentence.revoke.hunting}
                                            onChange={(e) => {
                                                setSentence({
                                                    ...sentence,
                                                    revoke: {
                                                        ...sentence.revoke,
                                                        hunting: e.target.checked,
                                                    },
                                                });
                                            }}
                                            color="primary"
                                            name="hunting"
                                            disabled={data.Licenses?.Hunting?.Suspended}
                                        />
                                    }
                                    label="Revoke Hunting License?"
                                />
                            </FormGroup>
                            <FormGroup className={classes.editorField}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            value={sentence.revoke.fishing}
                                            onChange={(e) => {
                                                setSentence({
                                                    ...sentence,
                                                    revoke: {
                                                        ...sentence.revoke,
                                                        fishing: e.target.checked,
                                                    },
                                                });
                                            }}
                                            color="primary"
                                            name="fishing"
                                            disabled={data.Licenses?.Fishing?.Suspended}
                                        />
                                    }
                                    label="Revoke Fishing License?"
                                />
                            </FormGroup>
                            {!isInfraction && (
                                <FormGroup className={classes.editorField}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                value={sentence.doc}
                                                onChange={onChangeCheck}
                                                color="primary"
                                                name="doc"
                                            />
                                        }
                                        label="Requested DOC Transport?"
                                    />
                                </FormGroup>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Alert variant="filled" severity="warning">
                                Once sentenced, the charges brought upon{' '}
                                <b>
                                    {data.First} {data.Last}
                                </b>{' '}
                                cannot be edited or removed.
                            </Alert>
                        </Grid>
                    </Grid>
                </Modal>
                <Modal
                    maxWidth="md"
                    open={warrant}
                    title={`Issue Arrest Warrant For ${data.First} ${data.Last}`}
                    submitLang="Create Warrant"
                    onSubmit={onSubmitWarrant}
                    onClose={() => setWarrant(false)}
                >
                    <TextField
                        fullWidth
                        variant="standard"
                        disabled
                        className={classes.editorField}
                        label="Suspect"
                        name="suspect"
                        value={`${data.First} ${data.Last} (${data.SID})`}
                    />
                    <TextField
                        fullWidth
                        variant="standard"
                        disabled
                        className={classes.editorField}
                        label="Expires"
                        name="expires"
                        value={moment(time).add(7, 'days').format('LLLL')}
                    />
                    <TextField
                        fullWidth
                        variant="standard"
                        disabled
                        className={classes.editorField}
                        label="Referenced Report"
                        name="report"
                        value={`${report.title} [Case #${report.id}]`}
                    />
                    <TextField
                        fullWidth
                        variant="standard"
                        multiline
                        minRows={6}
                        className={classes.editorField}
                        label="Warrant Notes"
                        name="notes"
                    />
                </Modal>
                <Modal
                    maxWidth="md"
                    open={overturn}
                    title={`Overturn Charges For ${data.First} ${data.Last}`}
                    submitLang="Overturn Charges"
                    onSubmit={onOverturn}
                    onClose={() => setOverturn(false)}
                >
                    <p>Are you sure you want to overturn these charges? This cannot be reversed.</p>
                </Modal>
            </div>
        );
    }
};