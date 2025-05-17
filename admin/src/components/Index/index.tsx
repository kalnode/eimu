/**
 *
 * COMPONENT: Index
 *
 */

import { useEffect, useState, useMemo } from 'react'
import pluginId from '../../pluginId'
import { Checkbox, Link, Box, Button, Tooltip, Icon, Typography, RadioGroup, Radio, ModalLayout, ModalHeader, ModalFooter, ModalBody, ToggleInput, TextButton, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiUpdateIndex, apiCloneESIndex, apiRebuildESIndex, apiSyncIndex, apiGetMappings, apiDeleteESIndex, apiGetIndex, apiCreateESindex, apiIndexRecords } from '../../utils/apiUrls'
import axiosInstance from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'
import { RegisteredIndex, Mapping, MappingField, mappingTypes } from "../../../../types"
import { Information } from '@strapi/icons'

type Props = {
    indexUUID: string
}

export const Index = ({ indexUUID }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [disableFormControls, setDisableFormControls] = useState<boolean>(false)
    const showNotification = useNotification()

    const [mappings, setMappings] = useState<Array<Mapping>>()
    const [indexOriginal,setIndexOriginal] = useState<RegisteredIndex>()
    const [index,setIndex] = useState<RegisteredIndex>()
    const indexChangesExist = useMemo(() => JSON.stringify(index) != JSON.stringify(indexOriginal), [index])
    
    const [showModal_changeNameAlias, setShowModal_changeNameAlias] = useState<boolean>(false)
    const [showModal_dynamicMapping, setShowModal_dynamicMapping] = useState<boolean>(false)
    const [showModal_deleteIndex, setShowModal_deleteIndex] = useState<boolean>(false)
    const [showModal_cloneIndex, setShowModal_cloneIndex] = useState<boolean>(false)
    const [showModal_rebuildIndex, setShowModal_rebuildIndex] = useState<boolean>(false)

    const [newIndexName, setNewIndexName] = useState<string>('')
    const [useNamePrepend, setUseNamePrepend] = useState<boolean>(false)
    const namePrepend = "strapi_es_plugin_"

    const resetForm = () => {
        setIndex(indexOriginal)
    }

    const resetNewName = () => {
        setNewIndexName('')
        setUseNamePrepend(false)
    }

    useEffect(() => {
        if (indexUUID) {
            requestGetIndex()
            requestGetMappings()
        }
    }, [])

    useEffect(() => {
        setDisableFormControls(isInProgress)
    }, [isInProgress])

    // ===============================
    // API REQUESTS
    // ===============================

    const handleAPIerror = (context:string, payload:any, inhibitUINotification?: boolean) => {
        const message = payload.response.data.error.message ? payload.response.data.error.message : payload
        console.log(`COMPONENT Index - ${context} error: ${message}`)
        showNotification({
            type: "warning", message: "Error: " + message, timeout: 5000
        })
    }

    const requestGetIndex = async () => {
        if (indexUUID) {
            setIsInProgress(true)
            await axiosInstance.get(apiGetIndex(indexUUID))
            .then( (response) => {
                setIndexOriginal(response.data)
                setIndex(response.data)
            })
            .catch((error) => {
                handleAPIerror('requestGetIndex', error)
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestCreateIndexOnES = async () => {
        if (indexUUID) {
            setIsInProgress(true)
            await axiosInstance.get(apiCreateESindex(indexUUID))
            .then( (response) => {
                showNotification({
                    type: "success", message: response.data, timeout: 5000
                })
            })
            .catch((error) => {
                handleAPIerror('requestCreateIndexOnES', error)
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestDeleteIndexOnES = async () => {
        if (index) {
            setIsInProgress(true)
            await axiosInstance.get(apiDeleteESIndex(index.index_name))
            .then( (response) => {
                showNotification({
                    type: "success", message: "Index deleted on ES instance", timeout: 5000
                })
            })
            .catch((error) => {
                handleAPIerror('requestDeleteIndexOnES', error)
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestRebuildIndexOnES = async (newNameForRebuiltIndex:string) => {
        if (index && newNameForRebuiltIndex) {
            setIsInProgress(true)
            await axiosInstance.post(apiRebuildESIndex, {
                data: {
                    indexName: index.index_name,
                    targetName: newNameForRebuiltIndex
                }
            })
            .then( (response) => {
                showNotification({
                    type: "success", message: "Index re-built on ES instance", timeout: 5000
                })
            })
            .catch((error) => {
                handleAPIerror('requestRebuildIndexOnES', error)
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestCloneIndexOnES = async (newNameForClonedIndex:string) => {
        if (index && newNameForClonedIndex) {
            setIsInProgress(true)
            await axiosInstance.post(apiCloneESIndex, {
                data: {
                    indexName: index.index_name,
                    targetName: newNameForClonedIndex
                }
            })
            .then( (response) => {
                showNotification({
                    type: "success", message: "Index cloned on ES instance", timeout: 5000
                })
            })
            .catch((error) => {
                handleAPIerror('requestCloneIndexOnES', error)
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestIndexAllRecords = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiIndexRecords(indexUUID))
        .then( (response) => {
            if (response.data) {
                return response.data
            }
        })
        .catch((error) => {
            handleAPIerror('requestIndexAllRecords', error)
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestUpdateIndex = async () => {

        if (index && indexChangesExist) {
            setIsInProgress(true)

            let payload:RegisteredIndex = index

            // TODO: Need comment; why are we doing this?
            delete payload.mappings
            // TODO: Legacy from db paradigm; keep for now
            //delete payload.createdAt
            //delete payload.updatedAt

            // TODO: Do we need this? Were we only using it for createdAt and updatedAt ?
            //payload = convertEmptyStringsToNulls(payload)

            await axiosInstance.post(apiUpdateIndex(indexUUID), {
                data: payload
            })
            .then( async (response) => {
                if (response.data) {                    
                    setIndexOriginal(response.data)
                    setIndex(response.data)
                }
            })
            .catch((error) => {
                handleAPIerror('requestUpdateIndex', error)
            })
            .finally(() => {
                setIsInProgress(false)
            })

        }
    }

    const requestGetMappings = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetMappings(indexUUID))
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log("Mappings is: ", response.data)
                setMappings(response.data)
            } else {
                setMappings([])
            }
        })
        .catch((error) => {
            handleAPIerror('requestGetMappings', error)
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }


    const requestSyncIndex = async () => {
        setIsInProgress(true)

        await axiosInstance.get(apiSyncIndex(indexUUID))
        .then( (response) => {
            console.log("Sync response is: ", response)
        })
        .catch((error) => {
            handleAPIerror('requestSyncIndex', error)
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const getCountOfActiveFields = (mappings:Array<Mapping>) => {
        
        // TODO: Can we boil this all down to a one-loner, something like...
        //const work = mappings.filter( (x:Mapping) => !x.disabled && (x.fields && Object.keys(x.fields).length > 0 && Object.keys(x.fields).filter( (key:string) => x.fields && x.fields[key] && x.fields[key].active).length))
        // FOR NOW:
        const filteredMappings =  mappings.filter( (x:Mapping) => !x.disabled)
        let countOfField = 0        
        filteredMappings.forEach( (x:Mapping) =>{
            if (x.fields && Object.keys(x.fields).length > 0) {
                for (const [key, value] of Object.entries(x.fields)) {
                    if (value.active) {
                        ++countOfField
                    }
                }
            }
        })
        return countOfField
    }

    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" height="100%" direction="column" alignItems="start" gap={4} background="neutral100">

            { index && (
                <>

                {/* ---------------------------------------------- */}
                {/* HEADER */}
                {/* ---------------------------------------------- */}
                <Flex width="100%" justifyContent="space-between" alignItems="start" marginTop={2}>
                    <Box>
                        <Typography variant="alpha">{ indexUUID ? index.index_name : 'Create Index'}</Typography>

                        <Box marginTop={2}>
                            { indexUUID && (
                                <Typography variant="pi" textColor="neutral600">Index UUID: { indexUUID }</Typography>
                            )}
                        </Box>
                    </Box>

                    <Flex gap={4}>

                        { indexChangesExist && (
                            <>
                                <Icon as={ExclamationMarkCircle} />
                                <Typography variant="sigma">Unsaved changes</Typography>
                                <TextButton onClick={ () => resetForm() }>
                                    Reset
                                </TextButton>
                            </>
                        )}

                        <Button onClick={ () => requestUpdateIndex() } variant="secondary" disabled={!indexChangesExist}>
                            Save
                        </Button>
                        <Button onClick={ () => requestSyncIndex() } variant="secondary">
                            Sync
                        </Button>

                        {/* { indexUUID && (
                            <Flex gap={4}>
                                <Switch
                                onClick={ () => setIndex({...index, active: index.active ? false : true }) }
                                selected={ index.active ? true : null }
                                visibleLabels
                                onLabel = 'On'
                                offLabel = 'Off'
                                />
                                <Tooltip label="On = Triggers activated for specified post types">
                                    <button aria-label="delete">
                                        <Icon as={Information} color="neutral300" variant="primary" aria-hidden focusable={false} />
                                    </button>
                                </Tooltip>
                            </Flex>
                        )} */}

                    </Flex>
                </Flex>


                {/* ---------------------------------------------- */}
                {/* CONTENT */}
                {/* ---------------------------------------------- */}
                <Flex width="100%" direction="column" alignItems="start" gap={4}>

                    <Flex width="100%" background="neutral0" padding={8} shadow="filterShadow" justifyContent="space-apart">
                        <Flex direction="column" alignItems="start" gap={4}>
                            <Box><Typography variant="delta" fontWeight="bold">Index name:</Typography> { index.index_name }</Box>
                            <Box>
                                <Typography variant="delta" fontWeight="bold">Index alias:</Typography>&nbsp;
                                { index.index_alias && (
                                    <>{ index.index_alias }</>
                                )}
                                { !index.index_alias && (
                                    <Typography textColor="neutral300">not defined</Typography>
                                )}
                            </Box>
                        </Flex>

                        {/* TODO: justifyItems="end" doesn't seem to work as a Strapi attribute. For now: using it in style=. */}
                        <Box flex="1" style={{ justifyItems: 'flex-end' }}>
                            <Button variant="secondary" onClick={ () => setShowModal_changeNameAlias(true) }>
                                Change
                            </Button>
                        </Box>
                    </Flex>

                    {/* // ON/OFF SWITCH IN-PAGE */}
                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Box>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography variant="beta">Operational State</Typography>
                                <Typography variant="delta">On = Indexeding of Strapi records will occur, if the records' type matches a type activated in the index mappings.</Typography>
                                <Typography variant="delta">Off = No indexing will occur when Strapi records are updated.</Typography>
                                <Switch
                                    onClick={ () => setIndex({...index, active: index.active ? false : true }) }
                                    selected={ index.active ? true : null }
                                    visibleLabels
                                    onLabel = 'Enabled'
                                    offLabel = 'Disabled'
                                />
                            </Flex>
                        </Box>
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Box>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography variant="beta">Scheduled</Typography>
                                <Typography variant="delta">On = Records will be indexed according to the plugin cron cycle (e.g. once a day).</Typography>
                                <Typography variant="delta">Off = Records will be indexed instantly.</Typography>
                                <Switch
                                    onClick={ () => setIndex({...index, scheduledIndexing: index.scheduledIndexing ? false : true }) }
                                    selected={ index.scheduledIndexing ? true : null }
                                    visibleLabels
                                    onLabel = 'Enabled'
                                    offLabel = 'Disabled'
                                />
                            </Flex>
                        </Box>
                    </Box>

                    <Box width="100%">
                        <Flex height="100%" direction="column" alignItems="start" gap={4}>

                            <Flex gap={4} width="100%" height="100%">
                                
                                <Flex flex="1" direction="column" alignItems="start" justifyContent="space-between" gap={4} background="neutral0" padding={8} shadow="filterShadow">
                                    <Typography variant="beta">Dynamic Mapping</Typography>
                                    <Typography variant="delta">Index-level setting</Typography>
                                    Current: { index.mapping_type ? index.mapping_type : 'false' }

                                    <Button variant="primary" 
                                    onClick={ () => setShowModal_dynamicMapping(true) }
                                    style={{ color:'white' }}>
                                        Change Dynamic Mapping
                                    </Button>
                                </Flex>
                                <Flex flex="1" direction="column" alignItems="start" justifyContent="space-between" gap={4} height="100%" background="neutral0" padding={8} shadow="filterShadow">
                                    <Typography variant="beta">Mappings</Typography>
                                    <p>Current:</p>
                                    <p>Active types: { mappings && mappings.filter( (x:Mapping) => !x.disabled && (x.fields && Object.keys(x.fields).length > 0)).length }</p>
                                    <p>Active fields: { mappings && getCountOfActiveFields(mappings) }</p>
                                    {/* Current fields: { mappings && mappings[0] && mappings[0].fields && Object.keys(mappings[0].fields).filter((x:string) => mappings[0].fields && mappings[0].fields[x] && mappings[0].fields[x].active).length } */}
                                    <Link to={`/plugins/${pluginId}/indexes/${index.uuid}/mappings`}>
                                        <Button variant="primary" disabled={disableFormControls} style={{ color:'white' }}>
                                            Manage Mappings
                                        </Button>
                                    </Link>
                                </Flex>

                            </Flex>

                        </Flex>                        
                    </Box>

                    <Flex direction="column" alignItems="start" gap={4} width="100%" background="neutral0" padding={8} shadow="filterShadow">

                        <Typography variant="beta">ES Actions</Typography>

                        <Button variant="secondary" disabled={disableFormControls} onClick={ () => requestCreateIndexOnES() }>
                            Create index on ES
                            <br />(with current mappings)
                        </Button>

                        <Button variant="secondary" disabled={disableFormControls} onClick={ () => setShowModal_deleteIndex(true) }>
                            Delete index
                        </Button>

                        <Button variant="secondary" disabled={disableFormControls} onClick={ () => {resetNewName();setShowModal_cloneIndex(true)} }>
                            Clone index
                        </Button>

                        <Button variant="secondary" disabled={disableFormControls} onClick={ () => {resetNewName();setShowModal_rebuildIndex(true)} }>
                            Re-build index
                        </Button>

                        <Button variant="secondary" disabled={disableFormControls} onClick={ () => requestIndexAllRecords() }>
                            Index all records
                        </Button>

                    </Flex>
                    
                </Flex>
                </>
            )}


            {/* ---------------------------------------------- */}
            {/* MODAL: CHANGE INDEX NAME/ALIAS */}
            {/* ---------------------------------------------- */}
            { showModal_changeNameAlias && (
                <ModalLayout onClose={() => setShowModal_changeNameAlias(false) }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Change name/alias
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        {/* { index && (
                            <Box width="100%" padding={8}>
                                <TextInput value={ index.index_name ? index.index_name : '' } onChange={ (e:Event) => setIndex({ ...index, index_name: (e.target as HTMLInputElement).value }) } label="Index name" placeholder="Enter index name" name="Index name field" />
                                <TextInput value={ index.index_alias ? index.index_alias : '' } onChange={ (e:Event) => setIndex({ ...index, index_alias: (e.target as HTMLInputElement).value }) } label="Alias name" placeholder="Enter alias name" name="Index alias field" />
                            </Box>
                        )} */}

                        Renaming of an index can only be done in an indirect way, by creating a new index with your desired name. With a new index, settings can be copied over and or indexing of records.
                        Through this plugin you can achieve this by cloning or re-indexing the entire index.

                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setShowModal_changeNameAlias(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Button
                            disabled={disableFormControls}
                            onClick={ () => setShowModal_changeNameAlias(false) } variant="primary">
                                Ok
                            </Button>
                        </>}
                    />
                </ModalLayout>
            ) }

            {/* ---------------------------------------------- */}
            {/* MODAL: DELETE ES INDEX */}
            {/* ---------------------------------------------- */}
            { showModal_deleteIndex && (
                <ModalLayout onClose={() => setShowModal_deleteIndex(false) }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Delete Index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        Proceed to delete the index on ES?
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setShowModal_deleteIndex(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Button
                            disabled={disableFormControls}
                            onClick={ () => {setShowModal_deleteIndex(false);requestDeleteIndexOnES()} } variant="primary">
                                Delete index
                            </Button>
                        </>}
                    />
                </ModalLayout>
            ) }


            {/* ---------------------------------------------- */}
            {/* MODAL: DYNAMIC MAPPING */}
            {/* ---------------------------------------------- */}
            { showModal_dynamicMapping && index && indexOriginal && (
                <ModalLayout onClose={() => {setIndex({...index, mapping_type: indexOriginal.mapping_type as unknown as typeof mappingTypes });setShowModal_dynamicMapping(false)} }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Dynamic Mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        { index && indexOriginal && (
                            <>
                                {/* <Flex direction="column" alignItems="start" gap={4}>
                                    <Typography variant="beta">Mode</Typography>
                                    <Typography variant="beta">Dynamic Mapping</Typography>
                                    <Typography variant="delta">Allow new mapping fields to be automatically added to the index when indexing a document.</Typography>
                                    <Switch
                                        onClick={ () => setIndex({...index, mapping_type: index.mapping_type ? false : true }) }
                                        selected={ index.mapping_type ? true : null }
                                        disabled={disableFormControls}
                                        visibleLabels
                                        onLabel = 'Enabled'
                                        offLabel = 'Disabled'
                                    />
                                </Flex> */}
                                <Flex direction="column" alignItems="start" gap={4}>
                                    <Typography variant="beta">Mapping Mode</Typography>
                                    <RadioGroup
                                        value={ index.mapping_type }
                                        // TODO: Scrutinize this inline typing; basically we want the radio value to only be one of mappingTypes.
                                        onChange={ (e:Event) => setIndex({...index, mapping_type: (e.target as HTMLInputElement).value as unknown as typeof mappingTypes }) }
                                    >
                                        <Flex direction="column" alignItems="start" gap={4}>
                                            <Radio value="false" alignItems="start">
                                                <Flex direction="column" alignItems="start">
                                                    <Typography variant="delta">False (ES default)</Typography>
                                                    <Typography>New fields <i>will not</i> be automatically added to mappings in the ES index (when indexing a document)</Typography>
                                                    (Use cases)
                                                </Flex>
                                            </Radio>
                                            <Radio value="true">
                                                <Flex direction="column" alignItems="start">
                                                    <Typography variant="delta">True</Typography>
                                                    <Typography>New fields <i>will</i> be automatically added to mappings in the ES index (when indexing a document)</Typography>
                                                    (Use cases)
                                                </Flex>
                                            </Radio>
                                            <Radio value="runtime">
                                                <Flex direction="column" alignItems="start">
                                                    <Typography variant="delta">Runtime</Typography>
                                                    <Typography>Mappings will be dynamically determined by ES at query-time</Typography>
                                                    (Use cases)
                                                </Flex>
                                            </Radio>
                                            <Radio value="strict">
                                                <Flex direction="column" alignItems="start">
                                                    <Typography variant="delta">Strict</Typography>
                                                    <Typography>Document indexing will not occur if new fields are introduced</Typography>
                                                    (Use cases)
                                                </Flex>
                                            </Radio>
                                        </Flex>
                                    </RadioGroup>
                                </Flex>
                            </>                    
                        )}
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            { index && indexOriginal && (
                                <Button onClick={ () => {setIndex({...index, mapping_type: indexOriginal.mapping_type as unknown as typeof mappingTypes });setShowModal_dynamicMapping(false)} } variant="secondary">
                                    Cancel
                                </Button>
                            )}
                        </>}
                        endActions={<>
                            <Button
                            disabled={disableFormControls}
                            onClick={ () => setShowModal_dynamicMapping(false) } variant="primary">
                                Done
                            </Button>
                        </>}
                    />
                </ModalLayout>

            ) }



            {/* ---------------------------------------------- */}
            {/* MODAL: CLONE INDEX */}
            {/* ---------------------------------------------- */}
            { showModal_cloneIndex && (
                <ModalLayout onClose={() => setShowModal_cloneIndex(false) }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Clone index on ES
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Flex direction="column" alignItems="start" gap={4} width="100%">
                                <>
                                (Description of ES clone steps)
                                </>
                            </Flex>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography as="h2" variant="beta">Name for new cloned index</Typography>
                                <Typography variant="delta">
                                    The name must be unique and different than the original index.
                                </Typography>
                                <Flex gap={4} alignItems="end" width="100%">
                                    {/* {useNamePrepend && (<>strapi_es_plugin_</>) } */}
                                    <Box width="100%">
                                        <TextInput value={newIndexName} onChange={ (e:Event) => setNewIndexName((e.target as HTMLInputElement).value) } label="New index name" placeholder="Enter a new index name, e.g. 'myWebsite_testIndex'" name="newIndexName" />
                                    </Box>
                                </Flex>
                                <Flex gap={4}>
                                    <Checkbox aria-label="Add prepend text" className="checkbox" checked={useNamePrepend} onChange={ () => setUseNamePrepend(!useNamePrepend) } />
                                    <Box onClick={ () => setUseNamePrepend(!useNamePrepend) } cursor="pointer">Prepend with "{namePrepend}"</Box>
                                </Flex>
                            </Flex>
                        </Flex>
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setShowModal_cloneIndex(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Flex>
                                    {useNamePrepend && (<>{namePrepend}</>) }
                                    {newIndexName}
                                </Flex>
                                <Button
                                disabled={disableFormControls || !newIndexName}
                                onClick={ () => {
                                        if (newIndexName) {
                                            setShowModal_cloneIndex(false)
                                            const newName = useNamePrepend ? namePrepend + newIndexName : newIndexName
                                            requestCloneIndexOnES(newName)
                                        }
                                    }} variant="primary">
                                    Clone index
                                </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>
            ) }

            {/* ---------------------------------------------- */}
            {/* MODAL: REBUILD INDEX */}
            {/* ---------------------------------------------- */}
            { showModal_rebuildIndex && (
                <ModalLayout onClose={() => setShowModal_rebuildIndex(false) }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Re-build ES index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Flex direction="column" alignItems="start" gap={4} width="100%">
                                <>
                                (Description of ES re-build steps)
                                </>
                            </Flex>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography as="h2" variant="beta">Name for newly re-built index</Typography>
                                <Typography variant="delta">
                                    The name must be unique and different than the original index.
                                </Typography>
                                <Flex gap={4} alignItems="end" width="100%">
                                    <Box width="100%">
                                        <TextInput value={newIndexName} onChange={ (e:Event) => setNewIndexName((e.target as HTMLInputElement).value) } label="New index name" placeholder="Enter a new index name, e.g. 'myWebsite_testIndex'" name="newIndexName" />
                                    </Box>
                                </Flex>
                                <Flex gap={4}>
                                    <Checkbox aria-label="Add prepend text" className="checkbox" checked={useNamePrepend} onChange={ () => setUseNamePrepend(!useNamePrepend) } />
                                    <Box onClick={ () => setUseNamePrepend(!useNamePrepend) } cursor="pointer">Prepend with "{namePrepend}"</Box>
                                </Flex>
                            </Flex>
                        </Flex>
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setShowModal_rebuildIndex(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Flex>
                                    {useNamePrepend && (<>{namePrepend}</>) }
                                    {newIndexName}
                                </Flex>
                                <Button
                                disabled={disableFormControls || !newIndexName}
                                onClick={ () => {
                                        if (newIndexName) {
                                            setShowModal_rebuildIndex(false)
                                            const newName = useNamePrepend ? namePrepend + newIndexName : newIndexName
                                            requestRebuildIndexOnES(newName)
                                        }
                                    }} variant="primary">
                                    Re-build index
                                </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>
            ) }

        </Flex>
    )
}