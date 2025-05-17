/**
 *
 * COMPONENT: MappingFields
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import { Box, Button, IconButton, Typography, Link, Icon, ToggleInput, Tooltip, TextInput,  ModalLayout, ModalHeader, ModalFooter, ModalBody, TextButton, Flex, Textarea, Table, Thead, Tbody, Tr, Td, Th, TFooter, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { Pencil, Trash, ExclamationMarkCircle, Plus, Information } from '@strapi/icons'
import { StrapiFieldType, Mapping } from "../../../../types"
import { Mappings } from '../Mappings'
import pluginId from '../../pluginId'

type Props = {
    contentType: StrapiFieldType
    mapping?: Mapping // TODO: Make this optional ? to solve TS warnings in parent of instance, but unsure why? Ideally it's required, not optional!
    mappingUpdated: Function
    disableEditing?: boolean
}

export const MappingFields = ({ contentType, mapping, mappingUpdated, disableEditing }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    // TODO: We use a local state to hold changes and convey to parent via event. Is this unnecessary? 
    const [mappingLocal, setMappingLocal] = useState<Mapping>()

    useEffect(() => {
        // TODO: Scrutinize this. In effect, this is just enabling 2-way binding. Do we need it? Can we do better?
        if (!mappingLocal || (mappingLocal && mappingLocal != mapping)) setMappingLocal(mapping)

        console.log("Mapping fields mounted 111: contentType", contentType)
    }, [mapping])

    useEffect(() => {
        // TODO: Scrutinize this. In effect, this is just enabling 2-way binding. Do we need it? Can we do better?
        if (mappingLocal && mappingLocal != mapping) mappingUpdated(mappingLocal)
    }, [mappingLocal])


    // ===============================
    // FORM STUFF
    // ===============================

    const updateFieldAdd = async (field:string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))

            if (!work.fields){
                work.fields = {}
            }

            if (work.fields[field]) {
                delete work.fields[field]
            } else {
                work.fields[field] = {
                    active: true
                }
            }
            setMappingLocal(work)
        }
    }

    const updateFieldActive = async (field:string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].active = !work.fields[field].active
            setMappingLocal(work) 
        }
    }

    const updateFieldIndex = async (field:string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].index = !work.fields[field].index
            setMappingLocal(work) 
        }
    }

    const updateFieldDataType = async (field: string, type: string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].type = type
            setMappingLocal(work) 
        }
    }

    const updateFieldExternalName = async (field: string, name: string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].externalName = name
            setMappingLocal(work) 
        }
    }


    // ===============================
    // SELECT PRESET MAPPING
    // ===============================
    const [showSelectPresetMappingModal, setShowSelectPresetMappingModal] = useState<boolean>(false)
    const [typeDesiredForPreset, setTypeDesiredForPreset] = useState<string>()
    const [fieldTargetForPreset, setFieldTargetForPreset] = useState<string>()

    const modalSelectPresetMappingOpen = (key:string, fieldValue:StrapiFieldType) => {
        setTypeDesiredForPreset(fieldValue as unknown as string)
        setFieldTargetForPreset(key)
        setShowSelectPresetMappingModal(true)
    }

    const modalSelectPresetMappingClose = async (selectedPresetMapping:Mapping) => {
        setShowSelectPresetMappingModal(false)
        if (selectedPresetMapping && selectedPresetMapping.uuid) {
            if (mappingLocal && mappingLocal.fields && typeDesiredForPreset && fieldTargetForPreset) {
                let work = JSON.parse(JSON.stringify(mappingLocal))
                work.fields[fieldTargetForPreset].preset_uuid = selectedPresetMapping.uuid
                setMappingLocal(work) 
            }
        }
    }

    const removePreset = (fieldName:string) => {
        if (mappingLocal && mappingLocal.fields) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[fieldName].preset_uuid = undefined
            setMappingLocal(work) 
        }
    }

    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" height="100%" direction="column" alignItems="start" gap={4} background="neutral100">

            { contentType && mappingLocal && (

                // TODO: Remove this ts-ignore and fix this typing properly.
                // @ts-ignore
                Object.entries(contentType).map(([fieldName,fieldValue]) => {
                    
                    if ((mappingLocal.fields && mappingLocal.fields[fieldName]) || !disableEditing)

                    return (

                        // TODO: Look into zebra striping the rows, or at least if we're using a border separator, use Strapi UI properly for that
                        <Box  width="100%" key={'field-'+fieldName} style={{borderBottom:'1px solid #CCCCCC'}}>

                            {/* ---------------------------------------------- */}
                            {/* HEADER */}
                            {/* ---------------------------------------------- */}

                            <Flex padding={4} gap={4}>

                                { (mappingLocal.fields && mappingLocal.fields[fieldName]) && (
                                    <Typography variant="beta">
                                        { fieldName }
                                    </Typography>
                                )}
                                { (!mappingLocal.fields || !mappingLocal.fields[fieldName]) && (
                                    <Typography variant="delta">
                                        { fieldName }
                                    </Typography>
                                )}

                                { !disableEditing && (!mappingLocal.fields || (mappingLocal.fields && !mappingLocal.fields[fieldName])) && (
                                    <Button variant="tertiary"
                                    onClick={ () => updateFieldAdd(fieldName) }
                                    // TODO: Can this whiteSpace be a strapi UI attribute?
                                    style={{ whiteSpace: 'nowrap' }}
                                    startIcon={<Plus />}>
                                        Add this field
                                    </Button>                                    
                                )}
                            </Flex>


                            {/* ---------------------------------------------- */}
                            {/* MAIN CONTENT */}
                            {/* ---------------------------------------------- */}

                            { mappingLocal.fields && mappingLocal.fields[fieldName] && (
                                <Box padding={4} style={{paddingTop:'0'}}>

                                    <Flex>
                                        <Box>
                                            <Typography variant="pi" fontWeight={'bold'}>Active</Typography>
                                            <Flex gap={2} alignItems="center">
                                                <Switch
                                                disabled={disableEditing}
                                                selected={ mappingLocal.fields[fieldName].active ? true : false }
                                                onChange={ () => updateFieldActive(fieldName) }                                        
                                                label='Active'
                                                onLabel='Enabled'
                                                offLabel='Disabled' />
                                                <Tooltip label={`Enabled = When a ${mappingLocal.content_type} document is updated, this field will be saved into the ES instance.`}>
                                                    <button aria-label="Tip for Active switch">
                                                        <Icon as={Information} color="neutral300" variant="primary" />
                                                        {/* TODO: Why are these attributes a problem? Re-add them and find out what else we should have here. */}
                                                        {/* aria-hidden focusable={false} */}
                                                    </button>
                                                </Tooltip>
                                            </Flex>
                                        </Box>
                                    </Flex>

                                    { fieldValue.raw_type === 'relation' && (
                                        <>
                                            { mappingLocal.fields[fieldName].preset_uuid && (
                                                <Flex>
                                                    <Flex direction="column" alignItems="start">
                                                        Using preset field
                                                        {/* Preset field is: { mappingLocal.fields[fieldName].preset_uuid } */}
                                                    </Flex>
                                                    <Flex alignItems="end" gap={2}>
                                                        <Link to={`/plugins/${pluginId}/mappings/${mappingLocal.fields[fieldName].preset_uuid}`}>
                                                            <IconButton label="Edit mapping" noBorder icon={<Pencil />} />
                                                        </Link>
                                                        <IconButton onClick={ (e:Event) => removePreset(fieldName) }
                                                        label="Delete" borderWidth={0} icon={<Trash />} />
                                                    </Flex>
                                                </Flex>
                                            )}
                                            { !mappingLocal.fields[fieldName].preset_uuid && (
                                                <Button onClick={ () => modalSelectPresetMappingOpen(fieldName, fieldValue.whole_raw_object.target as unknown as any) }>
                                                    Select preset
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    
                                    { fieldValue.raw_type != 'relation' && (
                                        <Flex gap={6} width='100%'>

                                            <Flex height="100%" gap={4} direction="column" justifyContent="center">
                                                <Box>
                                                    <Typography variant="pi" fontWeight={'bold'}>Index</Typography>
                                                    <Flex gap={2} alignItems="center">                                                    
                                                        <Switch
                                                        disabled={disableEditing}
                                                        selected={ mappingLocal.fields[fieldName].index ? true : false }
                                                        onChange={ () => updateFieldIndex(fieldName) }                                        
                                                        label='Index'
                                                        onLabel='Enabled'
                                                        offLabel='Disabled' />
                                                        <Tooltip label="Enabled = In the ES instance, this field will be indexed, making it searcheable. Disabled = Field is not searcheable, but is better for performance and disk space.">
                                                            <button aria-label="Tip for Index switch">
                                                                <Icon as={Information} color="neutral300" variant="primary" />
                                                                {/* TODO: Why are these attributes a problem? Re-add them and find out what else we should have here. */}
                                                                {/* aria-hidden focusable={false} */}
                                                            </button>
                                                        </Tooltip>
                                                    </Flex>
                                                </Box>
                                            </Flex>

                                            <Flex flex="1" direction="column" justifyContent="start" gap={4}>
                                                <Box width="100%" flex="1">
                                                    <SingleSelect
                                                    disabled={disableEditing}
                                                    label="Data Type"
                                                    placeholder="Select data type" name="Data Type"
                                                    value={ mappingLocal.fields[fieldName].type }
                                                    onChange={ (e:string) => updateFieldDataType(fieldName, e) }>
                                                        <SingleSelectOption value="dynamic">(autodetect)</SingleSelectOption>
                                                        <SingleSelectOption value="binary">Binary</SingleSelectOption>
                                                        <SingleSelectOption value="boolean">Boolean</SingleSelectOption>
                                                        <SingleSelectOption value="keyword">Keyword</SingleSelectOption>
                                                        <SingleSelectOption value="text">Text</SingleSelectOption>
                                                        <SingleSelectOption value="long">Number long</SingleSelectOption>
                                                        <SingleSelectOption value="double">Number double</SingleSelectOption>
                                                        <SingleSelectOption value="date">Date</SingleSelectOption>
                                                        <SingleSelectOption value="geo_point">Geopoint</SingleSelectOption>
                                                        <SingleSelectOption value="nested">Nested</SingleSelectOption>
                                                        <SingleSelectOption value="etc">etc</SingleSelectOption>
                                                    </SingleSelect>
                                                </Box>

                                                <Box width="100%" flex="1">
                                                    <TextInput
                                                    disabled={disableEditing}
                                                    label="Custom field name (in ES)"
                                                    placeholder="Enter custom field name"
                                                    name="Custom field name"
                                                    onChange={ (e:Event) => updateFieldExternalName(fieldName, (e.target as HTMLInputElement).value) }
                                                    value={mappingLocal.fields[fieldName].externalName ? mappingLocal.fields[fieldName].externalName : ''}
                                                    />
                                                </Box>
                                            </Flex>

                                        </Flex>
                                    )}

                                </Box>
                            )}

                        </Box>

                    )

                })

            )}


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
                            <Mappings showOnlyPresets={true} type={typeDesiredForPreset} modeOnlySelection={true}
                            mappingHasBeenSelected={ (mapping:Mapping) => modalSelectPresetMappingClose(mapping) } />
                        </Box>                        
                    </ModalBody>
                </ModalLayout>
            ) }
        </Flex>
    )
}