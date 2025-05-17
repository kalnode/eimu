/**
 *
 * COMPONENT: IndexMappings
 *
 */

import { useEffect, useState, useMemo } from 'react'
import pluginId from '../../pluginId'
import { Switch, Icon, TextButton, AccordionGroup, AccordionToggle, AccordionContent, Accordion, Box, Flex, Button, ModalLayout, ModalHeader, Link, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TabGroup, Tabs, Tab, TabPanels, TabPanel, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Relation, SingleType, ChevronRight, ChevronDown, ExclamationMarkCircle, Plus } from '@strapi/icons'
import { apiGetMappings, apiUpdateMappings, apiSyncIndex, apiDeleteMapping, apiDetachMappingFromIndex, apiGetESMapping, apiGetContentTypes, apiCreateMapping } from '../../utils/apiUrls'
import { requestAPI_DeleteMapping } from '../../utils/api/mappings'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useHistory } from 'react-router-dom'
import { requestUpdateIndex } from '../../utils/api/indexes'
import { JSONTree } from 'react-json-tree'
import { Mappings } from '../Mappings'
import { MappingFields } from '../MappingFields'
import { Mapping, StrapiTypesForPlugin } from "../../../../types"
import { convertMappingsToESMappings } from "../../../../scripts"

// TODO: Integrate ES types
import { estypes } from '@elastic/elasticsearch'

type Props = {
    indexUUID?: string
}

