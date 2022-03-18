import * as React from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import {
    AutocompleteInput,
    BooleanField,
    Datagrid,
    DatagridProps,
    DateField,
    DateInput,
    Identifier,
    List,
    ListContextProvider,
    ListProps,
    NullableBooleanInput,
    NumberField,
    ReferenceInput,
    ReferenceField,
    SearchInput,
    TextField,
    TextInput,
    useGetList,
    useListContext,
    EditButton,
} from 'react-admin';
import { useMediaQuery, Divider, Tabs, Tab, Theme } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import NbItemsField from './NbItemsField';
import CustomerReferenceField from '../visitors/CustomerReferenceField';
import AddressField from '../visitors/AddressField';
import MobileGrid from './MobileGrid';
import { Customer } from '../types';

const orderFilters = [
    <SearchInput source="q" alwaysOn />,
    <ReferenceInput source="customer_id" reference="customers">
        <AutocompleteInput
            optionText={(choice: Customer) =>
                choice.id // the empty choice is { id: '' }
                    ? `${choice.first_name} ${choice.last_name}`
                    : ''
            }
        />
    </ReferenceInput>,
    <DateInput source="date_gte" />,
    <DateInput source="date_lte" />,
    <TextInput source="total_gte" />,
    <NullableBooleanInput source="returned" />,
];

const useDatagridStyles = makeStyles({
    total: { fontWeight: 'bold' },
});

const tabs = [
    { id: 'ordered', name: 'ordered' },
    { id: 'delivered', name: 'delivered' },
    { id: 'cancelled', name: 'cancelled' },
];

interface TabbedDatagridProps extends DatagridProps {}

const useGetTotals = (filterValues: any) => {
    const { total: totalOrdered } = useGetList(
        'pawnshop',
        { perPage: 1, page: 1 },
        { field: 'id', order: 'ASC' },
        { ...filterValues, status: 'ordered' }
    );
    const { total: totalDelivered } = useGetList(
        'pawnshop',
        { perPage: 1, page: 1 },
        { field: 'id', order: 'ASC' },
        { ...filterValues, status: 'delivered' }
    );
    const { total: totalCancelled } = useGetList(
        'pawnshop',
        { perPage: 1, page: 1 },
        { field: 'id', order: 'ASC' },
        { ...filterValues, status: 'cancelled' }
    );

    return {
        ordered: totalOrdered,
        delivered: totalDelivered,
        cancelled: totalCancelled,
    };
};

