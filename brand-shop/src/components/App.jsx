import React from 'react';
import rootSaga from '../sagas';
import { Provider } from 'react-redux';
import configureStore from '../store/configureStore';

const store = configureStore();
store.runSaga(rootSaga);

export default function App() {
    return (
        <Provider store={ store }>
            <div>HelloWorld</div>
        </Provider>    
    );
}