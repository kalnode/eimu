/**
 *
 * PAGE: Home
 * 
 */

import { useState, useEffect } from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Refresh, Information } from '@strapi/icons'
import { Box, Flex, Switch, Loader, ModalLayout, ModalHeader, ModalBody, ModalFooter, ToggleInput, RadioGroup, Radio, Tooltip, Icon, Tab, TwoColsLayout, Button, IconButton, Table, Tr, Td, Grid, GridItem, Divider, Checkbox, ContentLayout, Container, ActionLayout, Layout, Link, Option, Select, Typography } from '@strapi/design-system';
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetPluginSettings, apiGetSystemInfo, apiProcessPendingTasks, apiIndexingEnabled, apiToggleIndexingEnabled, apiInstantIndexing, apiToggleInstantIndexing } from '../../utils/apiUrls'
import appConfig from '../../../../app.config'

const PageHome = () => {

    // =========================
    // GENERAL
    // =========================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [pageHasLoaded, setPageHasLoaded] = useState<boolean>(false)
    const [pluginSettings, setPluginSettings] = useState()
    const [indexingEnabled, setIndexingEnabled] = useState<boolean>(false)
    const [IndexingMode, setIndexingMode] = useState<boolean>(false)
    const [ESInstanceSettings, setESInstanceSettings] = useState()
    const [showModal_dynamicMapping, setShowModal_dynamicMapping] = useState<boolean>(false)

    const showNotification = useNotification()

    const ESdisplayLabels: { [key: string]: string } = {
        'connected': 'Connected',
        'elasticCertificate': 'Certificate',
        'elasticHost': 'Elasticsearch host',
        'elasticIndexAlias': 'Elasticsearch index Alias name',
        'elasticUserName': 'Elasticsearch username',
        'cronSchedule': 'Cron schedule',
        'initialized': 'Elasticsearch configuration loaded'
    }

    // =========================
    // API REQUESTS
    // =========================

    const requestGetPluginSettings = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetPluginSettings)
        .then((response) => {
            console.log("Plugin settings are: ", response.data)
            setPluginSettings(response.data)
            setIndexingEnabled(response.data.settingIndexingEnabled)
            setIndexingMode(response.data.settingInstantIndex)
        })
        .catch((error) => {
            console.log("requestGetPluginSettings error", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestLoadSystemInfo = async (showNotificationAfter?: boolean) => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetSystemInfo)
        .then((response) => {
            console.log("requestLoadSystemInfo response", response)
            setESInstanceSettings(response.data)
        })
        .catch((error) => {
            console.log("requestLoadSystemInfo error", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
            if (showNotificationAfter) {
                showNotification({
                    type: "success", message: "System information reloaded.", timeout: 5000
                })
            }
        })
    }

    const requestProcessPendingTasks = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiProcessPendingTasks)
        .then((response) => {
            showNotification({
                type: "success", message: "The indexing job to process the pending tasks is started.", timeout: 5000
            })
        })
        .catch((error) => {
            console.log("requestProcessPendingTasks error", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestGetIndexingMode = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiInstantIndexing)
        .then((response) => {
            setIndexingMode(response.data)
        })
        .catch((error) => {
            console.log("requestGetIndexingMode error", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestToggleIndexingMode = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiToggleInstantIndexing)
        .then((response) => {
            setIndexingMode(response.data)
        })
        .catch((error) => {
            console.log("requestToggleIndexingMode error:", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestGetIndexingEnabled = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiIndexingEnabled)
        .then( (response) => {
            setIndexingEnabled(response.data)
        })
        .catch( (error) => {
            console.log("requestGetIndexingEnabled error:", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }
    
    const requestToggleIndexingEnabled = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiToggleIndexingEnabled)
        .then( (response) => {
            setIndexingEnabled(response.data)
        })
        .catch( (error) => {
            console.log("requestToggleIndexingEnabled error:", error)
            showNotification({
                type: "warning", message: "An error has encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    // =========================
    // LIFECYCLE STUFF
    // =========================

    useEffect(() => {
        requestGetPluginSettings()
        requestLoadSystemInfo()
    }, [])

    useEffect(() => {
        // TODO: Can we eliminate this timeout? Doing it to minimize FOUC due to the EmptyStateLayout view. 
        setTimeout(() => {
            setPageHasLoaded(true)            
        }, 200)
    }, [])

    // =========================
    // TEMPLATE
    // =========================
 
    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />

            { !pageHasLoaded && (
                <Flex width="100%" height="100%" justifyContent="center">
                    <Loader />
                </Flex>
            )}

            { pageHasLoaded && (
                <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                    <Box>
                        <Typography variant="alpha">Home</Typography>
                    </Box>

                    {/* ---------------------------------------------- */}
                    {/* HEADER */}
                    {/* ---------------------------------------------- */}
                    <Flex direction="column" alignItems="start" gap={8} width="100%" marginTop="2">

                        <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                            <Flex direction="column" alignItems="start" gap={8}>

                                <Typography variant="beta">Summary</Typography>

                                <Typography>
                                    This plugin facilities integration between Strapi and Elasticsearch. Through the plugin dashboard interface, one can create and manage indexes and mappings, and
                                    ultimately have a mirror (full or partial) reflection of your Strapi db, in Elasticsearch.
                                </Typography>

                                Read more here:
                                <Link href={appConfig.app_repo}>
                                    {appConfig.app_repo}
                                </Link>
                            </Flex>
                        </Box>


                        <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                            <Flex direction="column" alignItems="start" gap={8}>

                                    <Box>
                                        <Flex gap={4}>
                                            <Flex gap={2} direction="column" alignItems="start">
                                                <Typography variant="beta">Automated processes</Typography>
                                                
                                                <Flex gap={2} direction="column" alignItems="start">
                                                    <Typography>For troubleshooting, disable automated processes, however there's a risk your DB and external index may become out-of-sync.</Typography>

                                                    {/* Turn this off if you want to disable all automated processes (Strapi cron & lifecycle events). Most likely you'd do this for troubleshooting, however keep in mind if changes occur to Strapi records during this time, they will be out-of-sync with your external index and you'd have to think about re-building the index. */}

                                                    <Button variant="secondary" onClick={() => {setShowModal_dynamicMapping(true)} }>
                                                        More about automated processes
                                                    </Button>
                                                </Flex>
                                                
                                                
                                            </Flex>
                                            <Switch 
                                                onClick={ () => requestToggleIndexingEnabled() }
                                                selected={indexingEnabled}
                                                visibleLabels
                                                onLabel = 'Enabled'
                                                offLabel = 'Disabled'
                                            />
                                        </Flex>
                                    </Box>

                                    <Box>
                                        <Flex gap={4}>
                                            <Typography variant="delta">Mode</Typography>
                                            <RadioGroup
                                                value={ IndexingMode ? 'instant' : 'scheduled' }
                                                onChange={ () => requestToggleIndexingMode() }
                                            >
                                                <Flex gap={4}>
                                                    <Radio value="instant">
                                                        Instant Indexing
                                                    </Radio>
                                                    <Radio value="scheduled">
                                                        Scheduled Indexing
                                                    </Radio>
                                                </Flex>
                                            </RadioGroup>

                                        </Flex>
                                    </Box>

                                    <Box>
                                        <Flex gap={4}>
                                            <Typography variant="delta">Actions</Typography>
                                            <Button loading={isInProgress} fullWidth variant="secondary" onClick={ () => requestProcessPendingTasks() }>Process pending tasks</Button>
                                        </Flex>
                                    </Box>



                            </Flex>
                        </Box>
                    </Flex>


                    {/* ---------------------------------------------- */}
                    {/* MAIN CONTENT */}
                    {/* ---------------------------------------------- */}
                    <Flex direction="column" alignItems="start" gap={8} width="100%">
                        <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                            <Flex direction="column" alignItems="start" gap={8}>

                                <Typography variant="beta">Connection</Typography>

                                { ESInstanceSettings && (
                                    <Box>
                                        <Typography variant="delta">Connected</Typography>
                                        <Flex>
                                            <Box padding={2}>
                                                { ESInstanceSettings['connected'] && ESInstanceSettings['connected'] === true && (
                                                    <Typography fontWeight="bold" textColor="success500">Yes</Typography>
                                                )}
                                                { ESInstanceSettings['connected'] && ESInstanceSettings['connected'] === false && (
                                                    <Typography fontWeight="bold" textColor="danger500">No</Typography>
                                                )}
                                            </Box>
                                            <Box padding={1}>
                                                { ESInstanceSettings['connected'] ?
                                                    <IconButton disabled={isInProgress} onClick={ () => requestLoadSystemInfo(true) } label="Refresh" icon={<Refresh />} />
                                                : null }
                                            </Box>
                                        </Flex>
                                    </Box>
                                )}

                                <Box>
                                    { ESInstanceSettings && (
                                        Object.keys(ESInstanceSettings).map((k, idx) => {
                                            if (k !== 'connected') {
                                                return (
                                                    <Flex key={idx} gap={2} justifyBetween>
                                                        <Box>
                                                            <Typography textColor="neutral600">{ ESdisplayLabels[k] }:</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography textColor="neutral600">{ String(ESInstanceSettings[k]) }</Typography>
                                                        </Box>                                            
                                                    </Flex>
                                                )
                                            }
                                        })                                
                                    ) }
                                </Box>
        

                            </Flex>
                        </Box>
                    </Flex>

                    {/* <Box width="100%" paddingBottom={4}>
                        <TwoColsLayout startCol={
                            <>
                            Column 1
                        </>}

                        endCol={<>
                            Column 2
                            </>
                        } />
                    </Box> */}
                </Flex>





            )}






            {/* ---------------------------------------------- */}
            {/* MODAL: DYNAMIC MAPPING */}
            {/* ---------------------------------------------- */}
            { showModal_dynamicMapping && (
                <ModalLayout onClose={() => {setShowModal_dynamicMapping(false)} }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Automated Processes
                        </Typography>
                    </ModalHeader>
                    <ModalBody>

                        <Flex direction="column" alignItems="start" gap={4}>
                            <Typography variant="beta">Overview</Typography>

                            <Typography>
                                When in operation, this plugin performs the following automated processes:
                            </Typography>

                            <Typography fontWeight="bold">1 - Strapi lifecycle events</Typography>

                            <Typography>
                                This plugin listens for Strapi lifecycle events related to records being modified (ie create/update/delete). When an event occurs, the plugin will attempt to index the record on any relevant ES indexes,
                                based on your configuration of registered indexes and mappings within the plugin.
                            </Typography>

                            <Typography>
                                e.g. On Strapi "afterCreate" or "afterUpdate", if the event matches the configuration of mappings on one of your registered ES indexes,
                                the plugin will attempt to index the record (or schedule a pending task) on the relevant external ES indexes.
                            </Typography>
                              
                            
                            <Typography fontWeight="bold">2 - Cron cycle</Typography>

                            <Typography>
                                At recurring intervals (the "cron cycle"), based on the plugins' configuration file, this plugin processes any pending tasks.
                                
                                e.g. If the cron configuration is: "Daily at 1am", then this plugin will process any pending indexing tasks at that time.
                            </Typography>

                            <Typography variant="beta">Disabling automated processes</Typography>

                            <Typography>
                                If the plugin automated processes are disabled, and modifications continue to occur to Strapi records, then there's a risk that your Strapi db and your external ES indexes may become out-of-sync.
                            </Typography>

                            <Typography>
                                If de-sync'ing occurs, then steps can be taken to re-sync the ES index. After re-enabling the plugin's automated processes, you could manually force a re-indexing of offending records by simply modifying them in some way (e.g. unpublish then publish) which would invoke an indexing event.
                            </Typography>

                            <Typography>
                                Or you can attempt to re-build the entire ES index completely (see the features available in each registered index page), however if the number of records is large, this can be a daunting & challenging; re-building an index could take 10 seconds or 10 hours... depending on the size and complexity of your database.
                            </Typography>


                            
                        </Flex>

                    </ModalBody>
                    <ModalFooter
                        endActions={<>
                            <Button
                            onClick={ () => setShowModal_dynamicMapping(false) } variant="primary">
                                Ok
                            </Button>
                        </>}
                    />
                </ModalLayout>

            ) }

        </Flex>
    )
}

export default PageHome