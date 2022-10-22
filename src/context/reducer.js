const reducer = (state, action) => {
    switch(action.type) {
        case 'SEARCH_USER':
            return {...state, user: action.payload};
        case 'SET_REQUESTS':
            return {...state, requests: action.payload};
        case 'SET_LOADING':
            return {...state, isLoading: !state.isLoading};
        case 'SHOW_ERROR':
            return {...state, error: action.payload};
        case 'SET_USER':
            return {...state, githubUser: action.payload};
        case 'SET_REPOS':
            return {...state, repos: action.payload};
        case 'SET_FOLLOWERS':
            return {...state, followers: action.payload};
    }
}

export default reducer;