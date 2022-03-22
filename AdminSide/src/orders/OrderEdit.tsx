import * as React from 'react';
import {
    BooleanInput,
    DateField,
    Edit,
    EditProps,
    FormWithRedirect,
    Labeled,
    ReferenceField,
    SelectInput,
    BooleanField,
    TextField,
    TextInput,
    Link as RALink,
    Toolbar,
    useTranslate,
} from 'react-admin';
import { Link as RouterLink } from 'react-router-dom';
import {
    Card,
    CardContent,
    Box,
    Grid,
    Typography,
    Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { 
    Order, 
    // Customer 
} from '../types';



interface OrderTitleProps {
    record?: Order;
}

const OrderTitle = ({ record }: OrderTitleProps) => {
    const translate = useTranslate();
    return record ? (
        <span>
            {translate('resources.pawnshop.title', {
                reference: record.reference,
            })}
        </span>
    ) : null;
};

// const CustomerDetails = ({ record }: { record?: Customer }) => (
//     <Box display="flex" flexDirection="column">
//         <Typography
//             component={RouterLink}
//             color="primary"
//             to={`/customers/${record?.id}`}
//             style={{ textDecoration: 'none' }}
//         >
//             {record?.first_name} {record?.last_name}
//         </Typography>
//         <Typography
//             component={Link}
//             color="primary"
//             href={`mailto:${record?.email}`}
//             style={{ textDecoration: 'none' }}
//         >
//             {record?.email}
//         </Typography>
//     </Box>
// );

// const CustomerAddress = ({ record }: { record?: Customer }) => (
//     <Box>
//         <Typography>
//             {record?.first_name} {record?.last_name}
//         </Typography>
//         <Typography>{record?.address}</Typography>
//         <Typography>
//             {record?.city}, {record?.stateAbbr} {record?.zipcode}
//         </Typography>
//     </Box>
// );

const useEditStyles = makeStyles({
    root: { alignItems: 'flex-start' },
});

const Spacer = () => <Box m={1}>&nbsp;</Box>;

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

const OrderForm = (props: any) => {
    const translate = useTranslate();
    return (
        <FormWithRedirect
            {...props}
            render={(formProps: any) => (
                <Box maxWidth="50em">
                    <Card>
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={12} md={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {translate(
                                            'resources.pawnshop.section.order'
                                        )}
                                    </Typography>
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Name"
                                                source="asset_name"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_name"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Type"
                                                source="asset_type"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_type"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Description"
                                                source="asset_description"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_description"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                    </Grid>
                                    <Spacer />
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Address"
                                                source="asset_address"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_address"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Street"
                                                source="asset_address_street"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_address_street"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="City"
                                                source="asset_address_city"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_address_city"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                    </Grid>
                                    <Spacer />
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Country"
                                                source="asset_address_country"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_address_country"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="State"
                                                source="asset_address_state"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="asset_address_state"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                    </Grid>
                                    <Spacer />
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Valuation Report"
                                                source="valuation_report"
                                                resource="pawnshop"
                                            >
                                                <RALink to="http://localhost/openchaindex/pawnshop/files/Screenshot_from_2022-03-18_20-38-37.png">
                                                    xxxxxxxxxxxx
                                                </RALink>
                                                {/* <TextField
                                                    source="valuation_report"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                /> */}
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Box>
                                                <TextInput
                                                    source="price"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <TextInput
                                                source="price_percentage"
                                                resource="pawnshop"
                                                record={formProps.record}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Spacer />
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Quote Price"
                                                source="quote_price"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="quote_price"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Estimated Fee"
                                                source="estimated_fee"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="estimated_fee"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={4}>
                                            <Labeled
                                                label="Estimated OCAT"
                                                source="estimated_ocat"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="estimated_ocat"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                    </Grid>
                                    <Spacer />
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={6}>
                                            <Labeled
                                                source="created_at"
                                                resource="pawnshop"
                                            >
                                                <DateField
                                                    source="created_at"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid>
                                        {/* <Grid item xs={12} sm={12} md={6}>
                                            <Labeled
                                                source="reference"
                                                resource="pawnshop"
                                            >
                                                <TextField
                                                    source="reference"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            </Labeled>
                                        </Grid> */}
                                    </Grid>
                                    <Spacer />
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={3}>
                                            <Labeled
                                                label="Status"
                                                resource="pawnshop"
                                            >
                                            {
                                                // Once verified, never can be reverted
                                                <TextField
                                                    source="statusText"
                                                    resource="pawnshop"
                                                    record={formProps.record}
                                                />
                                            }
                                            </Labeled>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={3}>
                                            <Labeled
                                                label="Action"
                                                resource="pawnshop"
                                            >
                                            { 
                                                formProps.record.status == 1 || 
                                                formProps.record.status == 3 ?
                                                <SelectInput
                                                    source="status"
                                                    choices={[
                                                        { id: 2, name: 'Decline' },
                                                        { id: 4, name: 'Approve' },
                                                    ]}
                                                />: 
                                                formProps.record.status == 4 ? 
                                                <SelectInput
                                                    source="status"
                                                    choices={[
                                                        { id: 2, name: 'Decline' },
                                                    ]}
                                                />:<></> 
                                            }
                                            </Labeled>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* <Spacer /> */}
                            {/* <Box>
                                <Totals record={formProps.record} />
                            </Box> */}
                        </CardContent>
                        <Toolbar
                            record={formProps.record}
                            basePath={formProps.basePath}
                            undoable={true}
                            invalid={formProps.invalid}
                            handleSubmit={formProps.handleSubmit}
                            saving={formProps.saving}
                            resource="pawnshop"
                        />
                    </Card>
                </Box>
            )}
        />
    );
};
const OrderEdit = (props: EditProps) => {
    const classes = useEditStyles();
    return (
        <Edit
            title={<OrderTitle />}
            classes={classes}
            {...props}
            component="div"
        >
            <OrderForm />
        </Edit>
    );
};

export default OrderEdit;
