"use client"

import React, {useEffect, useState} from "react";
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";
import './UtilsComponents.css'
import {IconButton, InputAdornment, TextField} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { SearchOutlinedIcon } from "@mui/icons-material";
import AbcTwoToneIcon from '@mui/icons-material/AbcTwoTone';

export function ShowHidePassword({ name, value, placeholder, onChange, autocomplete }) {
    const [isVisible, setVisible] = useState(false);

    const toggle = () => {
        setVisible(!isVisible);
    };

    return (
        //<div>
            <TextField
                type={!isVisible ? "password" : "text"}
                autoComplete={autocomplete}
                value={value}
                onChange={onChange}
                required
                label={placeholder}
                variant="outlined"

                slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                onClick={toggle}
                            >
                                {isVisible ?
                                    <VisibilityIcon />
                                    : <VisibilityOffIcon />}
                            </IconButton>
                        </InputAdornment>
                    )
                },
                }}
            />
        //</div>
    );
}

export function ImageSwapper({ images, timeout }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    /*
    useEffect(() => {
        const intervalId = setInterval(() => {
            if(currentIndex === images.length - 1) {
                setCurrentIndex(0);
            }
            else {
                setCurrentIndex(currentIndex + 1);
            }
        }, timeout)

        return () => clearInterval(intervalId);
    }, [currentIndex])
*/
    return (
        <div>
            <img src={images[currentIndex]} alt="logo" className="image-swapper"/>
        </div>
    )
}