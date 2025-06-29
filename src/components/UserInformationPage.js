import TextField from "@mui/material/TextField";
import React from "react";


const UserInformationPage = () => {
    const [name, setName] = React.useState("");
    const [nameError, setNameError] = React.useState("");

    return (
        <div>
            <TextField
                type="text"
                autoComplete="off"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                }}
                label={"Name"}
                variant="outlined"
                error={!!nameError}
                helperText={nameError ? nameError : ""}
            />
        </div>
    );
}

export default UserInformationPage;