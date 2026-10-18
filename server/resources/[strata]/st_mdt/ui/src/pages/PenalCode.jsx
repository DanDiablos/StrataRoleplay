import React, { useEffect, useState } from 'react';
import {
	Grid,
	IconButton,
	TextField,
	InputAdornment,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import Truncate from '@nosferatu500/react-truncate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import { Modal } from '../components';
import { CurrencyFormat } from '../util/Parser';
import { ChargeTypes } from '../data';
import Nui from '../util/Nui';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: 20,
		height: '100%',
		overflow: 'hidden',
	},
	head: {
		marginBottom: 14,
		padding: 12,
		borderRadius: 10,
		border: `1px solid ${theme.palette.border.divider}`,
		background:
			'linear-gradient(135deg, rgba(30,26,45,0.92) 0%, rgba(19,24,40,0.96) 100%)',
	},
	headTitle: {
		fontSize: 22,
		fontWeight: 700,
		letterSpacing: 0.2,
		color: '#e2ddff',
		display: 'flex',
		alignItems: 'center',
		gap: 10,
	},
	headSubtitle: {
		marginTop: 4,
		fontSize: 13,
		color: '#a59bc8',
	},
	legend: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 10,
	},
	legendPill: {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '6px 10px',
		borderRadius: 999,
		fontSize: 12,
		fontWeight: 600,
		letterSpacing: 0.2,
		border: '1px solid transparent',
		'&.type-1': {
			color: '#97d8ff',
			background: 'rgba(24, 76, 119, 0.38)',
			borderColor: 'rgba(81, 157, 212, 0.55)',
		},
		'&.type-2': {
			color: '#ffe1a8',
			background: 'rgba(118, 77, 26, 0.38)',
			borderColor: 'rgba(229, 169, 78, 0.55)',
		},
		'&.type-3': {
			color: '#ffb0b0',
			background: 'rgba(125, 37, 37, 0.38)',
			borderColor: 'rgba(219, 102, 102, 0.55)',
		},
	},
	chargesWrapper: {
		height: 'calc(100% - 170px)',
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
		overflowY: 'auto',
		overflowX: 'hidden',
	},
	charge: {
		width: '100%',
		padding: '12px 14px',
		minHeight: 84,
		userSelect: 'none',
		color: theme.palette.text.main,
		background: 'rgba(20, 22, 28, 0.92)',
		border: `1px solid ${theme.palette.border.divider}`,
		borderRadius: 10,
		transition: 'transform ease-in 0.12s, border-color ease-in 0.12s',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		'& small': {
			fontSize: 11,
			color: '#9ba7b3',
			textTransform: 'uppercase',
			letterSpacing: 0.6,
		},
		'&:hover': {
			transform: 'translateY(-1px)',
			cursor: 'pointer',
		},
		'&.type-1': {
			borderLeft: '5px solid #4f9ed0',
			background:
				'linear-gradient(90deg, rgba(27,63,94,0.6) 0%, rgba(20,22,28,0.95) 30%)',
		},
		'&.type-2': {
			borderLeft: '5px solid #d49b3d',
			background:
				'linear-gradient(90deg, rgba(90,63,28,0.58) 0%, rgba(20,22,28,0.95) 30%)',
		},
		'&.type-3': {
			borderLeft: '5px solid #d25e5e',
			background:
				'linear-gradient(90deg, rgba(101,35,35,0.58) 0%, rgba(20,22,28,0.95) 30%)',
		},
	},
	chargeTopLine: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: 8,
		marginBottom: 5,
	},
	chargeTitle: {
		fontSize: 14,
		fontWeight: 700,
		color: '#e8ecf7',
		flexGrow: 1,
		minWidth: 0,
	},
	tag: {
		alignSelf: 'flex-start',
		fontSize: 10,
		fontWeight: 700,
		letterSpacing: 0.6,
		textTransform: 'uppercase',
		padding: '3px 7px',
		borderRadius: 999,
		border: '1px solid transparent',
		'&.type-1': {
			color: '#9dd8fa',
			background: 'rgba(31,86,126,0.4)',
			borderColor: 'rgba(83, 160, 217, 0.45)',
		},
		'&.type-2': {
			color: '#ffe0a4',
			background: 'rgba(121,82,33,0.42)',
			borderColor: 'rgba(226,167,74,0.45)',
		},
		'&.type-3': {
			color: '#ffb0b0',
			background: 'rgba(126,43,43,0.4)',
			borderColor: 'rgba(215,95,95,0.45)',
		},
	},
	chargeMeta: {
		fontSize: 12,
		color: '#abb8c8',
		fontStyle: 'italic',
	},
	searchField: {
		marginTop: 6,
		'& .MuiInputBase-root': {
			color: '#e2deff',
		},
		'& .MuiInput-underline:before': {
			borderBottomColor: 'rgba(140, 127, 175, 0.52)',
		},
		'& .MuiInput-underline:hover:not(.Mui-disabled):before': {
			borderBottomColor: 'rgba(162, 142, 214, 0.82)',
		},
		'& .MuiFormLabel-root': {
			color: '#aa9fcb',
		},
	},
}));

