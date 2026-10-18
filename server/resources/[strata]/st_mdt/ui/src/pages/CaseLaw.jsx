import React, { useState } from 'react';
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
import Truncate from '@nosferatu500/react-truncate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Modal } from '../components';
import { CaseLaw, CaseLawTypes } from '../data/caseLaw';

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
			'linear-gradient(135deg, rgba(22,35,48,0.9) 0%, rgba(18,24,34,0.95) 100%)',
	},
	headTitle: {
		fontSize: 22,
		fontWeight: 700,
		letterSpacing: 0.2,
		color: '#d5ecff',
		display: 'flex',
		alignItems: 'center',
		gap: 10,
	},
	headSubtitle: {
		marginTop: 4,
		fontSize: 13,
		color: '#87a0b8',
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
			color: '#8ce4e0',
			background: 'rgba(22, 89, 94, 0.33)',
			borderColor: 'rgba(67, 177, 171, 0.55)',
		},
		'&.type-2': {
			color: '#ffd08c',
			background: 'rgba(120, 73, 20, 0.33)',
			borderColor: 'rgba(235, 161, 74, 0.55)',
		},
		'&.type-3': {
			color: '#ff9f95',
			background: 'rgba(112, 32, 32, 0.35)',
			borderColor: 'rgba(219, 92, 92, 0.55)',
		},
	},
	casesWrapper: {
		height: 'calc(100% - 170px)',
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
		overflowY: 'auto',
		overflowX: 'hidden',
	},
	caseCard: {
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
			color: '#90a1b1',
			textTransform: 'uppercase',
			letterSpacing: 0.6,
		},
		'&:hover': {
			transform: 'translateY(-1px)',
			cursor: 'pointer',
		},
		'&.type-1': {
			borderLeft: '5px solid #3bb5ab',
			background:
				'linear-gradient(90deg, rgba(18,63,66,0.55) 0%, rgba(20,22,28,0.95) 30%)',
		},
		'&.type-2': {
			borderLeft: '5px solid #de8e2a',
			background:
				'linear-gradient(90deg, rgba(91,58,22,0.55) 0%, rgba(20,22,28,0.95) 30%)',
		},
		'&.type-3': {
			borderLeft: '5px solid #c65d5d',
			background:
				'linear-gradient(90deg, rgba(87,33,33,0.55) 0%, rgba(20,22,28,0.95) 30%)',
		},
	},
	caseTopLine: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: 8,
		marginBottom: 5,
	},
	caseTitle: {
		fontSize: 14,
		fontWeight: 700,
		color: '#e2edf9',
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
			color: '#7fdfd9',
			background: 'rgba(20,94,90,0.4)',
			borderColor: 'rgba(72,187,177,0.45)',
		},
		'&.type-2': {
			color: '#ffc985',
			background: 'rgba(126,79,24,0.4)',
			borderColor: 'rgba(234,159,74,0.45)',
		},
		'&.type-3': {
			color: '#ff9f9f',
			background: 'rgba(120,43,43,0.38)',
			borderColor: 'rgba(215,97,97,0.45)',
		},
	},
	casePrinciple: {
		fontSize: 12,
		color: '#9db0c4',
		fontStyle: 'italic',
	},
	searchField: {
		marginTop: 6,
		'& .MuiInputBase-root': {
			color: '#d9e2ee',
		},
		'& .MuiInput-underline:before': {
			borderBottomColor: 'rgba(111, 132, 152, 0.5)',
		},
		'& .MuiInput-underline:hover:not(.Mui-disabled):before': {
			borderBottomColor: 'rgba(111, 174, 199, 0.8)',
		},
		'& .MuiFormLabel-root': {
			color: '#8aa0b5',
		},
	},
}));

export default () => {
	const classes = useStyles();

	const [search, setSearch] = useState('');
	const [selCase, setSelCase] = useState(null);

	const filtered = CaseLaw.filter((c) =>
		`${c.title} ${c.principle}`.toUpperCase().includes(search.toUpperCase()),
	);

	return (
		<div className={classes.wrapper}>
			<div className={classes.head}>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} md={6}>
						<div className={classes.headTitle}>
							<FontAwesomeIcon icon={['fas', 'scale-balanced']} />
							<span>Case Law Reference</span>
						</div>
						<div className={classes.headSubtitle}>
							Quick legal guidance for traffic stops, force decisions, and constitutional procedure.
						</div>
						<div className={classes.legend}>
							<div className={`${classes.legendPill} type-1`}>Search &amp; Seizure</div>
							<div className={`${classes.legendPill} type-2`}>Use of Force</div>
							<div className={`${classes.legendPill} type-3`}>Rights &amp; Procedure</div>
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
						label="Search Case Law"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									{search !== '' && (
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
			<div className={classes.casesWrapper}>
				{filtered
					.sort((a, b) => a.type - b.type)
					.map((c) => (
						<div
							key={c.id}
							className={`${classes.caseCard} type-${c.type}`}
							title={c.title}
							onClick={() => setSelCase(c)}
						>
							<div className={classes.caseTopLine}>
								<div className={classes.caseTitle}>
									<Truncate lines={1}>{c.title}</Truncate>
								</div>
								<div className={`${classes.tag} type-${c.type}`}>
									{CaseLawTypes.find((t) => t.value === c.type)?.label ?? 'Unknown'}
								</div>
							</div>
							<div className={classes.casePrinciple}>
								{c.principle}
							</div>
						</div>
					))}
			</div>
			<Modal
				open={selCase != null}
				title={selCase ? selCase.title : 'Unknown'}
				closeLang="Close"
				onClose={() => setSelCase(null)}
			>
				{Boolean(selCase) && (
					<List>
						<ListItem>
							<ListItemText
								primary="Category"
								secondary={
									CaseLawTypes.find(
										(t) => t.value === selCase.type,
									)?.label ?? 'Unknown'
								}
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary="Key Principle"
								secondary={selCase.principle}
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								style={{ whiteSpace: 'pre-line' }}
								primary="Holding"
								secondary={selCase.holding}
							/>
						</ListItem>
					</List>
				)}
			</Modal>
		</div>
	);
};
