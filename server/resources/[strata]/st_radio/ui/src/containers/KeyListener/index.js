import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Nui from '../../util/Nui';

const KeyListener = props => {
	const handleEvent = event => {
		const { isEditingMembersListPos } = props;
		if (event.keyCode === 127 || event.keyCode === 27) {
			if (isEditingMembersListPos) {
				event.preventDefault();
				Nui.send('SetMembersListEditMode', { enabled: false });
				return;
			}
			Nui.send('Close');
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleEvent);

		return () => {
			window.removeEventListener('keydown', handleEvent);
		};
	}, []);

	return React.Children.only(props.children);
};

KeyListener.propTypes = {
	isEditingMembersListPos: PropTypes.bool.isRequired,
	children: PropTypes.element.isRequired,
};

const mapStateToProps = (state) => ({
	isEditingMembersListPos: state.app.membersListEditMode,
});

export default connect(mapStateToProps, null)(KeyListener);
