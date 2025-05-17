/**
 *
 * COMPONENT: Indexes
 *
 */


import { useState, useEffect } from 'react'
import pluginId from '../../pluginId'

import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, FieldInput, Switch, TextButton, Table, Thead, Tbody, Tr, Td, Th, TFooter, Typography, EmptyStateLayout, Checkbox, TabGroup, Tabs, Tab, TabPanels, TabPanel, Field, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import '../../styles/styles.css'

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetIndexes, apiCreateIndex, apiDeleteIndex, apiGetESIndexes } from '../../utils/apiUrls'
import { useHistory } from "react-router-dom"

import { RegisteredIndex } from "../../../../types"


// NOTE: The "Indexes" component exists simply for file consistency, even though it will only ever have one instance (the main Indexes page).

export const ComponentIndexes = () => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [indexes, setIndexes] = useState<Array<RegisteredIndex>>()
    const [ESIndexes, setESIndexes] = useState<Array<string>>()
    const history = useHistory()
    const showNotification = useNotification()

    useEffect(() => {
        requestGetRegisteredIndexes()
    }, [])

    // ===============================
    // API REQUESTS
    // ===============================

    const handleAPIerror = (context:string, payload:any, inhibitUINotification?: boolean) => {
        const message = payload.response.data.error.message ? payload.response.data.error.message : payload
        console.log(`COMPONENT Indexes - ${context} error: ${message}`)
        if (!inhibitUINotification) {
            showNotification({
                type: "warning", message: "Error: " + message, timeout: 5000
            })
        }
    }

    const requestGetRegisteredIndexes = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetIndexes)
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setIndexes(response.data)
            } else {
                setIndexes(undefined)
            }
        })
        .catch((error) => {
            handleAPIerror('requestGetRegisteredIndexes', error, true)
        })
        .finally(() => {
            setIsInProgress(false)
        })
    } 

    const requestCreateIndex = (indexName:string, usePrepend?:boolean, addToExternalIndex?:boolean) => {
        setIsInProgress(true)        
        return axiosInstance.post(apiCreateIndex, {
            data: {
                indexName: indexName,
                usePrepend: usePrepend,
                addToExternalIndex: addToExternalIndex
            }
        })
        .catch((error) => {
            handleAPIerror('requestCreateIndex', error)
        })
        .finally(() => {
            setIsInProgress(false)
            requestGetRegisteredIndexes()
        })
    }

    const requestGetESIndexes = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetESIndexes)
        .then((response) => {
            if (response.data && Object.keys(response.data).length > 0) {
                setESIndexes(Object.keys(response.data))
            } else {
                setESIndexes(undefined)
            }
        })
        .catch((error) => {
            handleAPIerror('requestGetESIndexes', error)
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestDeleteIndex = async () => {
        setModalDeleteIndexShow(false)

        if (indexToBeDeleted) {
            setIsInProgress(true)
            await axiosInstance.post(apiDeleteIndex, {
                data: {
                    indexUUID: indexToBeDeleted.uuid,
                    deleteIndexInElasticsearch: deleteFromElasticsearch
                }
            })
            .catch((error) => {
                handleAPIerror('requestDeleteIndex', error)
            })
            .finally(() => {
                setIsInProgress(false)
                requestGetRegisteredIndexes()
            })
        }
    }

    // ===============================
    // CREATE REGISTERED INDEX / ADD EXISTING INDEX
    // ===============================
    const [modalCreateIndexShow, setModalCreateIndexShow] = useState<boolean>(false)
    const [modalRegisterExistingIndexShow, setModalRegisterExistingIndexShow] = useState<boolean>(false)
    const [newIndexName, setNewIndexName] = useState<string>('')
    const [addToElasticsearch, setAddToElasticsearch] = useState<boolean>(true)
    const [useNamePrepend, setUseNamePrepend] = useState<boolean>(false)
    const namePrepend = "strapi_es_plugin_"

    const modalCreateOpen = () => {
        setNewIndexName('')
        setUseNamePrepend(false)
        setModalCreateIndexShow(true)
    }

    const modalRegExistingIndexOpen = async () => {
        setNewIndexName('')
        console.log("modalRegExistingIndexOpen 111")
        await requestGetESIndexes()
        console.log("modalRegExistingIndexOpen 222")
        setModalRegisterExistingIndexShow(true)
    }

    const createIndexActual = () => {
        setModalCreateIndexShow(false)
        //const name = useNamePrepend ? namePrepend + newIndexName : newIndexName
        requestCreateIndex(newIndexName, useNamePrepend, addToElasticsearch)
    }

    const registerExistingIndexActual = () => {
        setModalRegisterExistingIndexShow(false)
        requestCreateIndex(newIndexName)
    }


    // ===============================
    // DELETE REGISTERED INDEX
    // ===============================
    const [modalDeleteIndexShow, setModalDeleteIndexShow] = useState<boolean>(false)
    const [indexToBeDeleted, setIndexToBeDeleted] = useState<RegisteredIndex>()
    const [deleteFromElasticsearch, setDeleteFromElasticsearch] = useState<boolean>(false)

    const modalDeleteOpen = (e:Event, indexToBeDeleted:RegisteredIndex) => {
        e.stopPropagation()
        setIndexToBeDeleted(indexToBeDeleted)
        setDeleteFromElasticsearch(false)
        setModalDeleteIndexShow(true)
    }


    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" height="100%" direction="column" alignItems="start" gap={4} background="neutral100">

            {/* ---------------------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------------------- */}
            <Flex width="100%" justifyContent="space-between" alignItems="start" marginTop={2} marginBottom={2}>
                <Box flex="1">
                    <Typography variant="alpha" style={{ whiteSpace:"nowrap"}}>Registered Indexes</Typography>
                </Box>

                <Flex gap={4}>
                    <Button variant="secondary" onClick={ () => modalCreateOpen() } startIcon={<Plus />}>Create Index</Button>
                    <Button variant="secondary" onClick={ () => modalRegExistingIndexOpen() } startIcon={<Plus />}>Register Existing Index</Button>
                </Flex>
            </Flex>

            {/* ---------------------------------------------- */}
            {/* CONTENT */}
            {/* ---------------------------------------------- */}
            <Box width="100%">
                { (!indexes || (indexes && indexes.length) === 0) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any registered indexes yet..." action={
                        <Flex gap={4}>
                            <Button variant="secondary" onClick={ () => modalCreateOpen() } startIcon={<Plus />}>Create Index</Button>
                            <Button variant="secondary" onClick={ () => modalRegExistingIndexOpen() } startIcon={<Plus />}>Register Existing ES Index</Button>
                        </Flex>
                    } />
                )}

                { indexes && Array.isArray(indexes) && indexes.length > 0 && (
                    <>
                    <Table colCount={7} rowCount={indexes.length} width="100%">
                    {/* footer={<TFooter icon={<Plus />}>Add another field to this content type</TFooter>} */}
                        <Thead>
                            <Tr>
                                <Th>
                                    <Checkbox aria-label="Select all entries" className="checkbox" />
                                </Th>
                                <Th>
                                    <Typography variant="sigma">UUID</Typography>
                                </Th>
                                <Th>
                                {/* action={<IconButton label="Sort on ID" borderWidth={0}>
                                        <CaretDown />
                                    </IconButton>} */}
                                    <Typography variant="sigma">ES Index Name</Typography>
                                </Th>
                                {/* <Th>
                                    <Typography variant="sigma">Name</Typography>
                                </Th> */}
                                <Th>
                                    <Typography variant="sigma">Alias</Typography>
                                </Th>
                                <Th width={50}>
                                    <Typography variant="sigma">Mappings</Typography>
                                </Th>
                                {/* <Th width={50}>
                                    <Typography variant="sigma">Raw Mapping</Typography>
                                </Th> */}
                                <Th>
                                    <Typography variant="sigma">Active</Typography>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            { indexes.map((indexItem, indexCount) => {
                                return (
                                    <Tr key={indexCount} className="row" onClick={ () => history.push(`/plugins/${pluginId}/indexes/${indexItem.uuid}`) }>
                                        <Td>
                                            <Checkbox aria-label={`Select ${indexItem.index_name}`} className="checkbox" />
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{indexItem.uuid}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{indexItem.index_name}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{indexItem.index_alias}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{indexItem.mappings && indexItem.mappings.length > 0 ? indexItem.mappings.length : ''}</Typography>
                                        </Td>
                                        {/* <Td>
                                            <Typography textColor="neutral600">?</Typography>
                                        </Td> */}
                                        <Td>
                                            <Typography textColor="neutral600">{indexItem.active ? 'Yes':''}</Typography>
                                        </Td>
                                        <Td>
                                            <Flex alignItems="end" gap={2}>
                                                <IconButton label="Edit" borderWidth={0} icon={<Pencil />} />                                                  
                                                <IconButton onClick={(e:Event) => modalDeleteOpen(e, indexItem)} label="Delete" borderWidth={0} icon={<Trash />} />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                        </Tbody>
                    </Table>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Typography textColor="neutral600">This view lists registered indexes (in the context of this plugin).</Typography>
                    </Box>
                    </>
                )}
            </Box>


            {/* ---------------------------------------------- */}
            {/* MODAL: CREATE INDEX */}
            {/* ---------------------------------------------- */}
            { modalCreateIndexShow && (
                <ModalLayout onClose={() => setModalCreateIndexShow(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Create a Registered Index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Flex direction="column" alignItems="start" gap={4} width="100%">
                                <Typography as="h2" variant="beta">Index name</Typography>
                                <>
                                    Decide on a name that's concise, descriptive and unique enough to recognizeable in an ES instance.
                                </>
                                <Flex gap={4} alignItems="end" width="100%">

                                    <Box width="100%">
                                        <TextInput value={newIndexName} onChange={ (e:Event) => setNewIndexName((e.target as HTMLInputElement).value) }
                                        label="New index name"
                                        placeholder="Enter a new index name, e.g. 'myWebsite_testIndex'"
                                        name="newIndexName"
                                        pattern="[-a-zA-Z0-9_\.]+" />
                                    </Box>
                                </Flex>
                                <Flex gap={4}>
                                    <Checkbox aria-label="Add prepend text" className="checkbox" checked={useNamePrepend} onChange={ () => setUseNamePrepend(!useNamePrepend) } />
                                    <Box onClick={ () => setUseNamePrepend(!useNamePrepend) } cursor="pointer">Prepend with "{namePrepend}"</Box>
                                </Flex>
                            </Flex>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography as="h2" variant="beta">Optional: Create index in Elasticsearch instance</Typography>
                                <Typography variant="delta">
                                    By default, the plugin will attempt to create this index in the connected Elasticsearch instance.
                                    You may turn this off and do this step later via the plugin UI.
                                </Typography>
                                <Flex gap={4}>
                                    <>Create index in ES instance?</>
                                    <Switch
                                        onClick={ () => setAddToElasticsearch(!addToElasticsearch) }
                                        selected={ addToElasticsearch ? true : null }
                                        visibleLabels
                                        onLabel = 'Yes'
                                        offLabel = 'No'
                                    />
                                </Flex>
                            </Flex>
                        </Flex>
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setModalCreateIndexShow(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Flex>
                                    {useNamePrepend && (<>{namePrepend}</>) }
                                    {newIndexName}
                                </Flex>
                                <Button onClick={ () => createIndexActual() } disabled={!newIndexName} variant="primary">
                                    {addToElasticsearch && (<>Create index & add to Elasticsearch</>)}
                                    {!addToElasticsearch && (<>Create index</>) }
                                </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>
            )}

            {/* ---------------------------------------------- */}
            {/* MODAL: REGISTER EXISTING ES INDEX */}
            {/* ---------------------------------------------- */}
            { modalRegisterExistingIndexShow && (
                <ModalLayout onClose={() => setModalRegisterExistingIndexShow(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Register existing index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>

                        <Box width="100%">

                        {/* style={{ height: '200px', overflow: 'hidden'}} */}
                            <TabGroup initialSelectedTabIndex={0} width="100%" height="100%" style={{ 
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',

                                // TODO: Fix this.
                                // We want proper overflow scrolling on a nested list.
                                // After tons of wrestling, still do not have a good situation.
                                // For now applying "50vh" and the correct regions seem to over flow,
                                // however the list is cut-off at the bottom.
                                height: '50vh'
                            }}>

                                {/* -------- TABS ACTUAL ------------------*/}
                                <Tabs>
                                    <Tab id="typeName">Input a Name</Tab>
                                    <Tab id="chooseFromList">Select from List</Tab>
                                </Tabs>

                                <TabPanels style={{ overflow: 'hidden' }}>

                                    <TabPanel id="typeName">
                                    {/* style={{ overflow: 'auto', height: "100%" }} */}
                                        {/* -------- TAB: TYPE NAME ------------------*/}
                                        <Flex direction="column" alignItems="start" gap={8} padding={1} width="100%" style={{ width: "100%", flex: '1' }}>
                                            <Box padding={2}>
                                                Input the name of an existing Elasticsearch index.
                                            </Box>
                                            <Box width="100%">
                                                <TextInput value={newIndexName}
                                                onChange={ (e:Event) => setNewIndexName((e.target as HTMLInputElement).value) }
                                                label="Index name" placeholder="Enter index name" name="Index name field" />
                                            </Box>
                                        </Flex>
                                    </TabPanel>
                                    
                                    {/* -------- TAB: SELECT FROM LIST ------------------*/}
                                    <TabPanel id="chooseFromList" style={{ overflow: 'hidden', height: "100%" }}>
                                        <Box padding={2}>
                                            Select from a list of indexes returned from the Elasticsearch instance.
                                        </Box>
                                        <Flex direction="column" alignItems="start" gap={4} padding={2} style={{ overflow: 'auto',  height: "100%"}}>
                                            { ESIndexes && ESIndexes.map((data, index) => {
                                                return (
                                                    <TextButton key={index} onClick={ () => setNewIndexName(data) }>
                                                        { data }
                                                    </TextButton>
                                                )
                                            }) }
                                        </Flex>
                                    </TabPanel>
                                </TabPanels>
                            </TabGroup>
                        </Box>
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setModalRegisterExistingIndexShow(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <>{newIndexName}</>
                                <Button disabled={!newIndexName} onClick={ () => registerExistingIndexActual() } variant="primary">
                                    Register index
                                </Button>
                            </Flex>
                        }
                    />
                </ModalLayout>
            )}


            {/* ---------------------------------------------- */}
            {/* MODAL: DELETE INDEX REGISTRATION */}
            {/* ---------------------------------------------- */}
            { modalDeleteIndexShow && (
                <ModalLayout onClose={() => setModalDeleteIndexShow(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Delete registered index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Typography as="h2" variant="beta">Delete registered index</Typography>

                            <Box>
                                <p>This will delete the registered index and any direct mappings it has.</p>
                                <p>Any preset mappings linked to it will be untouched.</p>
                            </Box>

                            { indexToBeDeleted && ESIndexes && ESIndexes.includes(indexToBeDeleted.uuid) && (
                                <Flex gap={4}>
                                    <p>The registered index seems to also exist on the ES instance.</p>
                                    <p>Delete the index in the Elasticsearch instance as well?</p>
                                    <Switch
                                        onClick={ () => setDeleteFromElasticsearch(!deleteFromElasticsearch) }
                                        selected={ deleteFromElasticsearch ? true : null }
                                        visibleLabels
                                        onLabel = 'Yes'
                                        offLabel = 'No'
                                    />
                                </Flex>
                            )}

                            { indexToBeDeleted && (!ESIndexes || ESIndexes && !ESIndexes.includes(indexToBeDeleted.uuid)) && (
                                <Flex gap={4}>
                                    <p>No changes will be made to the actual ES index.</p>
                                </Flex>
                            )}

                        </Flex>
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setModalDeleteIndexShow(false)} variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Button onClick={ () => requestDeleteIndex() } variant="primary">
                                    Delete the registered index
                                </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>
            )}

        </Flex>

    )
}