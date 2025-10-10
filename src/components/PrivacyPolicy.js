
import React from 'react';
import {
    Container,
    Typography,
    Box,
    Link as MuiLink,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';

const PrivacyPolicy = () => {
    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Typography variant="h3" gutterBottom>
                Privacy Policy
            </Typography>

            <Typography variant="body1" paragraph>
                We value your privacy. This page explains what data we collect and how we use it.
            </Typography>

            <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                    Use of IP Address and Geolocation
                </Typography>

                <Typography variant="body1" paragraph>
                    We may use your IP address to estimate your country or region for the following purposes:
                </Typography>

                <List dense>
                    <ListItem>
                        <ListItemText primary="Displaying prices and currencies appropriate to your location" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Determining available payment options" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Improving the user experience by localizing content" />
                    </ListItem>
                </List>

                <Typography variant="body1" paragraph>
                    This information is obtained using a third-party service (such as{' '}
                    <strong>ipapi.co</strong>), and we do <strong>not</strong> store your full IP address
                    or link it to other personal data.
                </Typography>

                <Typography variant="body1" paragraph>
                    We do <strong>not</strong> use your IP address for advertising, profiling, or tracking
                    across sites.
                </Typography>
            </Box>

            <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                    Third-Party Services
                </Typography>

                <Typography variant="body1" paragraph>
                    We use <strong>ipapi.co</strong> to determine your approximate country based on your IP
                    address. This is used only to localize payment options and prices. You can read their{' '}
                    <MuiLink
                        href="https://ipapi.co/privacy/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy here
                    </MuiLink>.
                </Typography>
            </Box>

            <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                    Your Rights
                </Typography>

                <Typography variant="body1" paragraph>
                    If you are located in the European Union or another region with laws governing data
                    collection and use, you may have rights under those laws. We honor those rights to the
                    extent required.
                </Typography>
            </Box>
        </Container>
    );
};

export default PrivacyPolicy;