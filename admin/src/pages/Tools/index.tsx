/**
 *
 * PAGE: Misc plugin tools
 * For now, holds orphan-checking tool
 * 
 */

import { useState } from 'react'
import  { SubNavigation } from '../../components/SubNavigation'
import { Box, Flex, Button, Typography } from '@strapi/design-system'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { apiOrphansFind, apiOrphansDelete } from '../../utils/apiUrls'

const PageTools = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const toggleNotification = useNotification()

    const requestFindOrphans = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiOrphansFind)
            .then((response) => {
                console.log("requestFindOrphanRecords response is: ", response)
                toggleNotification({
                    type: "success", message: response.data, timeout: 5000
                })
            })
            .catch((error) => {
                console.log("requestFindOrphans error is: ", error)
                toggleNotification({
                    type: "warning", message: "An error has encountered.", timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }

    const requestDeleteOrphans = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiOrphansDelete)
            .then((response) => {
                console.log("requestDeleteOrphans response is: ", response)
                toggleNotification({
                    type: "success", message: response.data, timeout: 5000
                })
            })
            .catch((error) => {
                console.log("requestDeleteOrphans error is: ", error)
                toggleNotification({
                    type: "warning", message: "An error has encountered.", timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Box padding={8} background="neutral100" width="100%">
                <Box paddingBottom={4}>
                    <Typography variant="alpha">Tools</Typography>
                </Box>
                <Box paddingTop={2} paddingBottom={4}>
                    Orphan records:
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={ () => requestFindOrphans() }>Find orphans</Button>
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={ () => requestDeleteOrphans() }>Delete orphans</Button>
                </Box>
            </Box>    
        </Flex>
    )

}

export default PageTools
