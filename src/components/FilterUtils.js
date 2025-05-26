
export function removeFromSelectedItems(selectedItems, setSelectedItems) {
    return (index) => {
        setSelectedItems(selectedItems => selectedItems.filter((_, i) => i !== index));
    }
}

export function isItemChecked(selectedItems) {
    return (item) => {
        console.log("Check, ", item?.name, selectedItems?.some((selectedItem) => selectedItem?.id === item?.id));
        return selectedItems?.some((selectedItem) => selectedItem?.id === item?.id);
    }
}

export function changeItemCheckedValue(selectedItems, setSelectedItems) {
    const isItemInFilter = isItemChecked(selectedItems);
    return (item, isChecked) => {
        console.log(isChecked, item);
        if(isChecked) {
            if(!isItemInFilter(item))
                setSelectedItems((prevItems) => [...prevItems, item]);
        } else {
            setSelectedItems((prevItems) => prevItems.filter((i) => i?.id !== item?.id));
        }
    }
}