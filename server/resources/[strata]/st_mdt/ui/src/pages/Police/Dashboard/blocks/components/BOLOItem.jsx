import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { List, ListItem, ListItemText } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import Truncate from "@nosferatu500/react-truncate";

import { Modal } from "../../../../../components";
import { BOLOTypes } from "../../../Create/BOLO";
import { Sanitize } from "../../../../../util/Parser";
import Nui from "../../../../../util/Nui";
import { usePerson } from '../../../../../hooks';

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
    },
    icon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        background: 'rgba(255,140,66,0.08)',
        border: '1px solid rgba(255,140,66,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        color: '#FF8C42',
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
    officerLink: {
        color: 'rgba(255,255,255,0.45)',
        transition: 'color 0.15s ease',
        textDecoration: 'none',
        '&:hover': { color: '#FF5C3A' },
    },
}));

export default ({ bolo }) => {
    const classes      = useStyles();
    const dispatch     = useDispatch();
    const formatPerson = usePerson();
    const [open, setOpen] = useState(false);

    const onDismiss = async () => {
        try {
            let res = await (await Nui.send("Delete", { type: "BOLO", id: bolo._id })).json();
            if (res) {
                dispatch({ type: "REMOVE_DATA", payload: { type: "bolos", id: bolo._id } });
                toast.success("BOLO Dismissed");
            } else toast.error("Unable to Dismiss BOLO");
        } catch (err) {
            console.log(err);
            toast.error("Unable to Dismiss BOLO");
        }
        setOpen(false);
    };

    return (
        <>
            <div className={classes.row} onClick={() => setOpen(true)}>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={["fas", bolo.type]} />
                </div>
                <div className={classes.body}>
                    <div className={classes.label}>
                        <Truncate lines={1}>{bolo.title}</Truncate>
                    </div>
                    <div className={classes.sub}>
                        <Truncate lines={1}>{bolo.summary}</Truncate>
                    </div>
                </div>
                <Moment className={classes.time} date={bolo.time} fromNow />
            </div>
            <Modal
                open={open}
                title={bolo.title}
                deleteLang="Dismiss BOLO"
                onClose={() => setOpen(false)}
                onDelete={onDismiss}
            >
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Issuing Officer"
                            secondary={
                                <Link
                                    className={classes.officerLink}
                                    to={`/roster?id=${bolo.author.SID}`}
                                >
                                    {formatPerson(bolo.author.First, bolo.author.Last, bolo.author.Callsign, bolo.author.SID)}
                                </Link>
                            }
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Type"
                            secondary={BOLOTypes.filter((b) => b.value == bolo.type)[0]?.label}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Summary" secondary={bolo.summary} />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            style={{ whiteSpace: "pre-line" }}
                            primary="Description"
                            secondary={<span>{Sanitize(bolo.description)}</span>}
                        />
                    </ListItem>
                </List>
            </Modal>
        </>
    );
};
