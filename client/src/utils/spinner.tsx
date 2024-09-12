import React from "react"
import CircularProgress from "@mui/material/CircularProgress"
import { Center } from "./center"

const Spinner = () => {
  return (
    <Center>
      <CircularProgress color="primary"></CircularProgress>
    </Center>
  )
}

export default Spinner
