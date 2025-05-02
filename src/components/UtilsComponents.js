"use client"

import React, {useState} from "react";
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
        <div /*className="show-hide-password"*/>
            <TextField
                //name={name}
                //id={name}
                type={!isVisible ? "password" : "text"}
                autoComplete={autocomplete}
                value={value}
                //hintText={placeholder}
                //floatingLabelText={placeholder}
                //placeholder={placeholder}
                onChange={onChange}
                required
                //className="shift-input"
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
                            {/*<AbcTwoToneIcon style={{
                                //fontSize: 18
                            }} sx={{
                                color: "orange",
                                //fontSize: "50px"
                            }}/>*/
                                isVisible ?
                                <VisibilityIcon />
                                : <VisibilityOffIcon />}
                            </IconButton>
                        </InputAdornment>
                    )
                },
                }}
                sx={{
                    //background: "white",
                    /*width: '100%',
                    '& .MuiFilledInput-root': {
                        backgroundColor: 'white'
                    }*/
                }}
            />
        </div>
    );


    /*
    return (
        <div className="show-hide-password">
            <input
                name={name}
                id={name}
                type={!isVisible ? "password" : "text"}
                autoComplete={autocomplete}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                required
                className="shift-input"
            />
            <label htmlFor={name} className="shift-label">{placeholder}</label>
            <span className="icon" onClick={toggle}>
                {isVisible ?
                    <EyeOutlined styles={{
                        fontSize: "inherit",
                    }}/>
                    : <EyeInvisibleOutlined />}
            </span>
        </div>
    );
     */
}

export function ShowHidePassword2({ value, placeholder, onChange }) {
    const [isVisible, setVisible] = useState(false);

    const toggle = () => {
        setVisible(!isVisible);
    };

    return (
        <div className="show-hide-password">
            <input
                type={!isVisible ? "password" : "text"}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                required
            />
            <span className="icon" onClick={toggle}>
                {isVisible ?
                    <EyeOutlined style={{
                        //fontSize: '100cqw',


                        /*containerType: 'inline-size',
                        width: '10%',
                        height: '100%',*/



                        //width: '1em',
                        //height: '1em',
                    }}/>
                    : <EyeInvisibleOutlined />}
            </span>
        </div>
    );
}