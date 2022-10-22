import React, { useState, useReducer, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import reducer from './reducer';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const initialState = {
    githubUser: mockUser,
    repos: mockRepos,
    followers: mockFollowers,
    user: '',
    requests: 0,
    isLoading: false,
    error: {show: false, msg: ''},
}

const GithubContext = React.createContext();

const GithubProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const searchGithubUser = async(user) => {
        try {
            toggleError();
            dispatch({type: 'SET_LOADING'})
            const response = await axios(`${rootUrl}/users/${user}`);
            if(response) {
                dispatch({type: 'SET_USER', payload: response.data});
                const {login, followers_url} = response.data;
                // const reposRes = await axios(`${rootUrl}/users/${login}/repos?per_page=100`);
                // const followersRes = await axios(`${followers_url}?per_page=100`);
                const [repos, followers] = await Promise.allSettled([
                    axios(`${rootUrl}/users/${login}/repos?per_page=100`),
                    axios(`${followers_url}?per_page=100`)
                ])
                if(repos.status === 'fulfilled') {
                    dispatch({type: 'SET_REPOS', payload: repos.value.data});
                }
                if(followers.status === 'fulfilled') {
                    dispatch({type: 'SET_FOLLOWERS', payload: followers.value.data});
                }
            } else {
                toggleError(true, 'there is no user with that username.')
            }
            checkRequests();
            dispatch({type: 'SET_LOADING'});
        } catch (error) {
            console.log(error);
        }
    }

    // check rate
    const checkRequests = async () => {
        try {
            const {data} = await axios(`${rootUrl}/rate_limit`);
            const {rate: {remaining}} = data;
            dispatch({type: 'SET_REQUESTS', payload: remaining});
            if(remaining === 0) {
                toggleError(true, 'sorry, you have exceeded your hourly rate limit!')
            }
        } catch(err) {
            console.log(err);
        }
    }
    const handleSearch = (query) => {
        dispatch({type: 'SEARCH_USER', payload: query});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(state.user) {
            searchGithubUser(state.user);
        }
    }

    const toggleError = (show = false, msg = '') => {
        dispatch({type: 'SHOW_ERROR', payload: {show, msg}});
    }

    useEffect(checkRequests, []);
    
    
    return <GithubContext.Provider value={{...state, handleSearch, handleSubmit}}>{children}</GithubContext.Provider>
}

export {GithubContext, GithubProvider};