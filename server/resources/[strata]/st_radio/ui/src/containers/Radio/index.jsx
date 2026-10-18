import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	Slide,
	Fade,
	Tooltip,
	TextField,
	InputAdornment,
	IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import Nui from '../../util/Nui';
import frame from '../../radio_frame.webp';
import wallpaper from '../../background.webp';

library.add(far, fas);

const DEPARTMENT_NAME_COLORS = {
	lspd: '#4b8dff',
	blsdpd: '#4b8dff',
	bcso: '#c9a66b',
	sheriff: '#c9a66b',
	sasp: '#9aa0a6',
	state: '#9aa0a6',
	fib: '#6ad8c6',
	fbi: '#6ad8c6',
	ems: '#ff7f7f',
	fd: '#ff9966',
	fire: '#ff9966',
	doc: '#9dcf80',
};

const getDepartmentNameColor = (department) => {
	if (!department) return null;

	const normalized = String(department).toLowerCase();

	if (normalized.includes('lspd') || normalized.includes('police')) {
		return DEPARTMENT_NAME_COLORS.lspd;
	}

	if (
		normalized.includes('bcso') ||
		normalized.includes('bsco') ||
		normalized.includes('sheriff')
	) {
		return DEPARTMENT_NAME_COLORS.bcso;
	}

	if (
		normalized.includes('sasp') ||
		normalized.includes('state police') ||
		normalized.includes('trooper')
	) {
		return DEPARTMENT_NAME_COLORS.sasp;
	}

	if (normalized.includes('fbi') || normalized.includes('fib')) {
		return DEPARTMENT_NAME_COLORS.fbi;
	}

	if (normalized.includes('ems')) {
		return DEPARTMENT_NAME_COLORS.ems;
	}

	if (normalized.includes('fire') || normalized.includes('fd')) {
		return DEPARTMENT_NAME_COLORS.fd;
	}

	if (normalized.includes('doc') || normalized.includes('corrections')) {
		return DEPARTMENT_NAME_COLORS.doc;
	}

	return null;
};

const getChannelListTitle = (frequency, channelName) => {
	if (channelName && channelName !== '') return channelName;
	if (Number(frequency) === 1) return 'EMS Radio';
	if (Number(frequency) === 2) return 'Prison Dipsatch Radio';
	if (Number(frequency) === 3) return 'Police Radio';
	return `Radio #${frequency}`;
};

