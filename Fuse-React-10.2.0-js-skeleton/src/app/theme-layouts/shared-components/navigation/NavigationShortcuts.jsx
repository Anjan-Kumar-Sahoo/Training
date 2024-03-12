import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import FuseShortcuts from '@fuse/core/FuseShortcuts';
import { selectIsUserGuest, selectUserShortcuts, setUserShortcuts } from 'src/app/auth/user/store/userSlice';
import { usePrevious } from '@fuse/hooks';
import { useEffect } from 'react';
import _ from '@lodash';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import withSlices from 'app/store/withSlices';
import { navigationSlice, selectFlatNavigation } from './store/navigationSlice';

/**
 * The navigation shortcuts.
 */
function NavigationShortcuts(props) {
	const { variant, className } = props;
	const dispatch = useAppDispatch();
	const navigation = useAppSelector(selectFlatNavigation);
	const userShortcuts = useAppSelector(selectUserShortcuts) || [];
	const isUserGuest = useAppSelector(selectIsUserGuest);
	const prevUserShortcuts = usePrevious(userShortcuts);
	const { updateUser: updateUserService } = useAuth();
	useEffect(() => {
		if (!isUserGuest && prevUserShortcuts && !_.isEqual(userShortcuts, prevUserShortcuts)) {
			updateUserService({ data: { shortcuts: userShortcuts } });
		}
	}, [isUserGuest, userShortcuts]);

	function handleShortcutsChange(newShortcuts) {
		dispatch(setUserShortcuts(newShortcuts));
	}

	return (
		<FuseShortcuts
			className={className}
			variant={variant}
			navigation={navigation}
			shortcuts={userShortcuts}
			onChange={handleShortcutsChange}
		/>
	);
}

export default withSlices([navigationSlice])(NavigationShortcuts);
