export const initialState = {
	hidden: process.env.NODE_ENV == 'production',
	power: process.env.NODE_ENV != 'production',
	volume: 100,
	frequency: process.env.NODE_ENV != 'production' ? 462 : 0,
	frequencyName: process.env.NODE_ENV != 'production' ? 'PD Main' : '',
	channelName: process.env.NODE_ENV != 'production' ? 'LSPD' : '',
	type: process.env.NODE_ENV != 'production' ? 1 : 0,
	typeName: process.env.NODE_ENV != 'production' ? 'Police Radio' : 'Radio',
	members: process.env.NODE_ENV != 'production' ? [
		{ id: 1, name: 'J. Smith', department: 'LSPD' },
		{ id: 2, name: 'M. Johnson', department: 'LSPD' },
		{ id: 3, name: 'R. Davis', department: 'BCSO' },
		{ id: 4, name: 'T. Wilson', department: 'SASP' },
	] : [],
	talkingMembers: process.env.NODE_ENV != 'production' ? [1] : [],
	membersAnchor: 'right',
	membersOffsetX: 1.75,
	membersOffsetY: 14,
	membersListEditMode: false,
};

const appReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'APP_SHOW':
			return {
				...state,
				hidden: false,
			};
		case 'APP_HIDE':
			return {
				...state,
				hidden: true,
			};
		case 'UPDATE_DATA':
			return {
				...state,
				frequency: action.payload.frequency ?? state.frequency,
				frequencyName:
					action.payload.frequencyName ?? state.frequencyName,
				channelName: action.payload.channelName ?? state.channelName,
				power: action.payload.power ?? state.power,
				volume: action.payload.volume ?? state.volume,
				type: action.payload.type ?? state.type,
				typeName: action.payload.typeName ?? state.typeName,
				members: action.payload.members ?? state.members,
				talkingMembers:
					action.payload.talkingMembers ?? state.talkingMembers,
				membersAnchor:
					action.payload.membersAnchor ?? state.membersAnchor,
				membersOffsetX:
					action.payload.membersOffsetX ?? state.membersOffsetX,
				membersOffsetY:
					action.payload.membersOffsetY ?? state.membersOffsetY,
				membersListEditMode:
					action.payload.membersListEditMode ?? state.membersListEditMode,
			};
		default:
			return state;
	}
};

export default appReducer;
