import { useState } from "react"
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
//import AppDivider from "./AppDivider"
import { FaChevronDown } from "react-icons/fa"

interface DropDownMenuProps {
    title: string | any[], items: any[], 
    onItemTitle: (value: any, index?: number) => string | any[], 
    onSelect: (value: any, index?: number) => void, 
    placeholder?: string | any[],
    as?: any, 
    dropBg?: string, dropColor?: string,
    onItemComponent?: (value: any, index?: number) => any,
    [x: string]: any
}
const DropDownMenu: React.FC<DropDownMenuProps> = ({
    as, title, items, 
    onItemTitle, 
    onSelect, onItemComponent,
    dropBg, dropColor, placeholder,
    ...props
}) => {

    const [placeholderSelected, setPlaceHolderSelected] = useState<boolean>(true)

    return (
        <Menu>
            <MenuButton display={"inline-flex"} cursor="pointer" {...props}>
                <HStack as={as || Button}
                justifyContent="center" alignItems="center" whiteSpace="nowrap" 
                textOverflow="ellipsis" overflow="hidden">
                    <Box as="span" aria-label={title as string} title={title as string} 
                    display="inline-flex">
                        {title}
                    </Box> &nbsp;
                    <FaChevronDown />
                </HStack>
            </MenuButton>
            <MenuList bg={dropBg || "inherit"} color={dropColor || "inherit"}>
                {
                    placeholder && placeholderSelected?
                    <MenuItem onClick={() => {
                        setPlaceHolderSelected(true)
                        onSelect(null, -1)
                    }}
                    className="dropdown-item" style={{display: "flex", 
                    justifyContent: "space-between", alignItems: 'center'}}>
                        <Box aria-label={placeholder as string} title={placeholder as string}>
                            {placeholder}
                        </Box>
                    </MenuItem>
                    : null
                }
                {
                    items.map((item, i) => {
                        const itemTitle = onItemTitle(item, i) as string
                        return (
                            <MenuItem onClick={() => {
                                setPlaceHolderSelected(false)
                                onSelect(item, i)
                            }} key={itemTitle} 
                            className="dropdown-item" style={{display: "flex", 
                            justifyContent: "space-between", alignItems: 'center'}}>
                                <Box aria-label={itemTitle} title={itemTitle}>
                                    {onItemComponent? onItemComponent(item) : itemTitle}
                                </Box>
                            </MenuItem>
                        )
                    })
                }
                
                {
                    placeholder && !placeholderSelected?
                    <>
                        {/*<AppDivider dividerDirection={AppDivider.direction.horizontal} />*/}
                        <MenuItem onClick={() => {
                            setPlaceHolderSelected(true)
                            onSelect(null, -1)
                        }}
                        className="dropdown-item" style={{display: "flex", 
                        justifyContent: "space-between", alignItems: 'center'}}>
                            <Box aria-label={placeholder as string} title={placeholder as string}>
                                {placeholder}
                            </Box>
                        </MenuItem>
                    </>
                    : null
                }
            </MenuList>
        </Menu>
    )
}

export default DropDownMenu