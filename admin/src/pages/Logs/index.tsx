/**
 *
 * PAGE: Logs
 * View logs
 * 
 */

import { SubNavigation } from '../../components/SubNavigation'
import { ComponentLogs } from '../../components/Logs'
import { Grid, Box, Breadcrumbs, Crumb } from '@strapi/design-system'
import '../../styles/styles.css'

const PageLogs = () => {
    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />
            <Box padding={8} background="neutral100" overflow='hidden'>

                <Breadcrumbs label="Extra navigation" className="breadcrumbs">
                    <Crumb>Logs Home</Crumb>
                </Breadcrumbs>

                <ComponentLogs />

            </Box>
        </Grid>
    )
}

export default PageLogs
