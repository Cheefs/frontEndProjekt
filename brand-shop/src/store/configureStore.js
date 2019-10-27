import { createLogger } from 'redux-logger';
import sagaMiddleware from 'redux-saga';
import { combineReducers, applyMiddleware, createStore, compose } from 'redux';

import rootReducer, { rootInitialState } from '../reducers';

const middleware = sagaMiddleware();
const middlewareList = [middleware, createLogger()];
const initState = {
}; 

export default function configureStore() {
    return {
        ...createStore (
            combineReducers({
                rootReducer
            }),
            initState,
            compose( applyMiddleware( ...middlewareList ) ),
        ),
        runSaga: middleware.run,
    }
}