const initialState = {
	type: 1,
	title: '',
	description: '',
	fine: '',
	jail: '',
	points: '',
};

export default () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const charges = useSelector((state) => state.data.data.charges);
	const breakpoints = useSelector((state) => state.app.pointBreakpoints);

	const [search, setSearch] = useState('');
	const [selCharge, setSelCharge] = useState(null);
	const [filtered, setFiltered] = useState(Array());

	useEffect(() => {
		setFiltered(
			charges.filter((c) =>
				c.title.toUpperCase().includes(search.toUpperCase()),
			),
		);
	}, [search]);

	useEffect(() => {
		setFiltered(
			charges.filter((c) =>
				c.title.toUpperCase().includes(search.toUpperCase()),
			),
		);
	}, [charges]);

	return (
		<div className={classes.wrapper}>
			<div className={classes.head}>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} md={6}>
						<div className={classes.headTitle}>
							<FontAwesomeIcon icon={['fas', 'gavel']} />
							<span>Penal Code Reference</span>
						</div>
						<div className={classes.headSubtitle}>
							Browse charges by severity and review sentencing information before issuing charges.
						</div>
						<div className={classes.legend}>
							<div className={`${classes.legendPill} type-1`}>Infraction</div>
							<div className={`${classes.legendPill} type-2`}>Misdemeanor</div>
							<div className={`${classes.legendPill} type-3`}>Felony</div>
						</div>
					</Grid>
					<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						variant="standard"
						className={classes.searchField}
						name="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						label="Search Charge"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									{search != '' && (
										<IconButton
											type="button"
											onClick={() => setSearch('')}
										>
											<FontAwesomeIcon
												icon={['fas', 'xmark']}
											/>
										</IconButton>
									)}
								</InputAdornment>
							),
						}}
					/>
				</Grid>
				</Grid>
			</div>
			<div className={classes.chargesWrapper}>
				{filtered
					.sort((a, b) => a.fine - b.fine)
					.sort((a, b) => a.jail - b.jail)
					.sort((a, b) => a.type - b.type)
					.map((charge) => {
						return (
							<div
								key={charge.id}
								className={`${classes.charge} type-${charge.type}`}
								title={charge.title}
								onClick={() => setSelCharge(charge)}
							>
								<div className={classes.chargeTopLine}>
									<div className={classes.chargeTitle}>
										<Truncate lines={1}>
											{charge.title}
										</Truncate>
									</div>
									<div className={`${classes.tag} type-${charge.type}`}>
										{ChargeTypes.find((t) => t.value == charge.type)?.label ?? 'Unknown'}
									</div>
								</div>
								<div className={classes.chargeMeta}>
									<small>
										{charge.jail
											? `Time: ${charge.jail} `
											: null}
										{charge.fine
											? `Fine: ${CurrencyFormat.format(
												charge.fine,
											)} `
											: null}
										{charge.points
											? `Points: ${charge.points}`
											: null}
									</small>
								</div>
							</div>
						);
					})}
			</div>
			<Modal
				open={selCharge != null}
				title={
					Boolean(selCharge) ? `${selCharge.title}` : 'UNK'
				}
				closeLang="Close"
				onClose={() => setSelCharge(null)}
			>
				{Boolean(selCharge) && (
					<List>
						<ListItem>
							<ListItemText
								primary="Charge Type"
								secondary={
									ChargeTypes.filter(
										(t) => t.value == selCharge.type,
									)[0].label
								}
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary="Charge Name"
								secondary={selCharge.title}
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								style={{ whiteSpace: 'pre-line' }}
								primary="Charge Description"
								secondary={selCharge.description}
							/>
						</ListItem>
						{Boolean(selCharge.fine) && (
							<ListItem>
								<ListItemText
									primary="Fine"
									secondary={CurrencyFormat.format(
										selCharge.fine,
									)}
								/>
							</ListItem>
						)}
						{Boolean(selCharge.jail) && (
							<ListItem>
								<ListItemText
									primary="Jail Sentence"
									secondary={`${selCharge.jail} Months`}
								/>
							</ListItem>
						)}
						{Boolean(selCharge.points) && (
							<ListItem>
								<ListItemText
									primary="License Points"
									secondary={`${selCharge.points} Points`}
								/>
							</ListItem>
						)}
					</List>
				)}
			</Modal>
		</div>
	);
};