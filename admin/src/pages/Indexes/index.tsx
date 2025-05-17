/**
 *
 * PAGE: Index, single
 * View/edit single registered index
 * 
 */

import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Index } from '../../components/Index'
import { Grid, Box, Breadcrumbs, Crumb, Link } from '@strapi/design-system'

const PageIndex = () => {

    const params = useParams<{ indexUUID: string }>()

    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />

            { params.indexUUID && (
                <Box padding={8} background="neutral100" overflow='hidden'>

                    <Breadcrumbs label="Extra navigation" className="breadcrumbs">
                        <Crumb>
                            <Link to={`./`}>Indexes Home</Link>
                        </Crumb>
                        <Crumb><span className="overflowEllipsis">{params.indexUUID}</span></Crumb>
                    </Breadcrumbs>

                    <Index indexUUID={params.indexUUID} />

                </Box>
            )}
        </Grid>
    )
}

export default PageIndex