import React from 'react';
import {
    Grid,
    Button,
    Paper,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme) => ({
    transition: {
        transition: theme.transitions.create("all", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
        })
    },
    expansionButton: {
        height: '100%',
        width: '100%',
        minWidth: 0,
        padding: 0,
        borderRadius: 0,
        background: 'rgba(255,92,58,0.06)',
        border: 'none',
        borderLeft: '2px solid rgba(255,92,58,0.3)',
        color: 'rgba(255,92,58,0.6)',
        fontSize: '0.65rem',
        transition: 'all 0.15s ease',
        '&:hover': {
            background: 'rgba(255,92,58,0.14)',
            borderLeftColor: '#FF5C3A',
            color: '#FF5C3A',
        },
    },
    fullHeight: {
        height: '100%',
    },
    paper: {
        height: '100%',
        maxHeight: '100%',
    }
}));

export default ({ children, expanded, setExpanded, hideButton = false }) => {
    const classes = useStyles();

    const onExpansionButtonClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Grid container columns={48} spacing={1} className={classes.fullHeight}>
            {(!hideButton || expanded) && <Grid item xs={expanded ? 16 : 1} className={`${classes.transition} ${classes.fullHeight}`}>
                <Paper elevation={3} className={classes.paper}>
                    <Grid container columns={24} className={classes.fullHeight}>
                        {!hideButton ? (
                            <Grid item xs={!hideButton ? 23 : 24} sx={{ display: !expanded ? 'none' : null }}>
                                {children[0]}
                            </Grid>
                        ) : children[0]}
                        {!hideButton && <Grid Grid item xs={expanded ? 1 : 24}>
                            <Button className={classes.expansionButton} onClick={onExpansionButtonClick}>
                                {expanded ? (
                                    <FontAwesomeIcon icon={['fas', 'chevron-left']} />
                                ) : (
                                    <FontAwesomeIcon icon={['fas', 'chevron-right']} />
                                )}
                            </Button>
                        </Grid>}
                    </Grid>
                </Paper>
            </Grid>}
            <Grid item xs={expanded ? 32 : (hideButton ? 48 : 47)} className={`${classes.transition} ${classes.fullHeight}`}>
                <Paper elevation={3} className={classes.paper}>
                    {children[1]}
                </Paper>
            </Grid>
        </Grid >
    )
}