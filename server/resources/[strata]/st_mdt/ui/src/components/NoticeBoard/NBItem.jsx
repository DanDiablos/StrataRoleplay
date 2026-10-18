import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import Moment from "react-moment";
import Truncate from "@nosferatu500/react-truncate";

import { Modal, UserContent, Loader } from "../";
import Nui from "../../util/Nui";
import { usePermissions } from '../../hooks';

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
        background: 'rgba(255,92,58,0.08)',
        border: '1px solid rgba(255,92,58,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
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
    },
    time: {
        fontFamily: "'Fira Mono', monospace",
        fontSize: '0.62rem',
        color: 'rgba(255,255,255,0.28)',
        flexShrink: 0,
    },
}));

export default ({ notice }) => {
    const classes    = useStyles();
    const hasPerms   = usePermissions();
    const user       = useSelector(state => state.app.user);
    const canDelete  = hasPerms(true) || notice.creator == user?.SID;
    const [open, setOpen]           = useState(false);
    const [loading, setLoading]     = useState(false);
    const [noticeData, setNoticeData] = useState(null);

    const onDismiss = async () => {
        if (!canDelete) return;
        try {
            let res = await (await Nui.send("Delete", { type: "notice", id: notice.id })).json();
            if (res) toast.success("Notice Dismissed");
            else toast.error("Unable to Dismiss Notice");
        } catch (err) {
            console.log(err);
            toast.error("Unable to Dismiss Notice");
        }
        setOpen(false);
    };

    const onOpen = async () => {
        setOpen(true);
        setLoading(true);
        try {
            let res = await (await Nui.send("View", { type: "notice", id: notice.id })).json();
            if (res) setNoticeData(res);
            else toast.error("Unable to View Notice");
        } catch (e) {
            setNoticeData({ description: 'test' });
            console.log(e);
        }
        setLoading(false);
    };

    const onClose = () => { if (!loading) setOpen(false); };

    const isLocked = notice.restricted !== "public" && notice.restricted !== "government";

    return (
        <>
            <div className={classes.row} onClick={onOpen}>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={["fas", isLocked ? 'lock' : 'circle-info']} />
                </div>
                <div className={classes.body}>
                    <div className={classes.label}>
                        <Truncate lines={1}>{notice.title}</Truncate>
                    </div>
                </div>
                <Moment className={classes.time} date={notice.created} fromNow />
            </div>
            <Modal
                open={open}
                title={notice.title}
                maxWidth="lg"
                deleteLang="Delete"
                onClose={onClose}
                onDelete={(canDelete && !loading) ? onDismiss : null}
            >
                {loading || !open ? (
                    <Loader />
                ) : (
                    <div>
                        <UserContent content={noticeData?.description} />
                    </div>
                )}
            </Modal>
        </>
    );
};
