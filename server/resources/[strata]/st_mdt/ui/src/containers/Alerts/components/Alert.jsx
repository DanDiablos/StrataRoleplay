import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slide, Chip, IconButton, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Moment from 'react-moment';
import Truncate from '@nosferatu500/react-truncate';

import { GetCloseColorName } from '../../../util/CloseColor';
import Nui from '../../../util/Nui';

import { Modal } from '../../../components';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		borderLeft: `6px solid ${theme.palette.primary.dark}`,
		borderRadius: 8,
		padding: '10px 12px',
		background: 'rgba(9, 13, 22, 0.92)',
		marginBottom: 10,
		border: `1px solid ${theme.palette.divider}`,
		overflow: 'hidden',
		backgroundClip: 'padding-box',
		boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
		fontFamily: 'Rajdhani, Orbitron, "Segoe UI", sans-serif',
		'&.type-1': {
			borderLeft: `6px solid ${theme.palette.info.dark}`,
			background: 'linear-gradient(100deg, rgba(46, 113, 163, 0.24) 0%, rgba(9, 13, 22, 0.92) 30%)',
			'&.panic': {
				'-webkit-animation': 'pd-panic 1s infinite, pd-panic-border 1s infinite',
			},
		},
		'&.type-2': {
			borderLeft: `6px solid #2b0215`,
			background: 'linear-gradient(100deg, rgba(174, 26, 92, 0.26) 0%, rgba(9, 13, 22, 0.92) 30%)',
			'&.panic': {
				'-webkit-animation': 'ems-panic 1s infinite',
			},
		},
		'&.type-3': {
			borderLeft: `6px solid #270d3d`,
			background: 'linear-gradient(100deg, rgba(104, 24, 173, 0.26) 0%, rgba(9, 13, 22, 0.92) 30%)',
			'&.panic': {
				'-webkit-animation': 'misc-panic 1s infinite, misc-panic-border 1s infinite',
			},
		},
	},
	chip: {
		margin: '0 6px',
		'&.id': {
			backgroundColor: theme.palette.text.main,
			color: theme.palette.secondary.dark,
		},
		'&.code': {
			backgroundColor: theme.palette.warning.main,
		},
	},
	icon: {
		marginRight: 5,
	},
	minor: {
		fontSize: 14,
		color: theme.palette.text.main,
		letterSpacing: 0.2,
	},
	minor2: {
		display: 'grid',
		gridTemplateColumns: '1fr auto',
		columnGap: 8,
		fontSize: 14,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontWeight: 700,
		fontSize: 15,
		letterSpacing: 0.4,
		textTransform: 'uppercase',
	},
	headerIcon: {
		width: 18,
		color: '#8fd3ff',
	},
	messageBox: {
		marginTop: 8,
		marginBottom: 8,
		padding: '8px 10px',
		borderRadius: 6,
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
	},
	messageLabel: {
		fontSize: 11,
		fontWeight: 700,
		letterSpacing: 0.8,
		opacity: 0.8,
		textTransform: 'uppercase',
	},
	messageText: {
		fontSize: 14,
		lineHeight: 1.3,
		fontWeight: 600,
	},
	actionIcon: {
		fontSize: 14,
		color: '#b9e4ff',
	},
	item: {
		marginRight: 5,
		border: `1px solid ${theme.palette.border.divider}`,
		fontWeight: 500,
		lineHeight: 0.9,
	},
	option: {
		padding: '0 15px',
	},
}));

const deptNames = {
	police: 'PD',
	prison: 'DOC',
	ems: 'EMS',
};

