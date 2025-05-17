/**
 *
 * PAGE: Registered mappings
 * View/edit registered mappings
 * 
 */

import { SubNavigation } from '../../components/SubNavigation'
import { Mappings } from '../../components/Mappings'
import { Grid, Box, Breadcrumbs, Crumb } from '@strapi/design-system'
import '../../styles/styles.css'

const PageMappings = () => {
    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />
            <Box padding={8} background="neutral100" overflow='hidden'>

                <Breadcrumbs label="Extra navigation" className="breadcrumbs">
                    <Crumb>Mappings Home</Crumb>
                </Breadcrumbs>

                <Mappings />
            </Box>        
        </Grid>
    )
}

export default PageMappings
