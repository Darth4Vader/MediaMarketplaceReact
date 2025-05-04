"use client"

import React, {useEffect, useState} from "react";
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";
import './UtilsComponents.css'
import {IconButton, InputAdornment, TextField} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { SearchOutlinedIcon } from "@mui/icons-material";
import AbcTwoToneIcon from '@mui/icons-material/AbcTwoTone';
import {Link, useSearchParams} from "react-router-dom";

export function ShowHidePassword({ name, value, placeholder, onChange, autocomplete, errorMessage, setErrorMessage }) {
    const [isVisible, setVisible] = useState(false);
    const [mainErrorMessage, setMainErrorMessage] = useState("");

    useEffect(() => {
        console.log("errorMessage");
        setMainErrorMessage(errorMessage);
    }, [errorMessage])

    const toggle = () => {
        setVisible(!isVisible);
    };

    return (
        //<div>
            <TextField
                type={!isVisible ? "password" : "text"}
                autoComplete={autocomplete}
                value={value}
                onChange={(e) => {
                    onChange(e);
                    if(setErrorMessage)
                        setErrorMessage("");
                }}
                required
                label={placeholder}
                variant="outlined"
                error={!!mainErrorMessage}
                helperText={mainErrorMessage ? mainErrorMessage : ""}
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

export function useReturnToParam() {
    const [searchParams, setSearchParams] = useSearchParams();
    return searchParams.get("return_to") || "/";
}

export function AuthLink({ children, to }) {
    const returnTo = useReturnToParam();
    return (
        <Link to={{
            pathname: to,
            search: `?return_to=${returnTo}`
        }}>
            {children}
        </Link>
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