const TabbedDatagrid = (props: TabbedDatagridProps) => {
    const listContext = useListContext();
    const { ids, filterValues, setFilters, displayedFilters } = listContext;
    const classes = useDatagridStyles();
    const isXSmall = useMediaQuery<Theme>(theme =>
        theme.breakpoints.down('xs')
    );
    const [ordered, setOrdered] = useState<Identifier[]>([] as Identifier[]);
    const [delivered, setDelivered] = useState<Identifier[]>(
        [] as Identifier[]
    );
    const [cancelled, setCancelled] = useState<Identifier[]>(
        [] as Identifier[]
    );
    const totals = useGetTotals(filterValues) as any;

    useEffect(() => {
        if (ids && ids !== filterValues.status) {
            switch (filterValues.status) {
                case 'ordered':
                    setOrdered(ids);
                    break;
                case 'delivered':
                    setDelivered(ids);
                    break;
                case 'cancelled':
                    setCancelled(ids);
                    break;
            }
        }
    }, [ids, filterValues.status]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<{}>, value: any) => {
            setFilters &&
                setFilters(
                    { ...filterValues, status: value },
                    displayedFilters
                );
        },
        [displayedFilters, filterValues, setFilters]
    );

    const selectedIds =
        filterValues.status === 'ordered'
            ? ordered
            : filterValues.status === 'delivered'
            ? delivered
            : cancelled;

    return (
        <Fragment>
            <Tabs
                variant="fullWidth"
                centered
                value={filterValues.status}
                indicatorColor="primary"
                onChange={handleChange}
            >
                {tabs.map(choice => (
                    <Tab
                        key={choice.id}
                        label={
                            totals[choice.name]
                                ? `${choice.name} (${totals[choice.name]})`
                                : choice.name
                        }
                        value={choice.id}
                    />
                ))}
            </Tabs>
            <Divider />
            {isXSmall ? (
                <ListContextProvider
                    value={{ ...listContext, ids: selectedIds }}
                >
                    <MobileGrid {...props} ids={selectedIds} />
                </ListContextProvider>
            ) : (
                <div>
                    {filterValues.status === 'ordered' && (
                        <ListContextProvider
                            value={{ ...listContext, ids: ordered }}
                        >
                            <Datagrid {...props} optimized rowClick="edit">
                                {/* 
                                data: {
                                    asset_name: '',
                                    asset_type: '',
                                    asset_description: '',
                                    asset_address: '',
                                    asset_address_street: '',
                                    asset_address_city: '',
                                    asset_address_state: '',
                                    asset_address_zipcode: '',
                                    asset_address_country: '',
                                    valuation_report: '',
                                    price: 0,
                                    price_percentage: 0,
                                    quote_price: 0,
                                    estimated_ocat: 0,
                                    estimated_fee: '',
                                    verified: false
                                } */}
                                <TextField label="Name" source="asset_name" />
                                <TextField label="Type" source="asset_type" />
                                <NumberField label="Zip Code" source="asset_address_zipcode" />
                                <TextField label="Country" source="asset_address_country" />
                                <NumberField 
                                    label="Price" 
                                    source="price" 
                                    options={{
                                        style: 'currency',
                                        currency: 'AUD',
                                    }}
                                />
                                <NumberField label="Price Percentage" source="price_percentage" />
                                <NumberField 
                                    label="Quote Price" 
                                    source="quote_price" 
                                    options={{
                                        style: 'currency',
                                        currency: 'AUD',
                                    }}
                                />
                                <NumberField label="Estimated OCAT" source="estimated_ocat" />
                                <TextField label="Estimated Fee" source="estimated_fee" />
                                <DateField source="created_at" showTime />
                                <BooleanField label="Approved" source="verified"/>
                                <EditButton label="Edit" basePath="/pawnshop" />
                                {/* <CustomerReferenceField />
                                <ReferenceField
                                    source="customer_id"
                                    reference="customers"
                                    link={false}
                                    label="resources.pawnshop.fields.address"
                                >
                                    <AddressField />
                                </ReferenceField> */}
                                {/* <NbItemsField /> */}
                            </Datagrid>
                        </ListContextProvider>
                    )}
                    {filterValues.status === 'delivered' && (
                        <ListContextProvider
                            value={{ ...listContext, ids: delivered }}
                        >
                            <Datagrid {...props} rowClick="edit">
                                <DateField source="date" showTime />
                                <TextField source="reference" />
                                <CustomerReferenceField />
                                <ReferenceField
                                    source="customer_id"
                                    reference="customers"
                                    link={false}
                                    label="resources.pawnshop.fields.address"
                                >
                                    <AddressField />
                                </ReferenceField>
                                {/* <NbItemsField /> */}
                                <NumberField
                                    source="total"
                                    options={{
                                        style: 'currency',
                                        currency: 'USD',
                                    }}
                                    className={classes.total}
                                />
                                <BooleanField source="returned" />
                            </Datagrid>
                        </ListContextProvider>
                    )}
                    {filterValues.status === 'cancelled' && (
                        <ListContextProvider
                            value={{ ...listContext, ids: cancelled }}
                        >
                            <Datagrid {...props} rowClick="edit">
                                <DateField source="date" showTime />
                                <TextField source="reference" />
                                <CustomerReferenceField />
                                <ReferenceField
                                    source="customer_id"
                                    reference="customers"
                                    link={false}
                                    label="resources.pawnshop.fields.address"
                                >
                                    <AddressField />
                                </ReferenceField>
                                {/* <NbItemsField /> */}
                                <NumberField
                                    source="total"
                                    options={{
                                        style: 'currency',
                                        currency: 'USD',
                                    }}
                                    className={classes.total}
                                />
                                <BooleanField source="returned" />
                            </Datagrid>
                        </ListContextProvider>
                    )}
                </div>
            )}
        </Fragment>
    );
};

const OrderList = (props: ListProps) => (
    <List
        {...props}
        filterDefaultValues={{ status: 'ordered' }}
        sort={{ field: 'date', order: 'DESC' }}
        perPage={25}
        filters={orderFilters}
    >
        <TabbedDatagrid />
    </List>
);

export default OrderList;