export const TriggersMappings = ({ indexUUID }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [contentTypes, setContentTypes] = useState<StrapiTypesForPlugin>()
    const [mappingsOriginal, setMappingsOriginal] = useState<Array<Mapping>>()
    const [mappings, setMappings] = useState<Array<Mapping>>()
    const history = useHistory()
    const showNotification = useNotification()
    const changesExist = useMemo(() => JSON.stringify(mappings) != JSON.stringify(mappingsOriginal), [mappings])

    // TODO: Apply proper mapping type, like... <esMapping> ??
    const [ESMapping, setESMapping] = useState()

    useEffect(() => {
        requestContentTypes()
        requestGetMappings()
        requestGetESMapping()
    }, [])

    // ===============================
    // API REQUESTS
    // ===============================

    const requestContentTypes = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetContentTypes)
        .then((response) => {
            setContentTypes(response.data)
            setAccordionStates(Object.keys(response.data).map( (x:string) => { return { content_type: x, open: false }}) )
        })
        .catch((error) => {
            console.log("COMPONENT IndexMappings - requestContentTypes error", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestGetMappings = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetMappings(indexUUID))
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setMappings(response.data)
                setMappingsOriginal(response.data)
            } else {
                setMappings(undefined)
                setMappingsOriginal(undefined)
            }
        })
        .catch((error) => {
            console.log("COMPONENT IndexMappings - requestGetMappings error", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestGetESMapping = () => {
        setIsInProgress(true)

        if (indexUUID) {
            axiosInstance.get(apiGetESMapping(indexUUID))
            .then((response) => {
                // TODO: Work on a better return from the server. For now doing this sillyness.
                console.log("Get ES mapping is: ", response.data)
                if (response && response.data && (Array.isArray(response.data) || response.data.constructor.name === "Object")) {
                    setESMapping(response.data)
                } else {
                    setESMapping(undefined)
                }
            })
            .catch((error) => {
                console.log("COMPONENT IndexMappings - requestGetESMapping error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestCreateMapping = async (requestedContentType:string) => {
        setIsInProgress(true)

        if (indexUUID) {

            let output:Partial<Mapping> = {
                content_type: requestedContentType,
                indexes: [ indexUUID ],
            }

            await axiosInstance.post(apiCreateMapping, {
                data: output
            })
            .then( async (response) => {
                requestGetMappings()
            })
            .catch((error) => {
                console.log("COMPONENT IndexMappings - requestCreateMapping error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestUpdateMappings = async () => {

        setIsInProgress(true)

        let mappingsClone = JSON.parse(JSON.stringify(mappings))

        await axiosInstance.post(apiUpdateMappings, {
            data: mappingsClone
        })
        .then( () => {
            requestGetMappings()
        })
        .catch((error) => {
            console.log("COMPONENT IndexMappings - requestUpdateMappings error", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
        
    }

    const requestDeleteMapping = async (key:string) => {
        if (mappings) {

            const mapping = mappings.find((x:Mapping) => x.content_type && x.content_type === key)

            if (mapping) {
                setIsInProgress(true)
                await requestAPI_DeleteMapping(mapping, indexUUID)
                .catch((error) => {
                    console.log("COMPONENT IndexMappings - requestDeleteMapping error", error)
                    showNotification({
                        type: "warning", message: "An error has encountered: " + error, timeout: 5000
                    })
                })
                .finally( async () => {
                    await requestGetMappings()
                    setIsInProgress(false)
                })
            }
        }
    }

    const requestSyncIndex = async () => {

        if (indexUUID) {
            setIsInProgress(true)
            await axiosInstance.get(apiSyncIndex(indexUUID))
            .then( (response) => {
                console.log("Sync response is: ", response)
            })
            .catch((error) => {
                console.log("COMPONENT Index - requestSyncIndex error:", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
                requestGetESMapping()
            })
        }
    }

    // ===============================
    // RAW MAPPINGS
    // ===============================

    const rawMappingsCombined = useMemo(() => {
        if (mappings && mappings.length > 0) {

            const sortedMappings = mappings.sort((a, b) => b.content_type.toLowerCase().localeCompare(a.content_type.toLowerCase()))
            return convertMappingsToESMappings(sortedMappings)
            // let work = mappings.map( (x:Mapping) =>
            //     x.fields
            //     // {
            //     //     return {
            //     //         [x.content_type]: x.fields
            //     //     }
            //     // }
            // )

            // // const work = Object.entries(mappings).reduce((acc,[key,val])=>(
            // //     acc[key] = Array.prototype.concat.apply([], Object.values(val)), acc
            // // ), {})

            // return work
        }
        return null
    }, [mappings])

    const rawMappingsES = useMemo(() => {
        if (ESMapping) {
            console.log("rawESmapping is 111", ESMapping)
            const rawESmapping = (Object.values(ESMapping)[0] as unknown as any).mappings.properties

            if (rawESmapping) {
                console.log("rawESmapping is 222", rawESmapping)
                //const sortedMappings = mappings.sort((a, b) => a.content_type.toLowerCase().localeCompare(b.content_type.toLowerCase()))
                let sortedESMapping = Object.fromEntries(Object.entries(rawESmapping).sort(([a],[b]) => b.localeCompare(a)))
                //const sortedMappings = (Object.values(ESMapping)[0] as unknown as any).mappings.properties.sort((a, b) => a.content_type.toLowerCase().localeCompare(b.content_type.toLowerCase()))
                console.log("rawESmapping is 333", sortedESMapping)
                return sortedESMapping
            }
        }
    }, [ESMapping])


    // ===============================
    // ACCORDIONS
    // ===============================

    const [accordionStates, setAccordionStates] = useState<Array<any>>() // TODO: Type this 'any' better

    const toggleAccordion = (key:string) => {
        if (accordionStates && mappings) {
            const mapping = mappings.find( (x:Mapping) => x.content_type === key)
            let accordionState = accordionStates.find( (x:any) => x.content_type === key)
            if (mapping && accordionState) {
                accordionState.open = !accordionState.open
                setAccordionStates([...accordionStates, accordionState ])
            }
        }
    }


    // ===============================
    // FORM
    // ===============================

    const resetForm = () => {
        setMappings(undefined)
        setMappings(mappingsOriginal)
    }

    const toggleMappingActive = (key:string) => {
        if (mappings) {
            let work = JSON.parse(JSON.stringify(mappings))
            let mappingIndex = work.findIndex((x:Mapping) => x.content_type && x.content_type === key)
            if (mappingIndex >= 0){
                work[mappingIndex].disabled = !work[mappingIndex].disabled
            }
            setMappings(work)            
        }
    }

    const mappingUpdated = (key:string, updatedMapping:Mapping) => {
        if (mappings) {
            let work = JSON.parse(JSON.stringify(mappings))
            const mappingIndex = work.findIndex((x:Mapping) => x.content_type && x.content_type === key)
            if (mappingIndex >= 0){
                work[mappingIndex] = updatedMapping
            }
            setMappings(work)            
        }
    }

    // ===============================
    // SELECT PRESET MAPPING
    // ===============================
    const [showSelectPresetMappingModal, setShowSelectPresetMappingModal] = useState(false)
    const [desiredPresetType, setDesiredPresetType] = useState<string>()

    const modalSelectPresetMappingOpen = (key:string) => {
        setDesiredPresetType(key)
        setShowSelectPresetMappingModal(true)
    }

    const modalSelectPresetMappingClose = async (selectedPresetMapping:Mapping) => {
        setShowSelectPresetMappingModal(false)
        setDesiredPresetType(undefined)
        if (selectedPresetMapping && selectedPresetMapping.uuid && indexUUID) {
            let mappingsOutput:Array<string> = []
            if (mappings) {
                mappingsOutput = [selectedPresetMapping.uuid, ...mappings.map((x:Mapping) => x.uuid as string)]
            } else {
                mappingsOutput = [selectedPresetMapping.uuid]
            }
            await requestUpdateIndex(indexUUID, { mappings: mappingsOutput })
            requestGetMappings()
        }
    }


    // ===============================
    // DELETE/DETACH MAPPING
    // ===============================
    const [showDeleteDetachMappingModal, setShowDeleteDetachMappingModal] = useState<boolean>(false)
    const [mappingToDeleteDetach, setMappingToDeleteDetach] = useState<Mapping>()

    const modalDeleteDetachMappingOpen = (mapping:Mapping, e?:Event) => {
        e?.stopPropagation()
        if (mapping) {
            setMappingToDeleteDetach(mapping)
            setShowDeleteDetachMappingModal(true)
        }
    }

    const modalDeleteDetachMappingClose = async (userConfirmed:boolean) => {
        setShowDeleteDetachMappingModal(false)

        if (mappingToDeleteDetach && userConfirmed) {
            requestDeleteMapping(mappingToDeleteDetach.content_type)
        }

        setMappingToDeleteDetach(undefined)

    }

    // ===============================
    // JSON TREE
    // ===============================

    const JSONTreeTheme = {
        scheme: 'default',
        author: 'chris kempson (http://chriskempson.com)',
        base00: '#181818',
        base01: '#282828',
        base02: '#383838',
        base03: '#585858',
        base04: '#b8b8b8',
        base05: '#d8d8d8',
        base06: '#e8e8e8',
        base07: '#f8f8f8',
        base08: '#ab4642',
        base09: '#dc9656',
        base0A: '#f7ca88',
        base0B: '#a1b56c',
        base0C: '#86c1b9',
        base0D: '#7cafc2',
        base0E: '#ba8baf',
        base0F: '#a16946'
    }


    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" height="100%" direction="column" alignItems="start" gap={2} background="neutral100">
           
            {/* ---------------------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------------------- */}

            <Flex width="100%" justifyContent="space-between" alignItems="start" marginTop="2" marginBottom="2">
                <Flex direction="column" alignItems="start">
                    <Typography variant="alpha">Mappings</Typography>

                    <Box marginTop={2}>
                        { indexUUID && (
                            <Typography variant="pi" textColor="neutral600">Index UUID: { indexUUID }</Typography>
                        )}
                    </Box>
                </Flex>

                <Flex gap={4}>
                    { changesExist && (
                        <>
                            <Icon as={ExclamationMarkCircle} />
                            <Typography variant="sigma">Unsaved changes</Typography>
                            <TextButton onClick={ () => resetForm() }>
                                Reset
                            </TextButton>
                        </>
                    )}

                    <Button onClick={ () => requestUpdateMappings() } variant="secondary" disabled={!changesExist}>
                        Save
                    </Button>
                    <Button onClick={ () => requestSyncIndex() } variant="secondary">
                        Sync
                    </Button>

                </Flex>
            </Flex>


            {/* ---------------------------------------------- */}
            {/* MAIN CONTENT */}
            {/* ---------------------------------------------- */}

            {/* TODO: For Comparison tab, make column heights 100% */}

            <Box width="100%" height="100%" style={{ overflow: 'hidden' }}>

                <TabGroup initialSelectedTabIndex={0} height="100%" style={{ overflow: 'hidden' }}>

                    {/* -------- TABS NAV ------------------*/}
                    <Tabs>
                        <Tab id="mappings">Mappings</Tab>
                        <Tab id="raw_es">Compare to ES</Tab>
                    </Tabs>

                    {/* -------- TAB PANELS ------------------*/}
                    <TabPanels height="100%" style={{height: '100%'}}>

                        {/* ============================================== */}
                        {/* -------- TAB PANEL: MAPPINGS ------------------*/}
                        {/* ============================================== */}

                        <TabPanel id="mappings">

                            <Flex direction="column" alignItems="start" gap={4} width="100%" style={{ overflow: 'hidden' }} padding={4} background="neutral0" shadow="filterShadow">

                                { contentTypes && accordionStates && Object.keys(contentTypes).map((contentType, i) => {
                                    return (

                                        <Box width="100%" key={'contentLoop-'+i}>

                                            { (!mappings || !mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)) && (
                                                <Flex width="100%" gap={4} justifyContent="space-between" alignItems="center" key={i} padding={2}>
                                                    <Flex style={{width: '3rem'}} width="100%" justifyContent="center">
                                                        <Typography variant="sigma" textColor="neutral500">-</Typography>
                                                    </Flex>

                                                    <Box flex="1">
                                                        { contentType }
                                                    </Box>

                                                    <Flex gap={4}>
                                                        <Button onClick={ () => requestCreateMapping(contentType) } variant="tertiary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                                            Create mapping
                                                        </Button>
                                                        <Button onClick={ () => modalSelectPresetMappingOpen(contentType) } variant="tertiary" style={{ whiteSpace: 'nowrap' }} startIcon={<Relation />}>
                                                            Use preset mapping
                                                        </Button>
                                                    </Flex>
                                                </Flex>
                                            )}

                                            { (mappings && mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)) && (

                                                <Accordion expanded={accordionStates.find( (x:any) => x.content_type === contentType).open}>
                                                    <Flex width="100%" gap={4} justifyContent="space-between" alignItems="center" padding={2} onClick={ () => toggleAccordion(contentType)} style={{ cursor:'pointer' }}>
                                                        <Box style={{width: '3rem'}}>
                                                            <Switch
                                                                // TODO: We want something like this, but there's a warning and also looks like Strapi switch doesn't have a disabled state yet.
                                                                //disabled={ mappings.includes( (x:Mapping) => x.content_type && x.content_type === key ) }
                                                                selected={ mappings.find( (x:Mapping) => x.content_type && x.content_type === contentType )?.disabled ? false : true }
                                                                onClick={ (e:Event) => { e.stopPropagation(); toggleMappingActive(contentType)} }
                                                                onLabel = 'On'
                                                                offLabel = 'Off'
                                                            />                                                        
                                                        </Box>

                                                        <Flex flex="1" gap={4}>
                                                            {/* TODO: How we get the count of fields seeems like it can be done way more elgantly, but it's what works for now. */}
                                                            <Typography variant="beta">{ contentType }</Typography>
                                                            <Typography variant="sigma" textColor="neutral700">
                                                                { mappings.find( (x:Mapping) => x.content_type && x.content_type === contentType )?.fields
                                                                ?   "("
                                                                    + Object.keys(mappings.find( (x:Mapping) => x.content_type && x.content_type === contentType )?.fields!).length
                                                                    + ' '
                                                                    + (Object.keys(mappings.find( (x:Mapping) => x.content_type && x.content_type === contentType )?.fields!).length === 1 ? 'field' : 'fields')
                                                                    + ')'
                                                                : ''
                                                                }
                                                            </Typography>
                                                        </Flex>

                                                        <Flex alignItems="end" gap={2}>
                                                            {!accordionStates.find( (x:any) => x.content_type === contentType).open && (
                                                                <IconButton label="Open" borderWidth={0} icon={<ChevronRight />} />    
                                                            )}
                                                            {accordionStates.find( (x:any) => x.content_type === contentType).open && (
                                                                <IconButton label="Close" borderWidth={0} icon={<ChevronDown />} />    
                                                            )}

                                                            <IconButton onClick={ (e:Event) => modalDeleteDetachMappingOpen(mappings.find( (x:Mapping) => x.content_type && x.content_type === contentType )!, e) } label="Delete" borderWidth={0} icon={<Trash />} />

                                                            {/* { mappings.find((x:Mapping) => x.content_type && x.content_type === key) && (
                                                                <Link to={`/plugins/${pluginId}/indexes/${indexUUID}/mappings/${getMapping(key)?.uuid}`}>
                                                                    <Button variant="default" style={{ whiteSpace: 'nowrap', color:'white' }} startIcon={<Pencil />}>
                                                                        Edit mapping
                                                                    </Button>
                                                                </Link>
                                                            )} */}
                                                        </Flex>
                                                    </Flex>

                                                    <AccordionContent>
                                                        <Flex padding={4} direction="column" gap={4} alignItems="start">
                                                            <Typography variant="pi" textColor="neutral600">
                                                                Mapping UUID: {mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)?.uuid}
                                                            </Typography>

                                                            { mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)?.preset && (
                                                                <Flex gap={4}>
                                                                    <Typography variant="sigma" textColor="neutral700">
                                                                        Preset mapping
                                                                    </Typography>
                                                                    <Link to={`/plugins/${pluginId}/mappings/${mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)?.uuid}`}>
                                                                        <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Pencil />}>
                                                                            Edit Preset Mapping
                                                                        </Button>
                                                                    </Link>
                                                                </Flex>
                                                            )}
                                                        </Flex>
                                                        <MappingFields
                                                            disableEditing={mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)?.preset ? true : undefined}
                                                            key={'contentLoopFields-'+i+'key'}
                                                            contentType={contentTypes[contentType]}
                                                            mapping={mappings.find((x:Mapping) => x.content_type && x.content_type === contentType)}
                                                            mappingUpdated={(e:Mapping) => mappingUpdated(contentType, e)}
                                                        />                                                    
                                                    </AccordionContent>

                                                </Accordion>
                                            )}

                                        </Box>

                                    )
                                })}

                            </Flex>

                        </TabPanel>

                        {/* ============================================== */}
                        {/* -------- TAB PANEL: ES MAPPING --------------- */}
                        {/* ============================================== */}
                        <Box height="100%">
                            <TabPanel id="raw_es" height="100%" style={{height: '100%'}}>
                                <Flex width="100%" height="100%" gap={4} alignItems="start" style={{ overflow: 'hidden' }} background="neutral0" shadow="filterShadow">

                                    <Box height="100%" flex="1" padding={4} background="neutral0" shadow="filterShadow">
                                        <Typography variant="beta">Local raw mappings</Typography>
                                        {/* <Box marginTop={2}>
                                            <Typography variant="delta">
                                                This is what the raw mapping output will look like when applied to an index Elasticsearch instance.
                                                Keep in mind, in that ES index, you may see other fields if additional mappings have been applied to it.
                                            </Typography>
                                        </Box> */}
                                        { mappings && Array.isArray(mappings) && mappings.length > 0 && (
                                            <Box marginTop={4} background="secondary100">
                                                { !rawMappingsCombined && (
                                                    <>(Please apply some mappings)</>
                                                )}
                                                {/* { rawMappingsCombined && (
                                                    <pre>{ JSON.stringify(rawMappingsCombined, null, 8) }</pre>
                                                )} */}
                                                <JSONTree data={ rawMappingsCombined } theme={JSONTreeTheme} invertTheme={true} />
                                            </Box>
                                        )}
                                    </Box>

                                    <Box height="100%" flex="1" padding={4} background="neutral0" shadow="filterShadow">
                                        <Typography variant="beta">External ES mappings</Typography>
                                        {/* <Box marginTop={2}>
                                            <Typography variant="delta">
                                                The current mapping as it exists on the ES index.
                                            </Typography>
                                        </Box> */}
                                        <Box marginTop={4} background="secondary100">
                                            { !ESMapping && (
                                                <>(No mapping found on ES index)</>
                                            )}
                                            { ESMapping && (

                                                // KEEP FOR NOW; old way showing static <pre>
                                                // <pre>{ JSON.stringify(Object.values(ESMapping)[0].mappings.properties, null, 8) }</pre>

                                                // TODO: In below data= prop we're inline casting type as any to satisfy TS warnings. Is there a better way? How to do this properly?
                                                // TODO: Below we simply want the 'light' default theme but so far we have to pass a full theme object to allow for invertTheme to work. It's stupid and messy.
                                                <JSONTree data={ rawMappingsES } theme={JSONTreeTheme} invertTheme={true} />
                                            )}
                                        </Box>
                                    </Box>


                                </Flex>

                                
                            </TabPanel>
                        </Box>

                    </TabPanels>
                </TabGroup>

            </Box>


            {/* ---------------------------------------------- */}
            {/* MODAL: SELECT PRESET MAPPING */}
            {/* ---------------------------------------------- */}
            { showSelectPresetMappingModal && (
                <ModalLayout onClose={() => setShowSelectPresetMappingModal(false)}>
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Select preset mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Box width="100%">
                            <Mappings showOnlyPresets={true} type={desiredPresetType} modeOnlySelection={true}
                            mappingHasBeenSelected={ (mapping:Mapping) => modalSelectPresetMappingClose(mapping) } />
                        </Box>                        
                    </ModalBody>
                </ModalLayout>
            ) }

            {/* ---------------------------------------------- */}
            {/* MODAL: DELETE/DETACH MAPPING */}
            {/* ---------------------------------------------- */}
            { showDeleteDetachMappingModal && (
                <ModalLayout onClose={() => setShowDeleteDetachMappingModal(false)}>
                    <ModalHeader>
                        <Flex direction="column" alignItems="start" gap={4}>
                            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                                { mappingToDeleteDetach && mappingToDeleteDetach.preset ? 'Detach mapping' : 'Delete mapping'}
                            </Typography>
                            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                                { mappingToDeleteDetach?.content_type }
                            </Typography>
                        </Flex>
                    </ModalHeader>
                    <ModalBody>
                        { mappingToDeleteDetach && mappingToDeleteDetach.preset && (
                            <Typography>
                                <p>This preset mapping will be detached from the index.</p>
                                <p>The mapping will still exist as a preset mapping for future use.</p>
                            </Typography>
                        )}
                        { mappingToDeleteDetach && !mappingToDeleteDetach.preset && (
                            <Typography>
                                <p>This mapping will be completely deleted.</p>
                            </Typography>
                        )}
                    </ModalBody>
                    <ModalFooter
                        startActions={<></>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Button onClick={ () => modalDeleteDetachMappingClose(false) } variant="secondary">
                                    Cancel
                                </Button>
                                <Button onClick={ () => modalDeleteDetachMappingClose(true) } variant="primary" style={{ color: 'white' }}>
                                    Ok
                                </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>
            ) }
        </Flex>
    )
}