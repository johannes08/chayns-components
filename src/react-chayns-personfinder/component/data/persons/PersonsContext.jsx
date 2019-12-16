import React, {
    createContext, useEffect, useReducer, useCallback, useContext,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { reducer as PersonsReducer, initialState } from './PersonsReducer';
import {
    fetchPersons,
    fetchSites,
} from './PersonsApi';
import {
    convertPersons, convertSites,
} from './PersonsConverter';
import FriendsHelper from './FriendsHelper';

const ObjectMapping = {
    groups: [
        { key: 'friends', lang: { de: 'Freunde', en: 'friends' }, show: value => !value },
        { key: 'personsRelated', lang: { de: 'Personen', en: 'persons' } },
        { key: 'sites', lang: { de: 'Sites', en: 'friends' } },
        { key: 'personsUnrelated', lang: { de: 'Weitere Personen', en: 'further friends' } },
    ],
    showName: 'name',
    identifier: 'id',
    search: ['name'],
    relations: 'relations',
    imageUrl: 'imageUrl',
};

const PersonFinderContext = createContext({
    ...initialState,
    dispatch: () => console.warn('dispatch: no context provided'),
    onChange: () => console.warn('onChange: no context provided'),
    onLoadMore: () => console.warn('onLoadMore: no context provided'),
    setFriend: () => console.warn('setFriend: no context provided'),
    isFriend: () => console.warn('isFriend: no context provided'),
});

const PersonFinderStateProvider = ({
    children,
    take,
    enablePersons,
    enableSites,
    enableFriends,
}) => {
    const [state, dispatch] = useReducer(PersonsReducer, initialState);
    const skipPersons = state.data.personsUnrelated.length + state.data.personsRelated.length;
    const skipSites = state.data.sites.length;

    useEffect(() => {
        if (!enableFriends) return undefined;

        const friendsListener = () => dispatch({ type: 'RECEIVE_FRIENDS', data: [] });
        FriendsHelper.addUpdateListener(friendsListener);

        return () => FriendsHelper.removeUpdateListener(friendsListener);
    }, [enableFriends]);

    const loadPersons = useCallback(async (value, clear = false) => {
        if (value.length < 3 || !enablePersons) return;

        dispatch({
            type: 'REQUEST_PERSONS',
            showWaitCursor: {
                personsRelated: state.hasMore.personsRelated,
                personsUnrelated: !state.hasMore.personsRelated,
            },
            clear,
        });

        const persons = await fetchPersons(value, skipPersons, take);
        const convertedPersons = convertPersons(persons);

        dispatch({
            type: 'RECEIVE_PERSONS',
            data: convertedPersons,
            hasMore: { personsRelated: convertedPersons.personsRelated.length === take, personsUnrelated: persons.length === take },
        });
    }, [skipPersons, take, enablePersons]);

    const loadSites = useCallback(async (value, clear = false) => {
        if (value.length < 3 || !enableSites) return;

        dispatch({
            type: 'REQUEST_SITES',
            showWaitCursor: true,
            clear,
        });

        const sites = await fetchSites(value, skipSites, take);

        dispatch({
            type: 'RECEIVE_SITES',
            data: convertSites(sites),
            hasMore: sites.length === take,
        });
    }, [skipSites, take, enableSites]);

    const onChange = useCallback(debounce(async (value) => {
        if (value.length < 3) return;
        await Promise.all([
            loadPersons(value, true),
            loadSites(value, true),
        ]);
    }, 500), [take]);

    const onLoadMore = useCallback(async (type, value) => {
        const promises = [];
        if (!type || type !== 'sites') promises.push(loadPersons(value));
        if (!type || type === 'sites') promises.push(loadSites(value));
        await Promise.all(promises);
    }, [loadPersons, loadSites]);

    return (
        <PersonFinderContext.Provider
            value={{
                ...state,
                data: {
                    ...state.data,
                    friends: enableFriends ? FriendsHelper.getFriendsList() : [],
                },
                autoLoading: !enableSites && enablePersons,
                dispatch,
                onLoadMore,
                onChange,
                setFriend: FriendsHelper.setFriend,
                isFriend: FriendsHelper.isFriend,
            }}
        >
            {children}
        </PersonFinderContext.Provider>
    );
};

PersonFinderStateProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    take: PropTypes.number,
    enablePersons: PropTypes.bool,
    enableSites: PropTypes.bool,
    enableFriends: PropTypes.bool,
};

PersonFinderStateProvider.defaultProps = {
    children: null,
    take: 20,
    enablePersons: true,
    enableSites: false,
    enableFriends: true,
};

export default {
    Consumer: PersonFinderContext.Consumer,
    Provider: PersonFinderStateProvider,
    ObjectMapping,
};

export const useStateValue = () => useContext(PersonFinderContext);
