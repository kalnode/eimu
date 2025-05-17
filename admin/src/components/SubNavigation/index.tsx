/**
 *
 * COMPONENT: SubNavigation
 *
 */

import { Connector } from '@strapi/icons'
import { Box } from '@strapi/design-system'
//import { SubNav, SubNavHeader, SubNavSection, SubNavSections, SubNavLink } from '@strapi/design-system/v2'
import { SubNav, SubNavHeader, SubNavSection, SubNavSections, SubNavLink } from '@strapi/design-system'
import { NavLink } from 'react-router-dom'
import pluginId from "../../pluginId"
import appConfig from '../../../../app.config'

type MenuLink = {
    id: number
    label: string
    icon: any // TODO: Type this
    to: string
}

export const SubNavigation = () => {
    const links:Array<MenuLink> = [
        {
            id: 1,
            label: 'Home',
            icon: Connector,
            to: `/plugins/${pluginId}/home`
        },
        {
            id: 2,
            label: 'Indexes',
            icon: Connector,
            to: `/plugins/${pluginId}/indexes`
        },
        {
            id: 5,
            label: 'Mappings',
            icon: Connector,
            to: `/plugins/${pluginId}/mappings`
        },
        {
            id: 6,
            label: 'Tools',
            icon: Connector,
            to: `/plugins/${pluginId}/tools`
        },
        {
            id: 7,
            label: 'Logs',
            icon: Connector,
            to: `/plugins/${pluginId}/logs`
        },
    ]

    return (<Box style={{ height: '100vh' }} background="neutral200">
        <SubNav ariaLabel="Settings sub nav">
            <SubNavHeader label={appConfig.app_name_display} />
            <SubNavSections>
                <SubNavSection>
                    {links.map(
                        (link:MenuLink) => link.icon &&
                        <SubNavLink as={NavLink} to={link.to} key={link.id}>
                            {link.label}
                        </SubNavLink>
                        // icon={link.icon}
                        
                        )
                    }
                </SubNavSection>

            </SubNavSections>
        </SubNav>
    </Box>)
}