const useStyles = makeStyles((theme) => ({
	wrapper: {
		height: 700,
		width: 360,
		position: 'absolute',
		bottom: '0%',
		right: '2%',
		overflow: 'hidden',
	},
	radioImg: {
		zIndex: 200,
		background: `transparent no-repeat center`,
		height: '100%',
		width: '100%',
		position: 'absolute',
		pointerEvents: 'none',
	},
	radio: {
		height: '100%',
		width: '100%',
		padding: '0 69px',
		overflow: 'hidden',
	},
	screen: {
		zIndex: 101,
		width: 204,
		height: 314,
		position: 'absolute',
		bottom: 85,
		left: 78,
		overflow: 'hidden',
		border: '4px solid #000',
		background: '#000',
		backgroundImage: (props) =>
			Boolean(props.power) ? `url(${wallpaper})` : null,
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
	},
	volumeUp: {
		zIndex: 101,
		position: 'absolute',
		top: 150,
		left: 180,
		height: '10%',
		width: '7%',
		cursor: 'pointer',
	},
	volumeDown: {
		zIndex: 101,
		position: 'absolute',
		top: 150,
		left: 155,
		height: '10%',
		width: '7%',
		cursor: 'pointer',
	},
	clickVolumeUp: {
		zIndex: 101,
		position: 'absolute',
		top: 170,
		left: 94,
		height: '8%',
		width: '7%',
		cursor: 'pointer',
	},
	clickVolumeDown: {
		zIndex: 101,
		position: 'absolute',
		top: 170,
		left: 70,
		height: '8%',
		width: '7%',
		cursor: 'pointer',
	},
	power: {
		zIndex: 101,
		position: 'absolute',
		bottom: 14,
		left: 90,
		height: '5%',
		width: '50%',
		cursor: 'pointer',
	},
	radioHeaderInfo: {
		textAlign: 'center',
		width: '100%',
		lineHeight: '25px',
		height: 25,
		fontSize: '12px',
	},
	radioChannelNumber: {
		width: 'fit-content',
		lineHeight: '35px',
		height: 'fit-content',
		position: 'absolute',
		top: 100,
		left: 0,
		right: 0,
		margin: 'auto',
		fontSize: 18,
	},
	input: {
		width: '100%',
		height: 'fit-content',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		margin: 'auto',
		padding: '12px 6px',
		background: `#000`,
	},
	radioType: {
		width: 'fit-content',
		height: 'fit-content',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		fontSize: 10,
	},
	membersPanel: {
		position: 'absolute',
		right: (props) =>
			props.membersAnchor === 'right'
				? `${props.membersOffsetX}%`
				: 'auto',
		left: (props) =>
			props.membersAnchor === 'left'
				? `${props.membersOffsetX}%`
				: 'auto',
		top: (props) => `${props.membersOffsetY}%`,
		transform: 'translateY(-50%)',
		zIndex: 190,
		width: 280,
		display: 'flex',
		flexDirection: 'column',
		background: 'rgba(14, 18, 26, 0.28)',
		backdropFilter: 'none',
		border: '1px solid rgba(255, 92, 58, 0.38)',
		borderRadius: 10,
		overflow: 'hidden',
		fontFamily: "'Barlow', sans-serif",
		boxShadow: 'none',
	},
	membersPanelEditing: {
		cursor: 'grab',
		userSelect: 'none',
		outline: '1px dashed rgba(255,92,58,0.4)',
	},
	membersHeader: {
		padding: '12px 14px 10px',
		borderBottom: '2px solid rgba(255,92,58,0.2)',
		flexShrink: 0,
		background: 'rgba(14, 18, 26, 0.22)',
	},
	membersHeaderTop: {
		display: 'flex',
		alignItems: 'center',
		gap: 5,
		marginBottom: 4,
	},
	membersBrand: {
		fontFamily: "'Barlow', sans-serif",
		fontWeight: 900,
		fontSize: '0.72rem',
		letterSpacing: '0.1em',
		background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		flexShrink: 0,
	},
	membersSlash: {
		fontFamily: "'Fira Mono', monospace",
		fontSize: '0.7rem',
		color: 'rgba(255,255,255,0.1)',
		WebkitTextFillColor: 'rgba(255,255,255,0.1)',
	},
	membersTitle: {
		fontFamily: "'Barlow', sans-serif",
		fontWeight: 700,
		fontSize: '0.72rem',
		letterSpacing: '0.06em',
		color: 'rgba(255,255,255,0.7)',
		WebkitTextFillColor: 'rgba(255,255,255,0.7)',
		textTransform: 'uppercase',
	},
	membersChannel: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: "'Fira Mono', monospace",
		fontSize: '0.58rem',
		letterSpacing: '0.04em',
		color: 'rgba(255,255,255,0.28)',
		textTransform: 'uppercase',
	},
	membersChannelDot: {
		width: 4,
		height: 4,
		borderRadius: '50%',
		background: '#FF5C3A',
		display: 'inline-block',
		flexShrink: 0,
	},
	membersList: {
		listStyle: 'none',
		margin: 0,
		padding: '6px 0',
		maxHeight: 340,
		overflowY: 'auto',
		background: 'transparent',
		'&::-webkit-scrollbar': { width: 4 },
		'&::-webkit-scrollbar-thumb': {
			background: 'rgba(255,92,58,0.5)',
			borderRadius: 3,
		},
		'&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
	},
	memberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '6px 14px 6px 12px',
		borderLeft: '3px solid transparent',
		transition: 'background 140ms ease, border-color 140ms ease',
	},
	memberRowTalking: {
		background: 'rgba(255,92,58,0.12)',
		borderLeftColor: '#FF5C3A',
	},
	memberName: {
		flex: 1,
		fontFamily: "'Barlow', sans-serif",
		fontWeight: 700,
		fontSize: '0.9rem',
		letterSpacing: '0.02em',
		color: 'rgba(255,255,255,0.9)',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		transition: 'color 140ms ease, text-shadow 140ms ease',
	},
	memberNameTalking: {
		color: 'rgba(255,255,255,0.95)',
		textShadow: '0 0 12px rgba(255,92,58,0.5)',
	},
	memberMic: {
		fontSize: 8,
		color: 'rgba(255,92,58,0.8)',
		flexShrink: 0,
	},
}));

const volumeUp = (e) => {
	Nui.send('VolumeUp', {});
};

const volumeDown = (e) => {
	Nui.send('VolumeDown', {});
};

const clickVolumeUp = (e) => {
	Nui.send('ClickVolumeUp', {});
};

const clickVolumeDown = (e) => {
	Nui.send('ClickVolumeDown', {});
};

const powerToggle = (e) => {
	Nui.send('TogglePower', {});
};

