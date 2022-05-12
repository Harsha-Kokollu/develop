import React, { useState } from "react";
import { Dropdown, DropdownMenuItemType, SearchBox } from "@fluentui/react";
import IntlUtil from "../../../core/helpers/intl-util";
import _ from "lodash";
import { OperatorConnectConstants } from "../settings/operator-connect-constants";

const SearchDropdown = ({
    options,
    onChange,
    onBlur,
    errorMessage,
    id,
    className,
    label,
    required,
    onRenderLabel,
    placeholder,
    defaultSelectedKey,
    componentRef,
    name,
    searchType,
    selectedKey,
    disabled, defaultValue,

}) => {
    const [searchedText, setSearchedText] = useState('');
    const [searchTypeValue] = useState(searchType || OperatorConnectConstants.SEARCH_TYPE.BEGIN_WITH);
    const _intl_ns_oc_common = "oc_common";

    const renderOption = (option) => {
        return <>{(option.itemType === DropdownMenuItemType.Header && option.key === "FilterHeader") ?
            <SearchBox autoFocus={false} onChange={(ev, newValue) => {
                setSearchedText(newValue);
            }} underlined={true} placeholder={IntlUtil.getText(_intl_ns_oc_common, "content.search")} /> : <span className="page-search-dropdown">{option.text}</span>}</>;
    }

    const renderList = () => {
        let optionsList = []

        if (searchTypeValue?.toLowerCase().trim() === OperatorConnectConstants.SEARCH_TYPE.CONTAINS.toLowerCase().trim()) {
            optionsList = options?.map(option => !option.disabled && option?.text?.toLowerCase().indexOf(searchedText?.toLowerCase()) > -1 ?
                option : { ...option, hidden: true }
            )
        }
        else {
            optionsList = options?.map(option => !option.disabled && _.startsWith(option?.text?.toLowerCase(), searchedText?.toLowerCase()) ?
                option : { ...option, hidden: true }
            )
        }
        return optionsList
    }

    const renderSearchDropdown = () => {
        let optionList = renderList();

        return (<>
            <Dropdown

                options={[
                    { key: 'FilterHeader', text: '-', itemType: DropdownMenuItemType.Header },
                    { key: 'divider_filterHeader', text: '-', itemType: DropdownMenuItemType.Divider },
                    ...optionList
                ]}
                label={label}
                onRenderOption={renderOption}
                onDismiss={() => setSearchedText('')}
                onChange={onChange}
                onRenderLabel={onRenderLabel}
                onBlur={onBlur}
                dropdownWidth="auto"
                defaultValue={defaultValue}
                errorMessage={errorMessage}
                className={className}
                required={required}
                id={id}
                name={name}
                disabled={disabled}
                componentRef={componentRef}
                placeholder={placeholder}
                selectedKey={selectedKey}
                //defaultValue={{ key: "", text: "" }}
                defaultSelectedKey={defaultSelectedKey}
            />
        </>)
    }

    return (<>{renderSearchDropdown()}</>)
}


export default SearchDropdown;
