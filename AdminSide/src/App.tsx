import * as React from 'react';
import { fetchUtils, Admin, Resource } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';

import authProvider from './authProvider';
import themeReducer from './themeReducer';
import { Login, Layout } from './layout';
import { Dashboard } from './dashboard';
import customRoutes from './routes';
import englishMessages from './i18n/en';

import visitors from './visitors';
import orders from './orders';
import products from './products';
import invoices from './invoices';
import categories from './categories';
import reviews from './reviews';
import dataProviderFactory from './dataProvider';
import simpleRestProvider from 'ra-data-simple-rest';
import Constants from './Constants';

const i18nProvider = polyglotI18nProvider(locale => {
    // if (locale === 'fr') {
    //     return import('./i18n/fr').then(messages => messages.default);
    // }

    // Always fallback on english
    return englishMessages;
}, 'en');

const httpClient = (url: string, options: any = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    // add your own headers here
    options.headers.set('X-Custom-Header', 'foobar');
    options.headers.set('Content-Range', 'pawnshop 0-2/3');
    return fetchUtils.fetchJson(url, options);
};

const dataProvider = simpleRestProvider(Constants.API_BASE_URL, httpClient);


const App = () => {
    return (
        <Admin
            title=""
            dataProvider={dataProvider}
            customReducers={{ theme: themeReducer }}
            customRoutes={customRoutes}
            authProvider={authProvider}
            dashboard={Dashboard}
            loginPage={Login}
            layout={Layout}
            i18nProvider={i18nProvider}
            disableTelemetry
        >
            <Resource name="customers" {...visitors} />
            <Resource
                name="pawnshop"
                {...orders}
                options={{ label: 'Orders' }}
            />
            {/* <Resource name="invoices" {...invoices} />
            <Resource name="products" {...products} />
            <Resource name="categories" {...categories} />
            <Resource name="reviews" {...reviews} /> */}
        </Admin>
    );
};

export default App;
