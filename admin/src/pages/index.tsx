/**
 *
 * Top-level definitions of all admin pages in the plugin.
 * All pages must be defined here.
 *
 */

import { Switch, Route, Redirect } from 'react-router-dom'
import { AnErrorOccurred } from '@strapi/helper-plugin'
import pluginId from '../pluginId'

import Homepage from './Home'
import Indexes from './Indexes/indexes'
import Index from './Indexes'
import IndexMappings from './Indexes/indexMappings'
import IndexMapping from './Indexes/indexMapping'
import Mappings from './Mappings/mappings'
import Mapping from './Mappings/mapping'
import Tools from './Tools'
import Logs from './Logs'

const App = () => {
    return (
        <Switch>

            {/* TODO: Affirm what attribute "exact" means on each link and what the proper way is */}

            <Route path={`/plugins/${pluginId}`} render={() => (<Redirect to={`/plugins/${pluginId}/home`} />)} exact />
            <Route path={`/plugins/${pluginId}/home`} component={Homepage} exact />

            <Route path={`/plugins/${pluginId}/indexes`} component={Indexes} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexUUID`} component={Index} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexUUID/mappings`} component={IndexMappings} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexUUID/mappings/:mappingUUID`} component={IndexMapping} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexUUID/mappings/:mappingUUID/:type`} component={IndexMapping} exact />

            <Route path={`/plugins/${pluginId}/mappings`} component={Mappings} exact />
            <Route path={`/plugins/${pluginId}/mappings/:mappingUUID`} component={Mapping} exact />
            <Route path={`/plugins/${pluginId}/mappings/:mappingUUID/:type`} component={Mapping} exact />

            <Route path={`/plugins/${pluginId}/tools`} component={Tools} />
            <Route path={`/plugins/${pluginId}/logs`} component={Logs} />

            <Route component={AnErrorOccurred} />
        </Switch>
    )
}

export default App
