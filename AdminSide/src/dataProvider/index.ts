import { DataProvider } from 'react-admin';
// import fakeServerFactory from '../fakeServer';
import simpleRestProvider from 'ra-data-simple-rest';
import API_BASE_URL from '../Constants';

export default (type: string) => {
    return simpleRestProvider(API_BASE_URL + '')
};
