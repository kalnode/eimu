/**
 *
 * COMPONENT: Logs
 *
 */

import { useState, useEffect } from 'react'
import pluginId from '../../pluginId'

import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, FieldInput, Switch, TextButton, Table, Thead, Tbody, Tr, Td, Th, TFooter, Typography, EmptyStateLayout, Checkbox, TabGroup, Tabs, Tab, TabPanels, TabPanel, Field, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import '../../styles/styles.css'

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetLogs } from '../../utils/apiUrls'
import { useHistory } from "react-router-dom"

// TODO: Typing for logs?
//import { SomeTypeForLogs } from "../../../../types"

export const ComponentLogs = () => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [logs, setLogs] = useState<Array<any>>()
    const history = useHistory()
    const showNotification = useNotification()

    useEffect(() => {
        requestGetLogs()
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

    const requestGetLogs = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetLogs)
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setLogs(response.data)
            } else {
                setLogs(undefined)
            }
        })
        .catch((error) => {
            handleAPIerror('requestGetRegisteredIndexes', error, true)
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    // TODO: Type this properly
    // const formattedDate = (dateString) => {

    //     const date = new Date(dateString)
    //     const options = {
    //         weekday: 'long',
    //         year: 'numeric',
    //         month: 'numeric',
    //         day: 'numeric',
    //         hour: 'numeric',
    //         minute: 'numeric'
    //     }
        
    //     const dateTimeFormat = new Intl.DateTimeFormat('en-US', options)
    //     const parts = dateTimeFormat.formatToParts(date)
    //     let formattedDate = ''
    
    //     parts.forEach((part) => {
    //         // TODO: make a switch-case thing here?
    //         if (part.type === "weekday")
    //             formattedDate += `${part.value}, `
    //         if (part.type === "day") 
    //             formattedDate += `${part.value}/`
    //         if (part.type === "month") 
    //             formattedDate += `${part.value}/`
    //         if (part.type === "year") 
    //             formattedDate += `${part.value}  `
    //         if (part.type === "hour") 
    //             formattedDate += `${part.value}:`
    //         if (part.type === "minute") 
    //             formattedDate += `${part.value}`       
    //     })
    
    //     return formattedDate
    // }
    

    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" height="100%" direction="column" alignItems="start" gap={4} background="neutral100">

            {/* ---------------------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------------------- */}

            <Flex width="100%" justifyContent="space-between" alignItems="start" marginTop="2" marginBottom="2">
                <Box flex="1">
                    <Typography variant="alpha" style={{ whiteSpace:"nowrap"}}>Recent scheduled-indexing events</Typography>
                </Box>
            </Flex>

            {/* ---------------------------------------------- */}
            {/* CONTENT */}
            {/* ---------------------------------------------- */}
            <Box width="100%">
                { (!logs || (logs && logs.length) === 0) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any registered indexes yet..." action={
                        <Flex gap={4}>
                            No logs

                            To see something here:
                            -Enable scheduled-indexing for any of your registered indexes
                            -Modify any Strapi record that is of a content type that matches a mapping in the registered index
                        </Flex>
                    } />
                )}

                { logs && Array.isArray(logs) && logs.length > 0 && (
                    <>
                    <Table colCount={3} rowCount={logs.length} width="100%">
                    {/* footer={<TFooter icon={<Plus />}>Add another field to this content type</TFooter>} */}
                        <Thead>
                            <Tr>
                                <Th>
                                    <Typography variant="sigma">Date</Typography>
                                </Th>
                                <Th>
                                    <Typography variant="sigma">Status</Typography>
                                </Th>
                                <Th width={50}>
                                    <Typography variant="sigma">Details</Typography>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            { logs.map((logItem, logCount) => {
                                return (
                                    <Tr key={logCount} className="row">
                                        <Td>
                                            {/* TODO: Use formattedDate; needs typing */}
                                            {/* <Typography textColor="neutral600">{formattedDate(logItem.createdAt)}</Typography> */}
                                            <Typography textColor="neutral600">{logItem.createdAt}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{logItem.status}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{logItem.details}</Typography>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                        </Tbody>
                    </Table>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Typography textColor="neutral600">This view lists the details of the 50 recent-most indexing runs.</Typography>
                    </Box>
                    </>
                )}
            </Box>

        </Flex>

    )
}