export default (props) => {
	const hidden = useSelector((state) => state.app.hidden);
	const power = useSelector((state) => state.app.power);
	const frequency = useSelector((state) => state.app.frequency);
	const volume = useSelector((state) => state.app.volume);
	const radioType = useSelector((state) => state.app.type);
	const freqName = useSelector((state) => state.app.frequencyName);
	const channelName = useSelector((state) => state.app.channelName);
	const members = useSelector((state) => state.app.members);
	const talkingMembers = useSelector((state) => state.app.talkingMembers);
	const membersAnchor = useSelector((state) => state.app.membersAnchor);
	const membersOffsetX = useSelector((state) => state.app.membersOffsetX);
	const membersOffsetY = useSelector((state) => state.app.membersOffsetY);
	const membersListEditMode = useSelector(
		(state) => state.app.membersListEditMode,
	);
	const talkingSet = useMemo(
		() => new Set((talkingMembers || []).map((id) => Number(id))),
		[talkingMembers],
	);
	const membersHeader = useMemo(
		() => getChannelListTitle(frequency, channelName),
		[frequency, channelName],
	);

	const classes = useStyles({
		power,
		membersAnchor,
		membersOffsetX,
		membersOffsetY,
	});

	const [freq, setFreq] = useState(frequency);
	const [dragPosition, setDragPosition] = useState(null);
	const [isDraggingMembersList, setIsDraggingMembersList] = useState(false);
	const membersPanelRef = useRef(null);
	const dragStateRef = useRef(null);

	useEffect(() => {
		if (!membersListEditMode) {
			setDragPosition(null);
			setIsDraggingMembersList(false);
			dragStateRef.current = null;
		}
	}, [membersListEditMode]);

	useEffect(() => {
		const handleMouseMove = (event) => {
			if (!dragStateRef.current || !membersListEditMode) {
				return;
			}

			event.preventDefault();
			const panelWidth = dragStateRef.current.width;
			const panelHeight = dragStateRef.current.height;
			const nextLeftPx = Math.min(
				window.innerWidth - panelWidth,
				Math.max(0, event.clientX - dragStateRef.current.offsetX),
			);
			const nextTopPx = Math.min(
				window.innerHeight - panelHeight,
				Math.max(0, event.clientY - dragStateRef.current.offsetY),
			);

			const centerY = nextTopPx + panelHeight / 2;
			const topPercent = Math.max(
				5,
				Math.min(95, (centerY / window.innerHeight) * 100),
			);

			const anchor =
				nextLeftPx + panelWidth / 2 > window.innerWidth / 2
					? 'right'
					: 'left';

			const offsetPercent =
				anchor === 'right'
					? ((window.innerWidth - (nextLeftPx + panelWidth)) /
							window.innerWidth) *
					  100
					: (nextLeftPx / window.innerWidth) * 100;

			setDragPosition({
				anchor,
				offsetX: Math.max(0, Math.min(40, offsetPercent)),
				offsetY: topPercent,
			});
		};

		const handleMouseUp = () => {
			if (!dragStateRef.current) {
				return;
			}

			dragStateRef.current = null;
			setIsDraggingMembersList(false);

			if (dragPosition) {
				Nui.send('SetMembersListPosition', {
					anchor: dragPosition.anchor,
					x: dragPosition.offsetX,
					y: dragPosition.offsetY,
				});
			}
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragPosition, membersListEditMode]);

	useEffect(() => {
		return () => {
			if (freq != frequency) setFreq(frequency);
		};
	}, []);

	const onChange = (e) => {
		setFreq(+e.target.value);
	};

	const setChannel = (e) => {
		e.preventDefault();
		Nui.send('SetChannel', {
			frequency: (+freq).toFixed(1),
		});
		setFreq((+freq).toFixed(1));
	};

	const startMembersListDrag = (event) => {
		if (!membersListEditMode || !membersPanelRef.current) {
			return;
		}

		event.preventDefault();
		const rect = membersPanelRef.current.getBoundingClientRect();
		dragStateRef.current = {
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
			width: rect.width,
			height: rect.height,
		};
		setIsDraggingMembersList(true);
	};

	const activePanelPosition = dragPosition || {
		anchor: membersAnchor,
		offsetX: membersOffsetX,
		offsetY: membersOffsetY,
	};

	const membersPanelInlineStyle = {
		left:
			activePanelPosition.anchor === 'left'
				? `${activePanelPosition.offsetX}%`
				: 'auto',
		right:
			activePanelPosition.anchor === 'right'
				? `${activePanelPosition.offsetX}%`
				: 'auto',
		top: `${activePanelPosition.offsetY}%`,
		cursor: membersListEditMode
			? isDraggingMembersList
				? 'grabbing'
				: 'grab'
			: 'default',
	};

	return (
		<>
			<Fade
				in={
					Boolean(power) &&
					frequency > 0 &&
					members.length > 0 &&
					(radioType === 1 || radioType === 2)
				}
				mountOnEnter
				unmountOnExit
			>
				<div
					ref={membersPanelRef}
					onMouseDown={startMembersListDrag}
					className={`${classes.membersPanel} ${
						membersListEditMode ? classes.membersPanelEditing : ''
					}`}
					style={membersPanelInlineStyle}
				>
					<div className={classes.membersHeader}>
						<div className={classes.membersHeaderTop}>
							<span className={classes.membersBrand}>STRATA</span>
							<span className={classes.membersSlash}>/</span>
							<span className={classes.membersTitle}>Radio List</span>
						</div>
						<span className={classes.membersChannel}>
							<span className={classes.membersChannelDot} />
							{membersHeader}
						</span>
					</div>
					<ul className={classes.membersList}>
						{members.map((member) => {
							const isTalking = talkingSet.has(Number(member.id));
							const deptColor = getDepartmentNameColor(member.department);

							return (
								<li
									key={`${member.id}-${member.name}`}
									className={`${classes.memberRow} ${
										isTalking ? classes.memberRowTalking : ''
									}`}
									style={
										!isTalking && deptColor
											? { borderLeftColor: deptColor }
											: undefined
									}
								>
									<span
										className={`${classes.memberName} ${
											isTalking ? classes.memberNameTalking : ''
										}`}
										style={
											!isTalking && deptColor
												? { color: deptColor, opacity: 0.85 }
												: undefined
										}
									>
										{member.name}
									</span>
									{isTalking && (
										<FontAwesomeIcon
											icon={['fas', 'microphone']}
											className={classes.memberMic}
										/>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			</Fade>

			<Slide direction="up" in={!hidden} mountOnEnter unmountOnExit>
				<div className={classes.wrapper}>
					<img className={classes.radioImg} src={frame} />
					<div className={classes.radio}>
					<Tooltip
						title="Volume Up"
						aria-label="volup"
						placement="top"
					>
						<div
							className={classes.volumeUp}
							onClick={volumeUp}
						></div>
					</Tooltip>
					<Tooltip
						title="Volume Down"
						aria-label="voldown"
						placement="top"
					>
						<div
							className={classes.volumeDown}
							onClick={volumeDown}
						></div>
					</Tooltip>
					<Tooltip
						title="Clicks Volume Up"
						aria-label="volup"
						placement="top"
					>
						<div
							className={classes.clickVolumeUp}
							onClick={clickVolumeUp}
						></div>
					</Tooltip>
					<Tooltip
						title="Clicks Volume Down"
						aria-label="voldown"
						placement="top"
					>
						<div
							className={classes.clickVolumeDown}
							onClick={clickVolumeDown}
						></div>
					</Tooltip>
					<Tooltip title="Power" aria-label="power" placement="top">
						<div
							className={classes.power}
							onClick={powerToggle}
						></div>
					</Tooltip>
					<div className={classes.screen}>
						<Fade in={Boolean(power)}>
							<div
								style={{
									width: '100%',
									height: '100%',
									position: 'relative',
								}}
							>
								<div className={classes.radioType}>
									{radioType}
								</div>
								<div className={classes.radioHeaderInfo}>
									<FontAwesomeIcon
										icon={['fas', 'volume-high']}
									/>
									{`: ${volume}%`}
								</div>

								<div className={classes.radioChannelNumber}>
									{power
										? frequency > 0
											? freqName === ''
												? `Channel #${frequency}`
												: `${freqName}`
											: 'No Active Channel'
										: 'Powered Off'}
								</div>

								<form
									className={classes.input}
									onSubmit={setChannel}
								>
									<TextField
										fullWidth
										id="frequency"
										type="number"
										disabled={!power}
										InputProps={{
											inputProps: {
												step: 0.1,
												min: 0,
												max: 999,
											},

											endAdornment: (
												<InputAdornment position="end">
													<IconButton type="submit">
														<FontAwesomeIcon
															icon={[
																'fas',
																'walkie-talkie',
															]}
														/>
													</IconButton>
												</InputAdornment>
											),
										}}
										value={freq}
										onChange={onChange}
										label="Frequency"
									/>
								</form>
							</div>
						</Fade>
					</div>
					</div>
				</div>
			</Slide>
		</>
	);
};
