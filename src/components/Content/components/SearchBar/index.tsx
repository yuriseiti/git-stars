import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import { Container } from "./styles";
import { InputAdornment } from "@material-ui/core";

const SearchBar: React.FC = () => {
    return (
        <Container>
            <TextField
                style={{ width: "100%" }}
                variant="outlined"
                placeholder="Buscar por um repositório"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Button style={{ width: "170px", height: "56px" }} variant="contained" color="primary">
                BUSCAR
            </Button>
        </Container>
    );
};

export default SearchBar;