export default ({ alert }) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const showing = useSelector((state) => state.alerts.showing);
	const units = useSelector((state) => state.alerts.units);
	const myUnit = useSelector((state) => state.alerts.myUnit);
	const myUnitData = units?.[myUnit.job].find((u) => u.primary === myUnit.primary);

	const meAttached = alert.attached.includes(
		myUnitData?.operatingUnder !== null ? myUnitData?.operatingUnder : myUnitData?.primary,
	);

	const [onScreen, setOnScreen] = useState(alert.onScreen);

	const alertMessage = useMemo(() => {
		return (
			alert?.message ||
			alert?.description?.message ||
			alert?.description?.callerMessage ||
			alert?.description?.text ||
			alert?.details ||
			null
		);
	}, [alert]);

	const detailText = alert?.description?.details || null;
	const showDetailText = Boolean(detailText) && detailText !== alertMessage;

	useEffect(() => {
		let i = setInterval(() => {
			if (!alert.onScreen) clearInterval(i);
			if (alert.time + 1000 * 10 < Date.now() && onScreen) {
				setOnScreen(false);
			}
		}, 500);
		return () => {
			clearInterval(i);
		};
	}, []);

	const onAnimEnd = () => {
		dispatch({
			type: 'EXPIRE_ALERT',
			payload: alert.id,
		});
	};

	const onRoute = () => {
		Nui.send('RouteAlert', alert);
	};

	const onCamera = () => {
		Nui.send('ViewCamera', alert);
	};

	const getIcon = () => {
		switch (alert.style) {
			case 1:
				return <FontAwesomeIcon className={classes.headerIcon} icon={['fas', 'tower-broadcast']} />;
			case 2:
				return <FontAwesomeIcon className={classes.headerIcon} icon={['fas', 'kit-medical']} />;
			case 3:
				return <FontAwesomeIcon className={classes.headerIcon} icon={['fas', 'satellite-dish']} />;
			default:
				return <FontAwesomeIcon className={classes.headerIcon} icon={['fas', 'triangle-exclamation']} />;
		}
	};

	const [confirm, setConfirm] = useState(false);
	const onDelete = () => {
		setConfirm(false);
		dispatch({
			type: 'ALERTS_REMOVE_ALERT',
			payload: {
				id: alert.id,
			},
		});
	};

	const getInner = () => {
		return (
			<div className={`${classes.wrapper} type-${alert.style}${alert.panic ? ' panic' : ''}`}>
				<Grid container>
					<Grid
						item
						xs={Boolean(alert) || Boolean(alert.camera) ? 11 : 12}
						style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
					>
						<div className={classes.headerRow}>
							{meAttached && (
								<FontAwesomeIcon size="xs" icon={['fas', 'thumbtack']} style={{ marginRight: 10 }} />
							)}
							{getIcon()}
							<Chip className={`${classes.chip} code`} size="small" label={alert.code} />
							<Truncate lines={1}>{alert.title}</Truncate>
						</div>
						{Boolean(alertMessage) && (
							<div className={classes.messageBox}>
								<div className={classes.messageLabel}>Caller Message</div>
								<div className={classes.messageText}>{alertMessage}</div>
							</div>
						)}
						{Boolean(alert.description) && (
							<>
								{showDetailText && (
									<div className={classes.minor}>
										<FontAwesomeIcon
											className={classes.icon}
											icon={[
												'fas',
												Boolean(alert?.description?.icon) ? alert?.description?.icon : 'question',
											]}
										/>
										<b>{detailText}</b>
									</div>
								)}
								{Boolean(alert.description.vehicleColor) && (
									<div className={classes.minor}>
										<Grid container direction="row">
											<Grid item xs={5}>
												<FontAwesomeIcon
													className={classes.icon}
													style={{
														color: `rgb(${alert.description.vehicleColor.r}, ${alert.description.vehicleColor.g}, ${alert.description.vehicleColor.b})`,
													}}
													icon={['fas', 'palette']}
												/>
												<b>
													{GetCloseColorName(
														alert.description.vehicleColor.r,
														alert.description.vehicleColor.g,
														alert.description.vehicleColor.b,
													)}
												</b>
											</Grid>
											{Boolean(alert.description.vehiclePlate) && (
												<Grid item xs={4}>
													<FontAwesomeIcon
														className={classes.icon}
														icon={['fas', 'closed-captioning']}
													/>
													<b>{alert.description.vehiclePlate}</b>
												</Grid>
											)}
											{Boolean(alert.description.vehicleClass) && (
												<Grid item xs={3}>
													<FontAwesomeIcon
														className={classes.icon}
														icon={['fas', 'circle-info']}
													/>
													Class: <b>{alert.description.vehicleClass}</b>
												</Grid>
											)}
										</Grid>
									</div>
								)}
							</>
						)}
						{Boolean(alert.location) ? (
							<div className={classes.minor}>
								<FontAwesomeIcon className={classes.icon} icon={['fas', 'location']} />
								{alert.location.street1} {alert.location.street2 && `/ ${alert.location.street2} `}|{' '}
								{alert.location.area}
							</div>
						) : (
							<div className={classes.minor}>
								<FontAwesomeIcon className={classes.icon} icon={['fas', 'location']} />
								Unknown Location
							</div>
						)}
						<div className={classes.minor2}>
							<div>
								<FontAwesomeIcon className={classes.icon} icon={['fas', 'stopwatch']} />
								<Moment date={alert.time} fromNow />
							</div>
							<div>
								{Boolean(alert.location) && (
									<IconButton size="small" onClick={onRoute}>
										<FontAwesomeIcon className={classes.actionIcon} icon={['fas', 'location-crosshairs']} />
									</IconButton>
								)}
							</div>
						</div>
					</Grid>
					{Boolean(alert) && (
						<Grid
							item
							xs={1}
							style={{
								textAlign: 'right',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignContent: 'right',
							}}
						>
							{Boolean(alert) && (
								<IconButton onClick={() => setConfirm(true)} style={{ marginLeft: 'auto' }}>
									<FontAwesomeIcon size="2xs" icon={['fas', 'x']} />
								</IconButton>
							)}
							{Boolean(alert.camera) && (
								<IconButton onClick={onCamera} style={{ marginLeft: 'auto' }}>
									<FontAwesomeIcon size="2xs" icon={['fas', 'video']} />
								</IconButton>
							)}
						</Grid>
					)}
				</Grid>
				<Modal
					open={Boolean(confirm)}
					title={'Are you sure?'}
					acceptLang="Delete"
					onClose={() => setConfirm(false)}
					onAccept={onDelete}
					hideBackdrop
					maxWidth="sm"
				>
					{alert.attached?.length > 0 ? (
						<p>
							Are you sure you want to clear this call, there are {alert.attached.length} unit(s) still
							attached, it will be removed from the entire dispatch system.
						</p>
					) : (
						<p>
							Are you sure you want to clear this call, it will be removed from the entire dispatch
							system?
						</p>
					)}
				</Modal>
			</div>
		);
	};

	if (showing) {
		return <div>{getInner()}</div>;
	} else {
		return (
			<Slide in={onScreen} direction="left" onExited={onAnimEnd}>
				{getInner()}
			</Slide>
		);
	}
};
